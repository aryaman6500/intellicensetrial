import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../utils/types';
import { generateLegalAnswer } from '../lib/llm';
import { z } from 'zod';

// Define validation schema for legal questions
const questionSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  uploadId: z.string().optional(),
});

// Create a new legal question request
export const createRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate request body
    const validation = questionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const { question, uploadId } = validation.data;

    // If uploadId is provided, verify it exists and belongs to the user
    let uploadInfo = null;
    if (uploadId) {
      const upload = await prisma.upload.findUnique({
        where: { id: uploadId },
        include: {
          analysis: true,
        },
      });

      if (!upload) {
        return res.status(404).json({ message: 'Upload not found' });
      }

      if (upload.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to reference this upload' });
      }

      uploadInfo = {
        type: upload.fileType,
        name: upload.fileName,
        analysis: upload.analysis,
      };
    }

    // Generate answer using LLM
    const contentContext = uploadInfo ? 
      `File type: ${uploadInfo.type}, File name: ${uploadInfo.name}, ` +
      `Analysis: ${uploadInfo.analysis?.licensingSummary || 'No analysis available'}` 
      : undefined;
    
    const answer = await generateLegalAnswer(question, contentContext);

    // Create request record
    const request = await prisma.request.create({
      data: {
        userId: req.user.id,
        uploadId,
        question,
        answer,
      },
      include: {
        upload: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: 'Question submitted and answered',
      request,
    });
  } catch (error) {
    console.error('Error creating request:', error);
    return res.status(500).json({ message: 'Server error while processing your question' });
  }
};

// Get all requests for a user
export const getUserRequests = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get all requests for the user
    const requests = await prisma.request.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        upload: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({ requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return res.status(500).json({ message: 'Server error while fetching requests' });
  }
};

// Get request by ID
export const getRequestById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;

    // Find the request
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        upload: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
          },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user owns the request
    if (request.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this request' });
    }

    return res.json({ request });
  } catch (error) {
    console.error('Error fetching request:', error);
    return res.status(500).json({ message: 'Server error while fetching request' });
  }
}; 