import express from 'express';
import { createRequest, getUserRequests, getRequestById } from '../controllers/request';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Create a new request
router.post('/', authenticate, createRequest);

// Get user's requests
router.get('/', authenticate, getUserRequests);

// Get a specific request
router.get('/:id', authenticate, getRequestById);

export default router; 