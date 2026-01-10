import express from 'express'
import { enhanceJobDescription, enhanceProfessionalSummary, uploadResume } from '../controllers/aiController.js'
import protect from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/upload-resume', protect, uploadResume)
router.post('/enhance-job-desc', enhanceJobDescription)
router.post('/enhance-pro-sum', enhanceProfessionalSummary)

export default router
