import { Response, NextFunction } from 'express';
import { Event } from '../models/Event.js';
import { Expense } from '../models/Expense.js';
import { Task } from '../models/Task.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function getDashboardSummary(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const now = new Date();

    const [allEvents, allExpenses, allTasks] = await Promise.all([
      Event.find({ userId }).sort({ date: 1 }).lean(),
      Expense.find({ userId }).lean(),
      Task.find({ userId }).sort({ dueDate: 1 }).lean()
    ]);

    const totalEvents = allEvents.length;
    const upcomingEvents = allEvents.filter((e) => new Date(e.date) >= now);

    let totalBudget = 0;
    for (const e of allEvents) {
      totalBudget += e.budget || 0;
    }

    let totalSpent = 0;
    for (const exp of allExpenses) {
      totalSpent += exp.actualAmount || 0;
    }

    let pendingTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    const nowMs = now.getTime();

    for (const t of allTasks) {
      if (t.status === 'completed') {
        completedTasks += 1;
      } else {
        pendingTasks += 1;
        const dueMs = new Date(t.dueDate).getTime();
        if (!isNaN(dueMs) && dueMs < nowMs) {
          overdueTasks += 1;
        }
      }
    }

    // Prepare enriched upcoming events with budget and task stats
    const enrichedUpcoming = upcomingEvents.slice(0, 5).map((event) => {
      const eventExpenses = allExpenses.filter((exp) => exp.eventId.toString() === event._id.toString());
      const eventTasks = allTasks.filter((t) => t.eventId.toString() === event._id.toString());

      const spent = eventExpenses.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
      const eventCompletedTasks = eventTasks.filter((t) => t.status === 'completed').length;
      const taskPercentage = eventTasks.length > 0
        ? Math.round((eventCompletedTasks / eventTasks.length) * 100)
        : 0;

      return {
        id: event._id,
        title: event.title,
        eventType: event.eventType,
        date: event.date,
        location: event.location,
        guestCount: event.guestCount,
        budget: event.budget,
        currency: event.currency,
        spent: Math.round(spent * 100) / 100,
        taskCount: eventTasks.length,
        taskPercentage
      };
    });

    // Urgent pending or overdue tasks
    const urgentTasks = allTasks
      .filter((t) => t.status !== 'completed')
      .slice(0, 5)
      .map((t) => ({
        id: t._id,
        eventId: t.eventId,
        title: t.title,
        category: t.category,
        dueDate: t.dueDate,
        priority: t.priority,
        isOverdue: new Date(t.dueDate).getTime() < nowMs
      }));

    res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        upcomingEventsCount: upcomingEvents.length,
        totalBudget: Math.round(totalBudget * 100) / 100,
        totalSpent: Math.round(totalSpent * 100) / 100,
        completedTasks,
        pendingTasks,
        overdueTasks
      },
      upcomingEvents: enrichedUpcoming,
      urgentTasks
    });
  } catch (error) {
    next(error);
  }
}
