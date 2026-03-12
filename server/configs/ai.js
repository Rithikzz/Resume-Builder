/**
 * AI provider clients.
 * Primary  : Gemini (via Google's OpenAI-compatible endpoint)
 * Fallback : Groq   (llama-3.3-70b-versatile — high RPM free tier)
 */
import OpenAI from 'openai';
import Groq from 'groq-sdk';

let _gemini = null;
let _groq = null;

/** Returns the Gemini client (OpenAI-compat). */
export const getGeminiClient = () => {
    if (!_gemini) {
        _gemini = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.OPENAI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/',
        });
    }
    return _gemini;
};

/** Returns the Groq client (used as fallback). */
export const getGroqClient = () => {
    if (!_groq && process.env.GROQ_API_KEY) {
        _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return _groq;
};

// Keep default export for backward compatibility
export default getGeminiClient;