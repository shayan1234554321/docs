import { Request, Response, NextFunction } from 'express';
import { sendError } from '../helpers/responseHelper';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Unhandled Error:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred on the server';

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    sendError(res, 'Database Validation Error', 400, err.errors);
    return;
  }

  // Handle mongoose duplicate key errors
  if (err.code === 11000) {
    sendError(res, 'Resource already exists', 409, err.keyValue);
    return;
  }

  // Handle generic error
  sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
  );
};
