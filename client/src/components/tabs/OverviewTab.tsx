import React from 'react';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  CheckSquare,
  Sparkles,
  Clock,
  Heart,
  Palette,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { EventItem } from '../../types/index.js';
import { Card } from '../Card.js';
import { Button } from '../Button.js';
import { formatCurrency, formatDate, getDaysRemaining, getEventTypeBadge } from '../../utils/formatters.js';

interface OverviewTabProps {
  event: EventItem;
  setActiveTab: (tab: 'overview' | 'ai' | 'budget' | 'tasks' | 'vendors') => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ event, setActiveTab }) => {
  const daysInfo = getDaysRemaining(event.date);
  const badge = getEventTypeBadge(event.eventType);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-slate-900 via-rose-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                {badge.label}
              </span>
              <span className="text-xs text-rose-200 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {daysInfo.label}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{event.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-400" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" />
                {event.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-rose-400" />
                {event.guestCount} Expected Guests
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              variant="primary"
              className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 font-bold"
              onClick={() => setActiveTab('ai')}
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              Launch Gemini AI Planner
            </Button>
          </div>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Theme & Style */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">Theme & Style Concept</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {event.theme || 'Classic & Timeless celebration styling.'}
          </p>
        </Card>

        {/* Dietary Considerations */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Dietary Accommodations</h3>
          </div>
          {event.dietaryRequirements && event.dietaryRequirements.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {event.dietaryRequirements.map((d, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200"
                >
                  {d}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Standard catering menu.</p>
          )}
        </Card>

        {/* Accessibility Considerations */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Accessibility Accommodations</h3>
          </div>
          {event.accessibilityRequirements && event.accessibilityRequirements.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {event.accessibilityRequirements.map((a, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 text-[11px] font-medium border border-purple-200"
                >
                  {a}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Standard accessibility.</p>
          )}
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div
          onClick={() => setActiveTab('budget')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Budget Manager</h3>
          <p className="text-xs text-slate-500 mt-1">
            Ceiling: <span className="font-semibold text-slate-700">{formatCurrency(event.budget, event.currency)}</span>. View expenses and variances.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('tasks')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <CheckSquare className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Timeline Checklist</h3>
          <p className="text-xs text-slate-500 mt-1">
            Track milestones, preparation deadlines, and day-of run of show.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('vendors')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Vendor Directory</h3>
          <p className="text-xs text-slate-500 mt-1">
            Compare vendor quotes, store contact information, and track booking status.
          </p>
        </div>
      </div>
    </div>
  );
};
