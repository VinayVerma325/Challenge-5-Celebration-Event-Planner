import { describe, it, expect } from 'vitest';
import { calculateTaskMetrics } from '../../services/task.service.js';

describe('Task Service Unit Tests', () => {
  const referenceDate = new Date('2025-06-15T12:00:00Z');

  it('should handle zero tasks gracefully', () => {
    const metrics = calculateTaskMetrics([], referenceDate);

    expect(metrics.total).toBe(0);
    expect(metrics.completed).toBe(0);
    expect(metrics.inProgress).toBe(0);
    expect(metrics.pending).toBe(0);
    expect(metrics.overdue).toBe(0);
    expect(metrics.completionPercentage).toBe(0);
  });

  it('should accurately categorize completed, in progress, and pending tasks', () => {
    const tasks = [
      { status: 'completed' as const, dueDate: new Date('2025-06-10') },
      { status: 'completed' as const, dueDate: new Date('2025-06-12') },
      { status: 'in_progress' as const, dueDate: new Date('2025-06-20') },
      { status: 'pending' as const, dueDate: new Date('2025-06-25') }
    ];

    const metrics = calculateTaskMetrics(tasks, referenceDate);

    expect(metrics.total).toBe(4);
    expect(metrics.completed).toBe(2);
    expect(metrics.inProgress).toBe(1);
    expect(metrics.pending).toBe(1);
    expect(metrics.overdue).toBe(0);
    expect(metrics.completionPercentage).toBe(50);
  });

  it('should detect overdue tasks only if they are not completed', () => {
    const tasks = [
      // Past due date, but completed -> NOT overdue
      { status: 'completed' as const, dueDate: new Date('2025-06-01') },
      // Past due date and pending -> OVERDUE
      { status: 'pending' as const, dueDate: new Date('2025-06-10') },
      // Past due date and in_progress -> OVERDUE
      { status: 'in_progress' as const, dueDate: new Date('2025-06-14') },
      // Future due date and pending -> NOT overdue
      { status: 'pending' as const, dueDate: new Date('2025-06-20') }
    ];

    const metrics = calculateTaskMetrics(tasks, referenceDate);

    expect(metrics.total).toBe(4);
    expect(metrics.completed).toBe(1);
    expect(metrics.overdue).toBe(2);
    expect(metrics.completionPercentage).toBe(25);
  });
});
