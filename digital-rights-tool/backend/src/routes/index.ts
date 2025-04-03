import { Router } from 'express';
import authRoutes from './auth';
import uploadRoutes from './upload';
import analysisRoutes from './analysis';
import requestRoutes from './request';

const router = Router();

router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/analysis', analysisRoutes);
router.use('/request', requestRoutes);

export default router; 