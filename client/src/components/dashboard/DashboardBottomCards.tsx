import React from 'react';
import { DollarSign, Edit3, FileText, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

interface DashboardBottomCardsProps {
  noteContent: string;
  isEditingNote: boolean;
  tempNote: string;
  onSetTempNote: (val: string) => void;
  onToggleEditingNote: () => void;
  onSaveNote: () => void;
  onCancelNote: () => void;
  stats: {
    totalBudget: number;
    totalSpent: number;
  };
  onOpenBudgetCalc: () => void;
}

/**
 * 3 Bottom Frosted Cards: Real Persistent Notes, Inspiration Quote, and Budget Overview.
 */
export const DashboardBottomCards: React.FC<DashboardBottomCardsProps> = ({
  noteContent,
  isEditingNote,
  tempNote,
  onSetTempNote,
  onToggleEditingNote,
  onSaveNote,
  onCancelNote,
  stats,
  onOpenBudgetCalc
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 5: Real Editable Notes */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-lg shadow-slate-200/40 flex flex-col justify-between hover:shadow-xl transition-all">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                Celebration Notes
              </h3>
              <button
                type="button"
                onClick={onToggleEditingNote}
                title="Edit or update personal celebration note"
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {isEditingNote ? (
              <div className="space-y-2">
                <textarea
                  value={tempNote}
                  onChange={(e) => onSetTempNote(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                  placeholder="Write your celebration reminders or key notes..."
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={onCancelNote}
                    className="px-2.5 py-1 text-[11px] rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onSaveNote}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                "{noteContent}"
              </p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100/80 text-[10px] text-slate-400 font-medium">
            Personal Saved Host Note • Persists in browser
          </div>
        </div>

        {/* Card 6: Inspirational Quote */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-lg shadow-slate-200/40 flex flex-col justify-between hover:shadow-xl transition-all">
          <div>
            <div className="text-3xl font-serif text-slate-400 select-none">“</div>
            <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed italic">
              The best way to predict the future is to create it.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100/80 text-[11px] text-slate-500 font-semibold">
            — Peter Drucker
          </div>
        </div>

        {/* Card 7: Budget Summary */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-lg shadow-slate-200/40 flex flex-col justify-between hover:shadow-xl transition-all">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Budget Overview
              </h3>
              <button
                type="button"
                onClick={onOpenBudgetCalc}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Calculator
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80">
                <span className="text-slate-500">Planned Budget</span>
                <span className="font-extrabold text-slate-900">
                  {formatCurrency(stats.totalBudget)}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80">
                <span className="text-slate-500">Actual Expenses</span>
                <span className="font-bold text-slate-700">
                  {formatCurrency(stats.totalSpent)}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 text-emerald-900">
                <span className="font-semibold">Remaining</span>
                <span className="font-black">
                  {formatCurrency(Math.max(0, stats.totalBudget - stats.totalSpent))}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100/80 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            All celebrations financial health verified
          </div>
        </div>
      </div>

      {/* Bottom Ambient Quote Pill */}
      <div className="text-center pt-2 pb-4">
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/80 text-xs font-medium text-slate-500 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Stay organized, celebrate beautifully.
        </span>
      </div>
    </div>
  );
};
