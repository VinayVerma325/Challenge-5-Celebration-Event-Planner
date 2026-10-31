import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Expense } from '../models/Expense.js';
import { Event } from '../models/Event.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { calculateBudgetMetrics } from '../services/budget.service.js';
import { getParam } from '../utils/params.js';

export async function listExpenses(
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

    const expenses = await Expense.find({ eventId, userId }).sort({ createdAt: -1 });
    const budgetSummary = calculateBudgetMetrics(event.budget, expenses);

    res.status(200).json({
      success: true,
      count: expenses.length,
      budgetSummary,
      expenses
    });
  } catch (error) {
    next(error);
  }
}

export async function createExpense(
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

    const expense = await Expense.create({
      ...req.body,
      eventId,
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    next(error);
  }
}

export async function updateExpense(
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

    const expense = await Expense.findOneAndUpdate(
      { _id: id, eventId, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!expense) {
      res.status(404).json({ success: false, message: 'Expense not found or unauthorized' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteExpense(
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

    const expense = await Expense.findOneAndDelete({ _id: id, eventId, userId });
    if (!expense) {
      res.status(404).json({ success: false, message: 'Expense not found or unauthorized' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
