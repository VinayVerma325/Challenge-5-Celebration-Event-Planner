import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  CheckSquare,
  AlertTriangle,
  Plus,
  Sparkles,
  ArrowRight,
  MapPin,
  Users,
  Clock
} from 'lucide-react';
import { dashboardService, DashboardSummary } from '../services/dashboard.service.js';
import { StatCard } from '../components/StatCard.js';
import { Card } from '../components/Card.js';
import { Button } from '../components/Button.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { Badge } from '../components/Badge.js';
import { LoadingSkeleton } from '../components/LoadingSkeleton.js';
import { EmptyState } from '../components/EmptyState.js';
import { Alert } from '../components/Alert.js';
import { formatCurrency, formatDate, getDaysRemaining, getEventTypeBadge } from '../utils/formatters.js';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        const res = await dashboardService.getSummary();
        if (res.success) {
          setData(res);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <LoadingSkeleton count={4} height="h-28" />
        <LoadingSkeleton count={2} height="h-64" />
      </div>
    );
  }

  const stats = data?.stats || {
    totalEvents: 0,
    upcomingEventsCount: 0,
    totalBudget: 0,
    totalSpent: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  };

  const upcomingEvents = data?.upcomingEvents || [];
  const urgentTasks = data?.urgentTasks || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-rose-950/10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-rose-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI-Assisted Event Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Celebration Overview</h1>
          <p className="text-rose-100 text-sm mt-1 max-w-xl">
            Track budgets, coordinate milestone timelines, organize vendors, and generate personalized ideas for your celebrations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            className="bg-white text-rose-900 hover:bg-rose-50 shadow-md font-bold"
            onClick={() => navigate('/events?action=new')}
          >
            <Plus className="w-4 h-4" />
            Plan New Event
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Events"
          value={stats.totalEvents}
          subtext={`${stats.upcomingEventsCount} upcoming celebrations`}
          icon={<Calendar className="w-5 h-5 text-rose-600" />}
          iconBg="bg-rose-50"
        />

        <StatCard
          title="Planned Budget"
          value={formatCurrency(stats.totalBudget)}
          subtext={`Actual Spent: ${formatCurrency(stats.totalSpent)}`}
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />

        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          subtext={`${stats.completedTasks} tasks completed`}
          icon={<CheckSquare className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
        />

        <StatCard
          title="Overdue Tasks"
          value={stats.overdueTasks}
          subtext={stats.overdueTasks > 0 ? 'Requires immediate action' : 'All deadlines on track'}
          icon={<AlertTriangle className={`w-5 h-5 ${stats.overdueTasks > 0 ? 'text-red-600' : 'text-slate-400'}`} />}
          iconBg={stats.overdueTasks > 0 ? 'bg-red-50' : 'bg-slate-100'}
        />
      </div>

      {/* Main Content Sections: Upcoming Events & Urgent Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upcoming Events (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upcoming Celebrations</h2>
              <p className="text-xs text-slate-500">Upcoming weddings, birthdays, and community gatherings</p>
            </div>
            <Link
              to="/events"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 focus:outline-none focus-visible:underline"
            >
              View All Events
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-8 h-8" />}
              title="No celebrations planned yet"
              description="Create your first wedding, birthday party, anniversary, or community event to activate AI planning."
              actionLabel="Create First Event"
              onAction={() => navigate('/events?action=new')}
            />
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((evt) => {
                const daysInfo = getDaysRemaining(evt.date);
                const badge = getEventTypeBadge(evt.eventType);

                return (
                  <Card
                    key={evt.id}
                    className="p-5 hover:border-rose-300 transition-all cursor-pointer"
                    onClick={() => navigate(`/events/${evt.id}`)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {daysInfo.label}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 hover:text-rose-600 transition-colors">
                          {evt.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(evt.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {evt.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {evt.guestCount} guests
                          </span>
                        </div>
                      </div>

                      <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 flex sm:flex-col justify-between sm:justify-center items-end">
                        <div>
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Budget Planned
                          </p>
                          <p className="text-base font-extrabold text-slate-900">
                            {formatCurrency(evt.budget, evt.currency)}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Spent: <span className="font-semibold">{formatCurrency(evt.spent, evt.currency)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Task Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <ProgressBar
                        value={evt.taskPercentage}
                        size="sm"
                        label={`Task Completion (${evt.taskPercentage}%)`}
                        subLabel={`${evt.taskCount} checklist tasks tracked`}
                        variant={evt.taskPercentage >= 75 ? 'emerald' : evt.taskPercentage >= 40 ? 'amber' : 'rose'}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Urgent Tasks & Quick Planner (1 col) */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-rose-600" />
                Upcoming Task Deadlines
              </h2>
              {urgentTasks.length > 0 && (
                <Badge variant={stats.overdueTasks > 0 ? 'red' : 'slate'} size="sm">
                  {urgentTasks.length} pending
                </Badge>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {urgentTasks.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No pending tasks due! Everything is up to date.
                </p>
              ) : (
                urgentTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border text-xs transition-colors ${
                      task.isOverdue
                        ? 'bg-red-50/60 border-red-200 text-red-900'
                        : 'bg-slate-50 border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold line-clamp-1">{task.title}</span>
                      {task.isOverdue ? (
                        <span className="px-1.5 py-0.5 rounded bg-red-200/80 text-red-800 text-[10px] font-bold shrink-0">
                          Overdue
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/50 text-[11px] text-slate-500">
                      <span className="capitalize">{task.category}</span>
                      <Link
                        to={`/events/${task.eventId}?tab=tasks`}
                        className="font-medium text-rose-600 hover:text-rose-700"
                      >
                        Open Checklist →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* AI Helper Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-200/60 text-slate-800">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-sm">Need Celebration Inspiration?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Open any celebration to use the Gemini GenAI Assistant to draft themes, tailored decor concepts, budget breakdowns, and vendor checklists.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white text-xs font-semibold"
              onClick={() => navigate('/events')}
            >
              Explore Events & AI Assistant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
