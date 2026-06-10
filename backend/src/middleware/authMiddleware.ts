import { Response, NextFunction } from 'express';
import { verifyToken } from '../helpers/jwtHelper';
import { sendError } from '../helpers/responseHelper';
import { AuthenticatedRequest } from '../types';

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const decoded = verifyToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    sendError(res, 'Invalid or expired authentication token', 401);
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = verifyToken(token);
        req.user = {
          id: decoded.userId,
          email: decoded.email,
        };
      }
    }
    next();
  } catch (error) {
    // If token is present but invalid, we don't throw an error for optional auth,
    // we just proceed as guest.
    next();
  }
};
