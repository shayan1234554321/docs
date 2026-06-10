import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { hashPassword, comparePassword } from '../helpers/passwordHelper';
import { signToken } from '../helpers/jwtHelper';
import { sendSuccess, sendError } from '../helpers/responseHelper';
import { AuthenticatedRequest } from '../types';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      sendError(res, 'A user with this email address already exists', 400);
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await user.save();

    const token = signToken({ userId: user._id.toString(), email: user.email });

    sendSuccess(res, {
      user: {
        id: user._id,
        email: user.email,
      },
      token,
    }, 201, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      sendError(res, 'Invalid email or password', 400);
      return;
    }

    const isMatch = await comparePassword(password, user.password as string);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 400);
      return;
    }

    const token = signToken({ userId: user._id.toString(), email: user.email });

    sendSuccess(res, {
      user: {
        id: user._id,
        email: user.email,
      },
      token,
    }, 200, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User session not found', 401);
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, {
      user: {
        id: user._id,
        email: user.email,
      },
    }, 200);
  } catch (error) {
    next(error);
  }
};
