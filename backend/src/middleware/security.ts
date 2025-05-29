import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';

// Generate CSRF token
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for certain routes
  const skipRoutes = ['/health', '/api/v1/webhooks'];
  if (skipRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }

  // Skip for GET requests
  if (req.method === 'GET') {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = (req as any).session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'Your request could not be validated. Please refresh and try again.',
    });
  }

  next();
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Additional security headers not covered by helmet
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  
  next();
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    });
  }

  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  next();
};

// Helper function to sanitize strings
const sanitizeString = (str: string): string => {
  // Remove null bytes
  str = str.replace(/\0/g, '');
  
  // Trim whitespace
  str = str.trim();
  
  // Prevent NoSQL injection by removing $ and .
  str = str.replace(/[$\.]/g, '');
  
  return str;
};

// Helper function to recursively sanitize objects
const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: any = {};
  Object.keys(obj).forEach(key => {
    // Skip keys that start with $ or contain .
    if (!key.startsWith('$') && !key.includes('.')) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  });

  return sanitized;
};

// API key validation middleware
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Missing API key',
      message: 'Please provide an API key in the x-api-key header',
    });
  }

  // TODO: Implement actual API key validation against database
  // For now, just check if it's a valid format
  if (!/^[a-zA-Z0-9]{32,}$/.test(apiKey)) {
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'The provided API key is invalid',
    });
  }

  next();
};

// Request signing validation
export const validateRequestSignature = (secret: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers['x-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;
    
    if (!signature || !timestamp) {
      return res.status(401).json({
        error: 'Missing signature',
        message: 'Request signature is required',
      });
    }

    // Check timestamp to prevent replay attacks (5 minute window)
    const requestTime = parseInt(timestamp);
    const currentTime = Date.now();
    if (Math.abs(currentTime - requestTime) > 5 * 60 * 1000) {
      return res.status(401).json({
        error: 'Request expired',
        message: 'Request timestamp is too old',
      });
    }

    // Verify signature
    const payload = `${timestamp}.${JSON.stringify(req.body)}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({
        error: 'Invalid signature',
        message: 'Request signature verification failed',
      });
    }

    next();
  };
};