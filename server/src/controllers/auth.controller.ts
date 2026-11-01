import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { Expense } from '../models/Expense.js';
import { Task } from '../models/Task.js';
import { Vendor } from '../models/Vendor.js';
import { AiPlan } from '../models/AiPlan.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

function generateToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: (env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn']
  };
  return jwt.sign({ id: userId }, env.JWT_SECRET, options);
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
      return;
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'No account found with this email. Please click "Create an account" below to register first.'
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify your password and try again.'
      });
      return;
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const events = await Event.find({ userId });
    const eventIds = events.map((e) => e._id);

    await Promise.all([
      Expense.deleteMany({ $or: [{ userId }, { eventId: { $in: eventIds } }] }),
      Task.deleteMany({ $or: [{ userId }, { eventId: { $in: eventIds } }] }),
      Vendor.deleteMany({ $or: [{ userId }, { eventId: { $in: eventIds } }] }),
      AiPlan.deleteMany({ $or: [{ userId }, { eventId: { $in: eventIds } }] }),
      Event.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.status(200).json({
      success: true,
      message: 'User account and all associated celebrations deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

export async function cleanupQueryData(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { pattern } = req.body;
    const searchRegex = new RegExp(pattern || 'priya', 'i');

    const users = await User.find({
      $or: [{ name: searchRegex }, { email: searchRegex }]
    });

    const userIds = users.map((u) => u._id);
    const events = await Event.find({
      $or: [{ userId: { $in: userIds } }, { title: searchRegex }]
    });
    const eventIds = events.map((e) => e._id);

    await Promise.all([
      Expense.deleteMany({ $or: [{ userId: { $in: userIds } }, { eventId: { $in: eventIds } }] }),
      Task.deleteMany({ $or: [{ userId: { $in: userIds } }, { eventId: { $in: eventIds } }] }),
      Vendor.deleteMany({ $or: [{ userId: { $in: userIds } }, { eventId: { $in: eventIds } }] }),
      AiPlan.deleteMany({ $or: [{ userId: { $in: userIds } }, { eventId: { $in: eventIds } }] }),
      Event.deleteMany({ _id: { $in: eventIds } }),
      User.deleteMany({ _id: { $in: userIds } })
    ]);

    res.status(200).json({
      success: true,
      message: `Cleaned up ${users.length} users and ${events.length} events matching '${pattern || 'priya'}'`,
      deletedUsersCount: users.length,
      deletedEventsCount: events.length
    });
  } catch (error) {
    next(error);
  }
}
