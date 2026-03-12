import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { aiLimiter } from '../middlewares/rateLimiter.js';
import {
    createCoverLetter,
    getUserCoverLetters,
    getCoverLetterById,
    updateCoverLetter,
    deleteCoverLetter,
    generateCoverLetterContent,
    improveCoverLetterContent,
    getPublicCoverLetter
} from '../controllers/coverLetterController.js';

const router = express.Router();

router.post('/create', protect, createCoverLetter);
router.get('/all', protect, getUserCoverLetters);
router.get('/public/:id', getPublicCoverLetter);
router.post('/generate/:id', protect, aiLimiter, generateCoverLetterContent);
router.post('/improve/:id', protect, aiLimiter, improveCoverLetterContent);
router.put('/update/:id', protect, updateCoverLetter);
router.delete('/delete/:id', protect, deleteCoverLetter);
router.get('/get/:id', protect, getCoverLetterById);
router.get('/:id', protect, getCoverLetterById); // alias used by frontend

export default router;
