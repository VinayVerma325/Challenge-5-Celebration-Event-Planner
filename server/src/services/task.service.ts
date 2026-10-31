export interface TaskSummaryMetrics {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  completionPercentage: number;
}

export function calculateTaskMetrics(
  tasks: Array<{
    status: 'pending' | 'in_progress' | 'completed';
    dueDate: Date | string;
  }>,
  referenceDate: Date = new Date()
): TaskSummaryMetrics {
  const total = tasks.length;
  let completed = 0;
  let inProgress = 0;
  let pending = 0;
  let overdue = 0;

  const nowMs = referenceDate.getTime();

  for (const t of tasks) {
    if (t.status === 'completed') {
      completed += 1;
    } else if (t.status === 'in_progress') {
      inProgress += 1;
      const dueMs = new Date(t.dueDate).getTime();
      if (!isNaN(dueMs) && dueMs < nowMs) {
        overdue += 1;
      }
    } else {
      pending += 1;
      const dueMs = new Date(t.dueDate).getTime();
      if (!isNaN(dueMs) && dueMs < nowMs) {
        overdue += 1;
      }
    }
  }

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    inProgress,
    pending,
    overdue,
    completionPercentage
  };
}
