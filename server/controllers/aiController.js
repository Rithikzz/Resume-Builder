/**
 * AI Controller — Resume-specific AI endpoints
 * General AI calls (cover letter, portfolio) are in their own controllers.
 */
import Resume from "../models/Resume.js";
import { generateContent, generateJSON, handleAIError } from "../services/aiService.js";
import resumePlugin from "../plugins/resumePlugin.js";

// POST /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const { userContent } = req.body;
        if (!userContent) return res.status(400).json({ message: 'Missing required fields' });

        const enhanced = await generateContent(resumePlugin.aiPrompts.enhanceSummary, userContent);
        return res.status(200).json({ enhancedContent: enhanced });
    } catch (error) {
        return handleAIError(error, res);
    }
};

// POST /api/ai/enhance-job-desc
export const enhanceJobDescription = async (req, res) => {
    try {
        const { userContent } = req.body;
        if (!userContent) return res.status(400).json({ message: 'Missing required fields' });

        const enhanced = await generateContent(resumePlugin.aiPrompts.enhanceJobDesc, userContent);
        return res.status(200).json({ enhancedContent: enhanced });
    } catch (error) {
        return handleAIError(error, res);
    }
};

// POST /api/ai/upload-resume
export const uploadResume = async (req, res) => {
    try {
        const { resumeText, title } = req.body;
        const userId = req.userId;
        if (!resumeText) return res.status(400).json({ message: 'Missing required fields' });

        const systemPrompt = resumePlugin.aiPrompts.extractFromPDF;
        const userPrompt = "Extract all information from this resume and return ONLY valid JSON with fields: professional_summary, skills (array), personal_info (full_name, profession, email, phone, location, linkedin, website, image), experience (array: company, position, start_date, end_date, description, is_current), project (array: name, type, description), education (array: institution, degree, field, graduation_date, gpa). Resume text:\n\n" + resumeText;

        const parsedData = await generateJSON(systemPrompt, userPrompt);
        const newResume = await Resume.create({ userId, title, ...parsedData });

        return res.status(201).json({ resumeId: newResume._id });
    } catch (error) {
        return handleAIError(error, res);
    }
};

// POST /api/ai/ats-score
export const getATSScore = async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;
        if (!resumeText || !jobDescription) {
            return res.status(400).json({ message: 'Both resumeText and jobDescription are required' });
        }
        const systemPrompt = "You are an ATS expert. Analyze the resume against the job description and return ONLY valid JSON: {score: 0-100, matching_keywords: [], missing_keywords: [], strengths: [], improvements: [], summary: string}";
        const userPrompt = "Resume:\n" + resumeText.slice(0, 3000) + "\n\nJob Description:\n" + jobDescription.slice(0, 1500);

        const result = await generateJSON(systemPrompt, userPrompt);
        return res.status(200).json({ atsResult: result });
    } catch (error) {
        return handleAIError(error, res);
    }
};

// POST /api/ai/skill-gap
export const analyzeSkillGap = async (req, res) => {
    try {
        const { currentSkills, jobDescription } = req.body;
        if (!currentSkills || !jobDescription) {
            return res.status(400).json({ message: 'currentSkills and jobDescription are required' });
        }
        const systemPrompt = "You are a career advisor. Analyze skill gaps and return ONLY valid JSON: {matched_skills: [], missing_skills: [], nice_to_have: [], match_percentage: 0-100, recommendation: string}";
        const userPrompt = "Current Skills: " + (Array.isArray(currentSkills) ? currentSkills.join(', ') : currentSkills) + "\n\nJob Description:\n" + jobDescription.slice(0, 2000);

        const result = await generateJSON(systemPrompt, userPrompt);
        return res.status(200).json({ skillGap: result });
    } catch (error) {
        return handleAIError(error, res);
    }
};
