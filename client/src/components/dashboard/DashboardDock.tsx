import React from 'react';
import { Calendar, Clock, DollarSign, Plus, Sparkles, Store } from 'lucide-react';

interface DashboardDockProps {
  onOpenCreate: () => void;
  onOpenTasks: () => void;
  onOpenBudget: () => void;
  onOpenVendors: () => void;
  onOpenAi: () => void;
  onNavigateEvents: () => void;
}

/**
 * Floating Left Navigation Dock with quick tools and planner shortcuts.
 */
export const DashboardDock: React.FC<DashboardDockProps> = ({
  onOpenCreate,
  onOpenTasks,
  onOpenBudget,
  onOpenVendors,
  onOpenAi,
  onNavigateEvents
}) => {
  return (
    <aside
      aria-label="Quick Navigation Dock"
      className="hidden lg:flex flex-col items-center justify-between w-16 bg-white/75 backdrop-blur-2xl border border-white/80 rounded-3xl p-3 shadow-xl shadow-slate-300/30 shrink-0 self-start sticky top-20 h-[calc(100vh-6rem)]"
    >
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Active Home / Dashboard */}
        <button
          type="button"
          title="Dashboard Overview"
          className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
        </button>

        {/* Events Navigation (Full catalog) */}
        <button
          type="button"
          onClick={onNavigateEvents}
          title="All Celebrations Catalog"
          className="w-11 h-11 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-105"
        >
          <Calendar className="w-5 h-5" />
        </button>

        {/* Tasks Tool Modal */}
        <button
          type="button"
          onClick={onOpenTasks}
          title="Celebration To-Do Manager"
          className="w-11 h-11 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-105"
        >
          <Clock className="w-5 h-5" />
        </button>

        {/* Budget Calculator Tool Modal */}
        <button
          type="button"
          onClick={onOpenBudget}
          title="Smart Budget Allocation Calculator"
          className="w-11 h-11 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-105"
        >
          <DollarSign className="w-5 h-5" />
        </button>

        {/* Vendor Guide Tool Modal */}
        <button
          type="button"
          onClick={onOpenVendors}
          title="Vendor Checklist & Screening Guide"
          className="w-11 h-11 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-105"
        >
          <Store className="w-5 h-5" />
        </button>

        {/* AI Brainstormer Modal */}
        <button
          type="button"
          onClick={onOpenAi}
          title="AI Celebration Brainstormer"
          className="w-11 h-11 rounded-2xl text-purple-600 hover:text-purple-700 hover:bg-purple-50 flex items-center justify-center transition-all hover:scale-105"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Create + Button at bottom of dock */}
      <div className="w-full pt-3 border-t border-slate-200/60 flex justify-center">
        <button
          type="button"
          onClick={onOpenCreate}
          title="Plan New Celebration (+)"
          className="w-11 h-11 rounded-2xl bg-white/90 text-slate-700 hover:text-rose-600 hover:bg-white flex items-center justify-center shadow-sm border border-white/80 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
