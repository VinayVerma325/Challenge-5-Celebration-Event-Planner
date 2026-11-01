import React from 'react';
import { MapPin, Plus, Sparkles, User } from 'lucide-react';
import { LiveClock } from '../LiveClock.js';

interface DashboardHeaderProps {
  greeting: string;
  userName?: string;
  weather: {
    temp: string;
    condition: string;
    city: string;
    country: string;
    isLoading: boolean;
    error: boolean;
  };
  weatherIcon: React.ReactNode;
  onOpenCreate: () => void;
  onOpenAi: () => void;
  onOpenProfile: () => void;
  onOpenWeather: () => void;
}

/**
 * Top Row Header with greeting, live clock, action pills, and interactive weather badge.
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  greeting,
  userName,
  weather,
  weatherIcon,
  onOpenCreate,
  onOpenAi,
  onOpenProfile,
  onOpenWeather
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left: Greeting Pill */}
      <div className="w-full md:w-auto flex items-center justify-between md:justify-start">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm text-xs font-semibold text-slate-700">
          <span>
            {greeting}, {userName || 'Celebration Host'}
          </span>
          <span className="text-sm">👋</span>
        </div>

        {/* Mobile Quick Create */}
        <button
          type="button"
          onClick={onOpenCreate}
          className="lg:hidden px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Plan Event
        </button>
      </div>

      {/* Center: Sleek Digital Clock & Date Display */}
      <LiveClock />

      {/* Right: Action Pills & Real Weather Widget */}
      <div className="flex items-center gap-3">
        {/* Action Buttons Pill */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm">
          <button
            type="button"
            onClick={onOpenCreate}
            title="Plan New Celebration (+)"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-rose-600" />
          </button>
          <button
            type="button"
            onClick={onOpenAi}
            title="Live AI Celebration Idea Generator"
            className="p-2 rounded-xl text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          {/* User Profile & Account Hub Button */}
          <button
            type="button"
            onClick={onOpenProfile}
            title="Host Profile & Account Controls"
            className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-white/80 transition-all cursor-pointer"
          >
            <User className="w-4 h-4 text-slate-700" />
          </button>
        </div>

        {/* 100% REAL LIVE WEATHER WIDGET (Click to set exact city/location) */}
        <div
          onClick={onOpenWeather}
          title="Click to set exact city, detect GPS, or refresh live weather"
          className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm text-slate-700 cursor-pointer hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          <div className="p-2 rounded-xl bg-blue-50/80 group-hover:scale-105 transition-transform">
            {weatherIcon}
          </div>
          <div className="text-left text-xs leading-tight">
            <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <span>{weather.temp}</span>
              <span className="text-[10px] font-semibold text-slate-400">
                • {weather.condition}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
              <span>{weather.city}</span>
              <span className="text-[9px] text-rose-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                (change)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
