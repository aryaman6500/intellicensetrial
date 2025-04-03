import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../utils/types';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

// Define validation schema for upload
const uploadSchema = z.object({
  fileType: z.enum(['IMAGE', 'ARTICLE', 'VIDEO']),
  contentType: z.string().optional(),
});

// Upload file
export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if file was uploaded (handled by multer)
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate request body
    const validation = uploadSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const { fileType, contentType } = validation.data;

    // Use the file path provided by multer
    const fileUrl = `/uploads/${req.file.filename}`;

    // Create upload record
    const upload = await prisma.upload.create({
      data: {
        userId: req.user.id,
        fileName: req.file.originalname,
        fileType,
        contentType,
        fileUrl,
      },
    });

    return res.status(201).json({
      message: 'File uploaded successfully',
      upload,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ message: 'Server error during upload' });
  }
};

// Get user uploads
export const getUserUploads = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get all uploads for the user, including analysis if it exists
    const uploads = await prisma.upload.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        analysis: {
          select: {
            id: true,
            licensingSummary: true,
            riskScore: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({ uploads });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return res.status(500).json({ message: 'Server error while fetching uploads' });
  }
};

// Get upload by ID
export const getUploadById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;

    // Find the upload
    const upload = await prisma.upload.findUnique({
      where: { id },
      include: {
        analysis: true,
      },
    });

    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    // Check if user owns the upload
    if (upload.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this upload' });
    }

    return res.json({ upload });
  } catch (error) {
    console.error('Error fetching upload:', error);
    return res.status(500).json({ message: 'Server error while fetching upload' });
  }
};

// Delete upload by ID
export const deleteUpload = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { id } = req.params;
    
    const upload = await prisma.upload.findUnique({
      where: { id }
    });
    
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }
    
    // Check if user owns the upload
    if (upload.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this upload' });
    }
    
    // Delete file from filesystem
    const filePath = path.join(process.cwd(), upload.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database (cascade will delete analysis)
    await prisma.upload.delete({
      where: { id }
    });
    
    res.json({ message: 'Upload deleted successfully' });
  } catch (error) {
    console.error('Error deleting upload:', error);
    res.status(500).json({ message: 'Server error while deleting upload' });
  }
}; 