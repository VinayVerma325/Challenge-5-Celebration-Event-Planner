import { Response, NextFunction } from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import { Task, ITask } from '../models/Task.js';
import { Event } from '../models/Event.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { calculateTaskMetrics } from '../services/task.service.js';
import { getParam } from '../utils/params.js';

export async function listTasks(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = getParam(req.params.eventId);
    const userId = req.user!._id;
    const { status, priority, category } = req.query;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const event = await Event.findOne({ _id: eventId, userId }).select('_id').lean();
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
      return;
    }

    const query: FilterQuery<ITask> = { eventId, userId };
    if (status && typeof status === 'string') query.status = status as any;
    if (priority && typeof priority === 'string') query.priority = priority as any;
    if (category && typeof category === 'string') query.category = category;

    const [tasks, allEventTasks] = await Promise.all([
      Task.find(query).sort({ dueDate: 1, createdAt: -1 }).lean(),
      Task.find({ eventId, userId }).lean()
    ]);
    const taskMetrics = calculateTaskMetrics(allEventTasks);

    res.status(200).json({
      success: true,
      count: tasks.length,
      taskMetrics,
      tasks
    });
  } catch (error) {
    next(error);
  }
}

export async function createTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = getParam(req.params.eventId);
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
      return;
    }

    const task = await Task.create({
      ...req.body,
      eventId,
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = getParam(req.params.eventId);
    const id = getParam(req.params.id);
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid ID parameters' });
      return;
    }

    const updateData = { ...req.body };
    if (updateData.status === 'completed' && !updateData.completedAt) {
      updateData.completedAt = new Date();
    } else if (updateData.status && updateData.status !== 'completed') {
      updateData.completedAt = null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, eventId, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found or unauthorized' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleTaskStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = getParam(req.params.eventId);
    const id = getParam(req.params.id);
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid ID parameters' });
      return;
    }

    const task = await Task.findOne({ _id: id, eventId, userId });
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found or unauthorized' });
      return;
    }

    if (task.status === 'completed') {
      task.status = 'pending';
      task.completedAt = undefined;
    } else {
      task.status = 'completed';
      task.completedAt = new Date();
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: `Task marked as ${task.status}`,
      task
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = getParam(req.params.eventId);
    const id = getParam(req.params.id);
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid ID parameters' });
      return;
    }

    const task = await Task.findOneAndDelete({ _id: id, eventId, userId });
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found or unauthorized' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
