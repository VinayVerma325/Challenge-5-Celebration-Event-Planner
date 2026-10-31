import { IExpense } from '../models/Expense.js';

export interface CategorySummary {
  category: string;
  allocated: number;
  actual: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
  expenseCount: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalAllocated: number;
  totalActual: number;
  remainingBudget: number;
  unallocatedBudget: number;
  isOverBudget: boolean;
  overageAmount: number;
  percentageUsed: number;
  categoryBreakdowns: CategorySummary[];
}

export function calculateBudgetMetrics(
  totalBudget: number,
  expenses: Array<{
    category: string;
    allocatedAmount: number;
    actualAmount: number;
  }>
): BudgetSummary {
  const safeTotalBudget = Number(totalBudget) || 0;

  let totalAllocated = 0;
  let totalActual = 0;

  const categoryMap: Record<
    string,
    { allocated: number; actual: number; count: number }
  > = {};

  for (const exp of expenses) {
    const allocated = Number(exp.allocatedAmount) || 0;
    const actual = Number(exp.actualAmount) || 0;
    const cat = exp.category || 'Miscellaneous';

    totalAllocated += allocated;
    totalActual += actual;

    if (!categoryMap[cat]) {
      categoryMap[cat] = { allocated: 0, actual: 0, count: 0 };
    }
    categoryMap[cat].allocated += allocated;
    categoryMap[cat].actual += actual;
    categoryMap[cat].count += 1;
  }

  // Round decimals to 2 places
  totalAllocated = Math.round(totalAllocated * 100) / 100;
  totalActual = Math.round(totalActual * 100) / 100;

  const remainingBudget = Math.round((safeTotalBudget - totalActual) * 100) / 100;
  const unallocatedBudget = Math.round((safeTotalBudget - totalAllocated) * 100) / 100;
  const isOverBudget = totalActual > safeTotalBudget;
  const overageAmount = isOverBudget ? Math.round((totalActual - safeTotalBudget) * 100) / 100 : 0;
  const percentageUsed = safeTotalBudget > 0
    ? Math.min(100, Math.round((totalActual / safeTotalBudget) * 1000) / 10)
    : 0;

  const categoryBreakdowns: CategorySummary[] = Object.keys(categoryMap).map((cat) => {
    const item = categoryMap[cat];
    const catAllocated = Math.round(item.allocated * 100) / 100;
    const catActual = Math.round(item.actual * 100) / 100;
    const catRemaining = Math.round((catAllocated - catActual) * 100) / 100;
    const percentUsed = catAllocated > 0
      ? Math.round((catActual / catAllocated) * 1000) / 10
      : (catActual > 0 ? 100 : 0);

    return {
      category: cat,
      allocated: catAllocated,
      actual: catActual,
      remaining: catRemaining,
      percentUsed,
      isOverBudget: catActual > catAllocated && catAllocated > 0,
      expenseCount: item.count
    };
  });

  return {
    totalBudget: safeTotalBudget,
    totalAllocated,
    totalActual,
    remainingBudget,
    unallocatedBudget,
    isOverBudget,
    overageAmount,
    percentageUsed,
    categoryBreakdowns
  };
}
