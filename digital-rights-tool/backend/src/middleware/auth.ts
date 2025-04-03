import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { AuthRequest } from '../utils/types';

// Middleware to authenticate JWT token
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Invalid authorization format' });
    }
    
    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role?: string };
    
    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user to request
    req.user = { id: decoded.id, email: decoded.email, role: user.role };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}; 