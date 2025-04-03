import express from 'express';
import { analyzeContent, getAnalysisById } from '../controllers/analysis';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Create analysis for an upload
router.post('/:uploadId', authenticate, analyzeContent);

// Get analysis for an upload
router.get('/:uploadId', authenticate, getAnalysisById);

export default router; 