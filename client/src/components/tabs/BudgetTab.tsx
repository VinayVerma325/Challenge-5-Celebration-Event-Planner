import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  PieChart,
  Tag
} from 'lucide-react';
import { expenseService } from '../../services/expense.service.js';
import { EventItem, ExpenseItem, BudgetSummary, ExpenseCategory, PaidStatus } from '../../types/index.js';
import { Card } from '../Card.js';
import { Button } from '../Button.js';
import { Input } from '../Input.js';
import { Select } from '../Select.js';
import { Modal } from '../Modal.js';
import { ProgressBar } from '../ProgressBar.js';
import { EmptyState } from '../EmptyState.js';
import { LoadingSkeleton } from '../LoadingSkeleton.js';
import { Alert } from '../Alert.js';
import { formatCurrency } from '../../utils/formatters.js';
import { getErrorMessage } from '../../utils/error.js';

interface BudgetTabProps {
  event: EventItem;
}

const CATEGORIES: ExpenseCategory[] = [
  'Venue',
  'Catering',
  'Photography',
  'Decor & Flowers',
  'Entertainment',
  'Attire & Beauty',
  'Invitations & Favors',
  'Transport & Lodging',
  'Miscellaneous'
];

export const BudgetTab: React.FC<BudgetTabProps> = ({ event }) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: 'Venue' as ExpenseCategory,
    title: '',
    allocatedAmount: 0,
    actualAmount: 0,
    paidStatus: 'unpaid' as PaidStatus,
    notes: ''
  });

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await expenseService.list(event._id);
      if (res.success) {
        setExpenses(res.expenses);
        setBudgetSummary(res.budgetSummary);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load expenses'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [event._id]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      category: 'Venue',
      title: '',
      allocatedAmount: 0,
      actualAmount: 0,
      paidStatus: 'unpaid',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: ExpenseItem) => {
    setEditingExpense(exp);
    setFormData({
      category: exp.category,
      title: exp.title,
      allocatedAmount: exp.allocatedAmount,
      actualAmount: exp.actualAmount,
      paidStatus: exp.paidStatus,
      notes: exp.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide an expense title');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingExpense) {
        await expenseService.update(event._id, editingExpense._id, formData);
        setSuccessMsg('Expense updated successfully');
      } else {
        await expenseService.create(event._id, formData);
        setSuccessMsg('Expense added successfully');
      }
      setIsModalOpen(false);
      loadExpenses();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save expense'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseService.delete(event._id, id);
      setSuccessMsg('Expense deleted successfully');
      loadExpenses();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete expense'));
    }
  };

  if (isLoading) {
    return <LoadingSkeleton count={3} height="h-32" />;
  }

  const summary = budgetSummary || {
    totalBudget: event.budget,
    totalAllocated: 0,
    totalActual: 0,
    remainingBudget: event.budget,
    unallocatedBudget: event.budget,
    isOverBudget: false,
    overageAmount: 0,
    percentageUsed: 0,
    categoryBreakdowns: []
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Budget & Expense Manager</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor planned budgets, category allocations, actual spending, and variances
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
      {successMsg && <Alert type="success" message={successMsg} onDismiss={() => setSuccessMsg(null)} />}

      {/* Budget Overrun Warning Banner (Part 4 D) */}
      {summary.isOverBudget && (
        <Alert
          type="error"
          title="Overall Budget Overrun Warning!"
          message={`Total actual spending (${formatCurrency(summary.totalActual, event.currency)}) exceeds the planned event budget (${formatCurrency(summary.totalBudget, event.currency)}) by ${formatCurrency(summary.overageAmount, event.currency)}.`}
        />
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-slate-700">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Target Event Budget
          </span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {formatCurrency(summary.totalBudget, event.currency)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Configured event ceiling</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-600">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Allocated Budget
          </span>
          <span className="text-xl font-black text-blue-900 mt-1 block">
            {formatCurrency(summary.totalAllocated, event.currency)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {summary.unallocatedBudget >= 0
              ? `${formatCurrency(summary.unallocatedBudget, event.currency)} unallocated`
              : 'Allocations exceed budget'}
          </span>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-600">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Actual Spent
          </span>
          <span className="text-xl font-black text-amber-900 mt-1 block">
            {formatCurrency(summary.totalActual, event.currency)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {summary.percentageUsed}% of planned budget used
          </span>
        </Card>

        <Card
          className={`p-4 border-l-4 ${
            summary.remainingBudget >= 0 ? 'border-l-emerald-600' : 'border-l-red-600'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Remaining Budget
          </span>
          <span
            className={`text-xl font-black mt-1 block ${
              summary.remainingBudget >= 0 ? 'text-emerald-900' : 'text-red-600'
            }`}
          >
            {formatCurrency(summary.remainingBudget, event.currency)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {summary.remainingBudget >= 0 ? 'Within budget bounds' : 'Budget deficit'}
          </span>
        </Card>
      </div>

      {/* Category Progress Breakdown */}
      {summary.categoryBreakdowns.length > 0 && (
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-rose-600" />
            Category Allocation & Spending Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {summary.categoryBreakdowns.map((cat) => (
              <div key={cat.category} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-900">{cat.category}</span>
                  {cat.isOverBudget && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                      Over Allocated
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                  <span>Spent: {formatCurrency(cat.actual, event.currency)}</span>
                  <span>Allocated: {formatCurrency(cat.allocated, event.currency)}</span>
                </div>
                <ProgressBar
                  value={cat.percentUsed}
                  size="sm"
                  variant={cat.isOverBudget ? 'rose' : cat.percentUsed > 80 ? 'amber' : 'emerald'}
                  showPercentage={false}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Expenses Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-500" />
            Itemized Expense List ({expenses.length})
          </h3>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<DollarSign className="w-8 h-8" />}
              title="No expenses logged yet"
              description="Add your first celebration expense or apply budget suggestions from the AI Planner."
              actionLabel="Add Expense"
              onAction={handleOpenAdd}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Expenses table">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3">Expense Title</th>
                  <th scope="col" className="px-4 py-3">Category</th>
                  <th scope="col" className="px-4 py-3 text-right">Allocated</th>
                  <th scope="col" className="px-4 py-3 text-right">Actual Spent</th>
                  <th scope="col" className="px-4 py-3">Payment Status</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-slate-900 block">{exp.title}</span>
                      {exp.notes && <span className="text-[11px] text-slate-400 block mt-0.5">{exp.notes}</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium">
                      {formatCurrency(exp.allocatedAmount, event.currency)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {formatCurrency(exp.actualAmount, event.currency)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          exp.paidStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : exp.paidStatus === 'partially_paid'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {exp.paidStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(exp)}
                          aria-label={`Edit ${exp.title}`}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(exp._id)}
                          aria-label={`Delete ${exp.title}`}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense Item' : 'Add New Expense Item'}
        description="Track planned allocation and actual payments"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Expense Item Title"
            required
            placeholder="e.g. Venue Booking Deposit or Photography Package"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Select
            label="Category"
            options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Allocated Amount"
              type="number"
              min={0}
              step="any"
              value={formData.allocatedAmount}
              onChange={(e) =>
                setFormData({ ...formData, allocatedAmount: parseFloat(e.target.value) || 0 })
              }
            />

            <Input
              label="Actual Amount Spent"
              type="number"
              min={0}
              step="any"
              value={formData.actualAmount}
              onChange={(e) =>
                setFormData({ ...formData, actualAmount: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <Select
            label="Payment Status"
            options={[
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'partially_paid', label: 'Partially Paid' },
              { value: 'paid', label: 'Paid in Full' }
            ]}
            value={formData.paidStatus}
            onChange={(e) => setFormData({ ...formData, paidStatus: e.target.value as PaidStatus })}
          />

          <Input
            label="Notes / Vendor Reference"
            placeholder="e.g. 50% deposit paid via bank transfer, balance due 7 days before event"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingExpense ? 'Update Expense' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
