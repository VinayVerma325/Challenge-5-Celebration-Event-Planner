import React, { useState } from 'react';
import { Modal } from '../Modal.js';
import { Input } from '../Input.js';
import { Select } from '../Select.js';
import { formatCurrency } from '../../utils/formatters.js';

interface BudgetCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetCalculatorModal: React.FC<BudgetCalculatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [budgetAmount, setBudgetAmount] = useState<number>(10000);
  const [currency, setCurrency] = useState('USD');

  const allocations = [
    { name: 'Venue & Facilities', pct: 30, color: 'bg-rose-500' },
    { name: 'Catering & Beverages', pct: 30, color: 'bg-amber-500' },
    { name: 'Photography & Cinema', pct: 12, color: 'bg-blue-500' },
    { name: 'Decor, Styling & Floral', pct: 10, color: 'bg-pink-500' },
    { name: 'Entertainment & Audio', pct: 8, color: 'bg-purple-500' },
    { name: 'Day-of Contingency Buffer', pct: 10, color: 'bg-emerald-500' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Celebration Budget Allocation Calculator"
      description="Estimate category distributions and prevent budget overruns"
      maxWidth="lg"
    >
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Total Planned Budget"
            type="number"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(Math.max(0, Number(e.target.value)))}
          />
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={[
              { value: 'USD', label: 'USD ($)' },
              { value: 'INR', label: 'INR (₹)' },
              { value: 'EUR', label: 'EUR (€)' },
              { value: 'GBP', label: 'GBP (£)' }
            ]}
          />
        </div>

        <div className="space-y-2 pt-2">
          {allocations.map((item, idx) => {
            const amount = Math.round((budgetAmount * item.pct) / 100);
            return (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <span className="text-slate-400">({item.pct}%)</span>
                </div>
                <span className="font-extrabold text-slate-900">
                  {formatCurrency(amount, currency)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed font-medium">
          💡 Pro-tip: Keep 10% in the contingency buffer to cover last-minute gratuities, weather changes, or extra guest seating.
        </div>
      </div>
    </Modal>
  );
};
