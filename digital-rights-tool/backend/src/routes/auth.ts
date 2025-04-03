import express from 'express';
import { register, login, getProfile } from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login
router.post('/login', login);

// Get user profile
router.get('/profile', authenticate, getProfile);

export default router; 