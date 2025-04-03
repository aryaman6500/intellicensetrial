import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5176', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Import routes
import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';
import analysisRoutes from './routes/analysis';
import requestRoutes from './routes/request';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Add multer middleware to upload route
app.use('/api/upload', (req, res, next) => {
  if (req.method === 'POST' && !req.path.startsWith('/:id')) {
    upload.single('file')(req, res, next);
  } else {
    next();
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/request', requestRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check route
app.get('/api/health', (_, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running with Neon PostgreSQL database' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Neon PostgreSQL database`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from database');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from database');
  process.exit(0);
}); 