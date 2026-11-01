import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { Expense } from '../models/Expense.js';
import { Task } from '../models/Task.js';
import { Vendor } from '../models/Vendor.js';
import { AiPlan } from '../models/AiPlan.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { geminiService } from '../services/gemini.service.js';
import { AiPlanOutput } from '../validators/ai.validator.js';
import { getParam } from '../utils/params.js';

export async function generatePlan(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = getParam(req.params.eventId);
    const userId = req.user!._id;
    const { additionalPrompt, focusAreas } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
      return;
    }

    const { plan, isDemoFallback, disclaimer } = await geminiService.generateEventPlan(
      event,
      additionalPrompt,
      focusAreas
    );

    // Save history
    await AiPlan.create({
      eventId,
      userId,
      promptNotes: additionalPrompt || '',
      plan,
      isDemoFallback
    });

    res.status(200).json({
      success: true,
      message: isDemoFallback
        ? 'Curated celebration plan loaded successfully (offline safety mode)'
        : 'AI plan generated successfully with Google Gemini',
      isDemoFallback,
      disclaimer,
      plan
    });
  } catch (error) {
    next(error);
  }
}

export async function getLatestPlan(
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

    const latestPlanDoc = await AiPlan.findOne({ eventId, userId }).sort({ createdAt: -1 }).lean();

    if (!latestPlanDoc) {
      res.status(404).json({
        success: false,
        message: 'No AI plan has been generated for this event yet.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      plan: latestPlanDoc.plan,
      isDemoFallback: latestPlanDoc.isDemoFallback,
      createdAt: latestPlanDoc.createdAt
    });
  } catch (error) {
    next(error);
  }
}

export async function applyPlan(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = getParam(req.params.eventId);
    const userId = req.user!._id;
    const { applyBudget, applyTasks, applyVendors, applyTheme, plan: customPlan } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
      return;
    }

    // Determine which plan payload to apply: user-edited payload or latest stored plan
    let planToApply: AiPlanOutput;
    if (customPlan) {
      planToApply = customPlan;
    } else {
      const latest = await AiPlan.findOne({ eventId, userId }).sort({ createdAt: -1 }).lean();
      if (!latest) {
        res.status(400).json({
          success: false,
          message: 'No plan available to apply. Please generate or provide a plan first.'
        });
        return;
      }
      planToApply = latest.plan as AiPlanOutput;
    }

    const appliedSummary = {
      budgetItemsCreated: 0,
      tasksCreated: 0,
      vendorsCreated: 0,
      themeUpdated: false
    };

    // 1. Apply Theme
    if (applyTheme && planToApply.themeConcept) {
      event.theme = planToApply.themeConcept.slice(0, 100);
      await event.save();
      appliedSummary.themeUpdated = true;
    }

    // 2. Apply Budget recommendations as expenses
    if (applyBudget && Array.isArray(planToApply.budgetRecommendations)) {
      const expenseDocs = planToApply.budgetRecommendations.map((b) => ({
        eventId,
        userId,
        category: b.category,
        title: `${b.category} Budget`,
        allocatedAmount: b.suggestedAmount || 0,
        actualAmount: 0,
        paidStatus: 'unpaid' as const,
        notes: b.rationale || 'Suggested by AI Planner'
      }));

      if (expenseDocs.length > 0) {
        await Expense.insertMany(expenseDocs);
        appliedSummary.budgetItemsCreated = expenseDocs.length;
      }
    }

    // 3. Apply Tasks
    if (applyTasks && Array.isArray(planToApply.checklistTasks)) {
      const eventDate = new Date(event.date);
      const taskDocs = planToApply.checklistTasks.map((t) => {
        const days = Number(t.daysBeforeEvent) || 7;
        const dueDate = new Date(eventDate);
        dueDate.setDate(dueDate.getDate() - days);

        return {
          eventId,
          userId,
          title: t.title,
          category: t.category || 'General',
          priority: t.priority || 'medium',
          status: 'pending' as const,
          dueDate,
          description: `Planned for ${days} days before event.`
        };
      });

      if (taskDocs.length > 0) {
        await Task.insertMany(taskDocs);
        appliedSummary.tasksCreated = taskDocs.length;
      }
    }

    // 4. Apply Vendor Suggestions
    if (applyVendors && Array.isArray(planToApply.vendorSuggestions)) {
      const vendorDocs = planToApply.vendorSuggestions.map((v) => ({
        eventId,
        userId,
        name: v.name,
        category: v.category,
        quoteAmount: 0,
        status: 'researching' as const,
        notes: `${v.estimatedBudgetShare ? `Est. share: ${v.estimatedBudgetShare}. ` : ''}${v.recommendationTips || ''}`,
        isAiSuggested: true
      }));

      if (vendorDocs.length > 0) {
        await Vendor.insertMany(vendorDocs);
        appliedSummary.vendorsCreated = vendorDocs.length;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Plan successfully applied to event!',
      applied: appliedSummary
    });
  } catch (error) {
    next(error);
  }
}
