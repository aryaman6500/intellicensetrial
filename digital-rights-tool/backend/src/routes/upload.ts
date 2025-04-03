import express from 'express';
import { uploadFile, getUserUploads, getUploadById } from '../controllers/upload';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Upload a file
router.post('/', authenticate, uploadFile);

// Get user's uploads
router.get('/', authenticate, getUserUploads);

// Get a specific upload
router.get('/:id', authenticate, getUploadById);

export default router; 