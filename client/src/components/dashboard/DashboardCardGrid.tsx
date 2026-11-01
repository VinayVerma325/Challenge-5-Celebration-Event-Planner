import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Cake,
  Calculator,
  Calendar,
  CheckSquare,
  ChevronRight,
  Circle,
  Heart,
  Palette,
  Plus,
  Sparkles,
  Store,
  Users,
  Utensils
} from 'lucide-react';
import { formatDate, formatCurrency, getDaysRemaining } from '../../utils/formatters.js';

interface DashboardEventItem {
  id: string;
  title: string;
  eventType: string;
  date: string;
  location: string;
  guestCount: number;
  budget: number;
  currency: string;
  spent: number;
  taskCount: number;
  taskPercentage: number;
}

interface DashboardTaskItem {
  id: string;
  eventId: string;
  title: string;
  category: string;
  dueDate: string;
  priority: string;
  isOverdue: boolean;
}

interface DashboardCardGridProps {
  filteredEvents: DashboardEventItem[];
  stats: {
    totalEvents: number;
    completedTasks: number;
    pendingTasks: number;
    totalBudget: number;
    totalSpent: number;
  };
  urgentTasks: DashboardTaskItem[];
  spotlightEvent: DashboardEventItem | null;
  onOpenCreate: () => void;
  onOpenAi: () => void;
  onOpenBudget: () => void;
  onOpenTasks: () => void;
  onOpenVendors: () => void;
  onOpenGuests: () => void;
  onOpenTheme: () => void;
  onOpenMenu: () => void;
  onSelectEvent: (id: string) => void;
  onSelectTaskEvent: (eventId: string) => void;
}

/**
 * 4 Middle Frosted Glass Cards: Upcoming Celebrations, Quick Access Studio, To-Do, and Spotlight Event.
 */
export const DashboardCardGrid: React.FC<DashboardCardGridProps> = ({
  filteredEvents,
  stats,
  urgentTasks,
  spotlightEvent,
  onOpenCreate,
  onOpenAi,
  onOpenBudget,
  onOpenTasks,
  onOpenVendors,
  onOpenGuests,
  onOpenTheme,
  onOpenMenu,
  onSelectEvent,
  onSelectTaskEvent
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {/* ----- CARD 1: Upcoming Celebrations ----- */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-lg shadow-slate-200/40 flex flex-col justify-between hover:shadow-xl transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 mb-3">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              Upcoming Celebrations
            </h2>
            <Link
              to="/events"
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-full bg-white/80 border border-slate-200/60 shadow-2xs hover:bg-white transition-colors"
            >
              View all
            </Link>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 px-2 space-y-2">
              <p className="text-xs text-slate-500">No celebrations found.</p>
              <button
                type="button"
                onClick={onOpenCreate}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                + Plan a celebration
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEvents.slice(0, 5).map((evt) => {
                const daysInfo = getDaysRemaining(evt.date);
                const isWedding = evt.eventType.toLowerCase().includes('wedding');
                const isBirthday = evt.eventType.toLowerCase().includes('birthday');

                return (
                  <div
                    key={evt.id}
                    onClick={() => onSelectEvent(evt.id)}
                    className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/90 border border-transparent hover:border-white transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                          isWedding
                            ? 'bg-rose-500'
                            : isBirthday
                            ? 'bg-amber-500'
                            : 'bg-indigo-500'
                        }`}
                      >
                        {isWedding ? (
                          <Heart className="w-4 h-4 fill-white" />
                        ) : isBirthday ? (
                          <Cake className="w-4 h-4" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-rose-600 transition-colors truncate">
                          {evt.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {evt.location} • {formatDate(evt.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-full">
                        {daysInfo.days}d
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Quick Metric */}
        <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Total Celebrations</span>
          <span className="font-bold text-slate-800">{stats.totalEvents} planned</span>
        </div>
      </div>

      {/* ----- CARD 2: Quick Access Interactive Planning Hub ----- */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-lg shadow-slate-200/40 flex flex-col justify-between hover:shadow-xl transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 mb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Quick Access</h2>
            <button
              type="button"
              onClick={onOpenCreate}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-full bg-white/80 border border-slate-200/60 shadow-2xs hover:bg-white transition-colors cursor-pointer"
            >
              + New
            </button>
          </div>

          {/* 4x2 Grid of 8 Functional Interactive Tools */}
          <div className="grid grid-cols-4 gap-3 text-center">
            {/* Tile 1: AI Brainstormer Modal */}
            <button
              type="button"
              onClick={onOpenAi}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/80 border border-white/90 hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-xs group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-slate-600 truncate w-full">AI Plan</span>
            </button>

            {/* Tile 2: Smart Budget Calculator Modal */}
            <button
              type="button"
              onClick={onOpenBudget}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/80 border border-white/90 hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-xs group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Calculator className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-slate-600 truncate w-full">Budget</span>
            </button>

            {/* Tile 3: Task Manager Modal */}
            <button
              type="button"
              onClick={onOpenTasks}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/80 border border-white/90 hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-xs group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <CheckSquare className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-slate-600 truncate w-full">To-Do</span>
            </button>

            {/* Tile 4: Vendor Guide Modal */}
            <button
              type="button"
              onClick={onOpenVendors}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/80 border border-white/90 hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-xs group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Store className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-slate-600 truncate w-full">Vendors</span>
            </button>

            {/* Tile 5: Guest Seating & Catering Estimator Modal */}
            <button
              type="button"
              onClick={onOpenGuests}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/80 border border-white/90 hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-xs group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-slate-600 truncate w-full">Guests</span>
            </button>

            {/* Tile 6: Theme & Color Palette Studio Modal */}
            <button
              type="button"
              onClick={onOpenTheme}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/80 border border-white/90 hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-xs group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Palette className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-slate-600 truncate w-full">Decor</span>
            </button>

            {/* Tile 7: Menu & Course Builder Modal */}
            <button
              type="button"
              onClick={onOpenMenu}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/80 border border-white/90 hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-xs group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Utensils className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-slate-600 truncate w-full">Catering</span>
            </button>

            {/* Tile 8: Plan Event Modal */}
            <button
              type="button"
              onClick={onOpenCreate}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/80 border border-dashed border-slate-300 hover:bg-white hover:border-rose-400 hover:scale-105 active:scale-95 transition-all shadow-xs group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 truncate w-full">+ Plan</span>
            </button>
          </div>
        </div>

        {/* Bottom Quick Metric */}
        <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Intelligent Planner</span>
          <span className="font-bold text-purple-600">Gemini Active</span>
        </div>
      </div>

      {/* ----- CARD 3: To Do Urgent Checklists ----- */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-lg shadow-slate-200/40 flex flex-col justify-between hover:shadow-xl transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 mb-3">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              To Do
            </h2>
            <button
              type="button"
              onClick={onOpenTasks}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-full bg-white/80 border border-slate-200/60 shadow-2xs hover:bg-white transition-colors cursor-pointer"
            >
              + Manage
            </button>
          </div>

          {urgentTasks.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 space-y-1">
              <p>All deadlines cleared! 🎉</p>
              <p className="text-[11px] text-slate-400">Everything is on schedule.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {urgentTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTaskEvent(task.eventId)}
                  className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/90 border border-transparent hover:border-white transition-all cursor-pointer group"
                >
                  <div className="text-blue-600 shrink-0">
                    <Circle className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                      {task.title}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {task.isOverdue ? (
                        <span className="text-red-500 font-bold">Overdue</span>
                      ) : (
                        formatDate(task.dueDate)
                      )}
                    </p>
                  </div>
                  <span className="text-[10px] capitalize px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 shrink-0">
                    {task.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Completed</span>
            <span className="font-bold text-slate-800">
              {stats.completedTasks} / {stats.completedTasks + stats.pendingTasks || 1}
            </span>
          </div>
          <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${
                  stats.completedTasks + stats.pendingTasks > 0
                    ? Math.round(
                        (stats.completedTasks /
                          (stats.completedTasks + stats.pendingTasks)) *
                          100
                      )
                    : 0
                }%`
              }}
            />
          </div>
        </div>
      </div>

      {/* ----- CARD 4: Spotlight Celebration ----- */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl overflow-hidden shadow-lg shadow-slate-200/40 flex flex-col justify-between hover:shadow-xl transition-all">
        {spotlightEvent ? (
          <>
            {/* Top Image Preview Banner */}
            <div className="relative h-36 bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 p-4 text-white flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                  Spotlight
                </span>
                <span className="text-[11px] font-semibold text-amber-300">
                  {getDaysRemaining(spotlightEvent.date).label}
                </span>
              </div>

              <div className="relative z-10">
                <h3 className="text-base font-extrabold truncate drop-shadow-sm">
                  {spotlightEvent.title}
                </h3>
                <p className="text-[11px] text-slate-200 truncate mt-0.5">
                  {spotlightEvent.location} • {spotlightEvent.guestCount} Guests
                </p>
              </div>
            </div>

            {/* Body Content */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Planned Budget:</span>
                <span className="font-extrabold text-slate-800">
                  {formatCurrency(spotlightEvent.budget, spotlightEvent.currency)}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Checklist Progress</span>
                  <span className="font-bold text-slate-800">{spotlightEvent.taskPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${spotlightEvent.taskPercentage}%` }}
                  />
                </div>
              </div>

              {/* Bottom Action Button */}
              <button
                type="button"
                onClick={() => onSelectEvent(spotlightEvent.id)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Open Event Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center h-full flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">No Celebrations Yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Create your first celebration to activate smart spotlights and AI planning.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenCreate}
              className="px-4 py-2 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
            >
              + Create First Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
