/**
 * Cover Letter Controller
 */
import CoverLetter from '../models/CoverLetter.js';
import { generateContent, handleAIError } from '../services/aiService.js';
import coverLetterPlugin from '../plugins/coverLetterPlugin.js';

// POST /api/cover-letters/create
export const createCoverLetter = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, applicantName, jobTitle, companyName } = req.body;
        const newCL = await CoverLetter.create({ userId, title, applicantName, jobTitle, companyName });
        return res.status(201).json({ message: 'Cover letter created', coverLetter: newCL });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// GET /api/cover-letters/all
export const getUserCoverLetters = async (req, res) => {
    try {
        const coverLetters = await CoverLetter.find({ userId: req.userId }).sort({ updatedAt: -1 });
        return res.status(200).json({ coverLetters });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// GET /api/cover-letters/get/:id
export const getCoverLetterById = async (req, res) => {
    try {
        const cl = await CoverLetter.findOne({ _id: req.params.id, userId: req.userId });
        if (!cl) return res.status(404).json({ message: 'Cover letter not found' });
        return res.status(200).json({ coverLetter: cl });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// PUT /api/cover-letters/update/:id
export const updateCoverLetter = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        delete updateData._id;
        const cl = await CoverLetter.findOneAndUpdate(
            { _id: id, userId: req.userId },
            updateData,
            { new: true }
        );
        if (!cl) return res.status(404).json({ message: 'Cover letter not found' });
        return res.status(200).json({ message: 'Saved successfully', coverLetter: cl });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// DELETE /api/cover-letters/delete/:id
export const deleteCoverLetter = async (req, res) => {
    try {
        await CoverLetter.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        return res.status(200).json({ message: 'Cover letter deleted' });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// POST /api/cover-letters/generate/:id
export const generateCoverLetterContent = async (req, res) => {
    try {
        const cl = await CoverLetter.findOne({ _id: req.params.id, userId: req.userId });
        if (!cl) return res.status(404).json({ message: 'Cover letter not found' });

        const userPrompt = `
Applicant: ${cl.applicantName}
Job Title: ${cl.jobTitle}
Company: ${cl.companyName}
${cl.jobDescription ? `Job Description: ${cl.jobDescription}` : ''}
${cl.keySkills?.length ? `Key Skills: ${cl.keySkills.join(', ')}` : ''}
${cl.experience ? `Experience: ${cl.experience}` : ''}
Tone: ${cl.tone}
${cl.customInstructions ? `Additional Instructions: ${cl.customInstructions}` : ''}
        `.trim();

        const content = await generateContent(
            coverLetterPlugin.aiPrompts.generate,
            userPrompt
        );

        cl.content = content;
        await cl.save();

        return res.status(200).json({ message: 'Cover letter generated', content, coverLetter: cl });
    } catch (error) {
        return handleAIError(error, res);
    }
};

// POST /api/cover-letters/improve/:id
export const improveCoverLetterContent = async (req, res) => {
    try {
        const cl = await CoverLetter.findOne({ _id: req.params.id, userId: req.userId });
        if (!cl || !cl.content) {
            return res.status(400).json({ message: 'No cover letter content to improve. Generate it first.' });
        }

        const improved = await generateContent(
            coverLetterPlugin.aiPrompts.improve,
            cl.content
        );
        cl.content = improved;
        await cl.save();

        return res.status(200).json({ message: 'Cover letter improved', content: improved, coverLetter: cl });
    } catch (error) {
        return handleAIError(error, res);
    }
};

// GET /api/cover-letters/public/:id
export const getPublicCoverLetter = async (req, res) => {
    try {
        const cl = await CoverLetter.findOne({ _id: req.params.id, public: true });
        if (!cl) return res.status(404).json({ message: 'Not found' });
        return res.status(200).json({ coverLetter: cl });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
