/**
 * AI Service — Gemini primary, Groq fallback.
 *
 * Call order:
 *   1. Gemini (gemini-2.0-flash via OpenAI-compat)
 *   2. Groq   (llama-3.3-70b-versatile) — if Gemini returns 429 or is unavailable
 *
 * Set GROQ_API_KEY in server/.env to enable fallback.
 * Get a free key at: https://console.groq.com
 */
import { getGeminiClient, getGroqClient } from '../configs/ai.js';

const GROQ_MODEL = 'llama-3.3-70b-versatile';  // 6000 RPD / 30 RPM free tier

/**
 * Call Gemini. Throws on rate-limit or error.
 */
const callGemini = async (messages, jsonMode = false) => {
    const client = getGeminiClient();
    const params = {
        model: process.env.OPENAI_MODEL || 'gemini-2.0-flash',
        messages,
    };
    if (jsonMode) params.response_format = { type: 'json_object' };
    const res = await client.chat.completions.create(params);
    return res.choices[0].message.content;
};

/**
 * Call Groq (fallback). Throws if no GROQ_API_KEY configured.
 */
const callGroq = async (messages, jsonMode = false) => {
    const client = getGroqClient();
    if (!client) throw new Error('GROQ_API_KEY not configured — cannot use Groq fallback');
    const params = {
        model: GROQ_MODEL,
        messages,
    };
    if (jsonMode) params.response_format = { type: 'json_object' };
    const res = await client.chat.completions.create(params);
    return res.choices[0].message.content;
};

/**
 * Core AI call: try Gemini first, fall back to Groq on 429 / rate-limit.
 */
const aiCall = async (messages, jsonMode = false) => {
    try {
        return await callGemini(messages, jsonMode);
    } catch (primary) {
        const isRateLimit = primary.status === 429 ||
            primary.constructor?.name === 'RateLimitError' ||
            primary.message?.includes('429');
        const isUnavailable = primary.status === 503 || primary.status === 500;

        if (isRateLimit || isUnavailable) {
            const groq = getGroqClient();
            if (groq) {
                console.warn(`[aiService] Gemini ${primary.status || 'error'} — falling back to Groq (${GROQ_MODEL})`);
                return await callGroq(messages, jsonMode);
            }
        }
        throw primary; // re-throw if no fallback available
    }
};

/**
 * Generate a chat completion (Gemini → Groq fallback).
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {{ jsonMode?: boolean }} options
 */
export const generateContent = async (systemPrompt, userPrompt, options = {}) => {
    const { jsonMode = false } = options;
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ];
    return aiCall(messages, jsonMode);
};

/**
 * Parse JSON safely from AI response
 */
export const generateJSON = async (systemPrompt, userPrompt, options = {}) => {
    const raw = await generateContent(systemPrompt, userPrompt, { ...options, jsonMode: true });
    try {
        return JSON.parse(raw);
    } catch {
        // Attempt to extract JSON from response if it has extra text
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        throw new Error('AI returned invalid JSON');
    }
};

/**
 * Build a standardized AI error response
 */
export const handleAIError = (error, res) => {
    const msg = error.message || '';
    const status = error.status;

    console.error('[AI Service Error]', status, msg);

    if (status === 403 || msg.includes('403') || msg.toLowerCase().includes('leaked')) {
        return res.status(503).json({
            message: 'AI service unavailable: API key is invalid or revoked. Please update OPENAI_API_KEY in server/.env'
        });
    }
    if (status === 401 || msg.includes('401')) {
        return res.status(503).json({ message: 'AI service unavailable: Invalid API key.' });
    }
    if (status === 429 || msg.includes('429')) {
        return res.status(503).json({ message: 'AI service rate-limited. Please try again in a moment.' });
    }
    if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) {
        return res.status(504).json({ message: 'AI service timed out. Please try again.' });
    }
    return res.status(500).json({ message: `AI error: ${msg}` });
};
