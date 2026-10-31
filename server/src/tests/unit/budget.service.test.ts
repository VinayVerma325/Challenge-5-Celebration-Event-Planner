import { describe, it, expect } from 'vitest';
import { calculateBudgetMetrics } from '../../services/budget.service.js';

describe('Budget Service Unit Tests', () => {
  it('should handle zero expenses accurately', () => {
    const summary = calculateBudgetMetrics(10000, []);

    expect(summary.totalBudget).toBe(10000);
    expect(summary.totalAllocated).toBe(0);
    expect(summary.totalActual).toBe(0);
    expect(summary.remainingBudget).toBe(10000);
    expect(summary.unallocatedBudget).toBe(10000);
    expect(summary.isOverBudget).toBe(false);
    expect(summary.overageAmount).toBe(0);
    expect(summary.percentageUsed).toBe(0);
    expect(summary.categoryBreakdowns).toHaveLength(0);
  });

  it('should aggregate expenses by category and calculate remaining amounts', () => {
    const expenses = [
      { category: 'Venue', allocatedAmount: 3000, actualAmount: 2800 },
      { category: 'Catering', allocatedAmount: 2500, actualAmount: 2400 },
      { category: 'Photography', allocatedAmount: 1500, actualAmount: 1500 }
    ];

    const summary = calculateBudgetMetrics(10000, expenses);

    expect(summary.totalBudget).toBe(10000);
    expect(summary.totalAllocated).toBe(7000);
    expect(summary.totalActual).toBe(6700);
    expect(summary.remainingBudget).toBe(3300);
    expect(summary.unallocatedBudget).toBe(3000);
    expect(summary.isOverBudget).toBe(false);
    expect(summary.percentageUsed).toBe(67);

    const venue = summary.categoryBreakdowns.find((c) => c.category === 'Venue');
    expect(venue).toBeDefined();
    expect(venue?.allocated).toBe(3000);
    expect(venue?.actual).toBe(2800);
    expect(venue?.remaining).toBe(200);
    expect(venue?.isOverBudget).toBe(false);
  });

  it('should detect overall budget overruns accurately', () => {
    const expenses = [
      { category: 'Venue', allocatedAmount: 4000, actualAmount: 4500 },
      { category: 'Catering', allocatedAmount: 2000, actualAmount: 2200 }
    ];

    const summary = calculateBudgetMetrics(6000, expenses);

    expect(summary.totalActual).toBe(6700);
    expect(summary.isOverBudget).toBe(true);
    expect(summary.overageAmount).toBe(700);
    expect(summary.remainingBudget).toBe(-700);
  });

  it('should handle decimal values properly without float precision drift', () => {
    const expenses = [
      { category: 'Decor & Flowers', allocatedAmount: 125.45, actualAmount: 125.45 },
      { category: 'Miscellaneous', allocatedAmount: 89.99, actualAmount: 90.15 }
    ];

    const summary = calculateBudgetMetrics(500.5, expenses);

    expect(summary.totalAllocated).toBe(215.44);
    expect(summary.totalActual).toBe(215.6);
    expect(summary.remainingBudget).toBe(284.9);
  });

  it('should flag category overruns when actual exceeds allocated', () => {
    const expenses = [
      { category: 'Entertainment', allocatedAmount: 500, actualAmount: 750 }
    ];

    const summary = calculateBudgetMetrics(2000, expenses);
    const entertainment = summary.categoryBreakdowns.find((c) => c.category === 'Entertainment');

    expect(entertainment?.isOverBudget).toBe(true);
    expect(entertainment?.remaining).toBe(-250);
  });
});
