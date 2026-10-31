import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Expense } from '../models/Expense.js';
import { Task } from '../models/Task.js';
import { Vendor } from '../models/Vendor.js';
import { AiPlan } from '../models/AiPlan.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getParam } from '../utils/params.js';

export async function listEvents(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const { type, status, sort } = req.query;

    const query: any = { userId };
    if (type && typeof type === 'string') {
      query.eventType = type;
    }
    if (status && typeof status === 'string') {
      query.status = status;
    }

    let sortOption: any = { date: 1 }; // default upcoming first
    if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'budget_desc') {
      sortOption = { budget: -1 };
    }

    const events = await Event.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
}

export async function createEvent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const eventData = { ...req.body, userId };

    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    next(error);
  }
}

export async function getEventById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParam(req.params.id);
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const event = await Event.findOne({ _id: id, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParam(req.params.id);
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const event = await Event.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = getParam(req.params.id);
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const event = await Event.findOneAndDelete({ _id: id, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
      return;
    }

    // Cascade delete associated sub-resources
    await Promise.all([
      Expense.deleteMany({ eventId: id, userId }),
      Task.deleteMany({ eventId: id, userId }),
      Vendor.deleteMany({ eventId: id, userId }),
      AiPlan.deleteMany({ eventId: id, userId })
    ]);

    res.status(200).json({
      success: true,
      message: 'Event and all related resources deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
