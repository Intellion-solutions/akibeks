import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../../../shared/constants';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    message: 'The requested resource does not exist on this server'
  });
};