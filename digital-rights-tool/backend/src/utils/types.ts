import { Request } from 'express';

// Extend Express Request to include user property
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

// This will help with TypeScript's handling of the route handlers
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: string;
      };
    }
  }
} 