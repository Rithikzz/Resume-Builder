import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { aiLimiter, githubLimiter } from '../middlewares/rateLimiter.js';
import {
    createPortfolio,
    getUserPortfolios,
    getPortfolioById,
    getPublicPortfolio,
    updatePortfolio,
    deletePortfolio,
    aiEnhancePortfolio,
    createFromGithub,
    getGithubRepos,
    publishToGithub
} from '../controllers/portfolioController.js';

const router = express.Router();

router.post('/create', protect, createPortfolio);
router.get('/all', protect, getUserPortfolios);
router.get('/public/:id', getPublicPortfolio);
router.get('/github-repos', protect, getGithubRepos);
router.post('/from-github', protect, githubLimiter, aiLimiter, createFromGithub);
router.post('/github-publish/:id', protect, publishToGithub);
router.post('/ai-enhance/:id', protect, aiLimiter, aiEnhancePortfolio);
router.put('/update/:id', protect, updatePortfolio);
router.delete('/delete/:id', protect, deletePortfolio);
router.get('/get/:id', protect, getPortfolioById);
router.get('/:id', protect, getPortfolioById); // alias used by frontend

export default router;
