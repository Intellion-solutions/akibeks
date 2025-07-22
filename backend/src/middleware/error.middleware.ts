import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../../../shared/constants';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error values
  let statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = error.message || 'Internal server error';

  // Log error
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation error';
  }

  if (error.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Invalid ID format';
  }

  if (error.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Token expired';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    message = 'Something went wrong';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createError = (message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};