import express from 'express'
import { enhanceJobDescription, enhanceProfessionalSummary, uploadResume, getATSScore, analyzeSkillGap } from '../controllers/aiController.js'
import protect from '../middlewares/authMiddleware.js'
import { aiLimiter } from '../middlewares/rateLimiter.js'

const router = express.Router()

router.post('/upload-resume', protect, aiLimiter, uploadResume)
router.post('/enhance-job-desc', aiLimiter, enhanceJobDescription)
router.post('/enhance-pro-sum', aiLimiter, enhanceProfessionalSummary)
router.post('/ats-score', protect, aiLimiter, getATSScore)
router.post('/skill-gap', protect, aiLimiter, analyzeSkillGap)

export default router
