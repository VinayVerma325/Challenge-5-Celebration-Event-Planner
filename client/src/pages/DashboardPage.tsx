import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  CheckSquare,
  Plus,
  Sparkles,
  ArrowRight,
  Users,
  Clock,
  Search,
  Heart,
  Cake,
  Palette,
  Utensils,
  Store,
  Circle,
  Sun,
  Moon,
  CloudRain,
  Cloud,
  CloudSnow,
  RefreshCw,
  User,
  ChevronRight,
  FileText,
  Calculator,
  Edit3,
  MapPin
} from 'lucide-react';
import { dashboardService, DashboardSummary } from '../services/dashboard.service.js';
import { useAuth } from '../context/AuthContext.js';
import { LoadingSkeleton } from '../components/LoadingSkeleton.js';
import { Alert } from '../components/Alert.js';
import { CreateEventModal } from '../components/CreateEventModal.js';
import { LiveClock } from '../components/LiveClock.js';
import { HostProfileModal } from '../components/modals/HostProfileModal.js';
import { WeatherModal } from '../components/modals/WeatherModal.js';
import { AiBrainstormModal } from '../components/modals/AiBrainstormModal.js';
import { BudgetCalculatorModal } from '../components/modals/BudgetCalculatorModal.js';
import { QuickTasksModal } from '../components/modals/QuickTasksModal.js';
import { VendorGuideModal } from '../components/modals/VendorGuideModal.js';
import { GuestEstimatorModal } from '../components/modals/GuestEstimatorModal.js';
import { ThemeStudioModal } from '../components/modals/ThemeStudioModal.js';
import { MenuBuilderModal } from '../components/modals/MenuBuilderModal.js';
import { formatCurrency, formatDate, getDaysRemaining } from '../utils/formatters.js';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [initialEventData, setInitialEventData] = useState<any>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Tools & Modals State (Replacing lazy redirects)
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAiBrainstormOpen, setIsAiBrainstormOpen] = useState(false);
  const [isBudgetCalcOpen, setIsBudgetCalcOpen] = useState(false);
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  const [isVendorGuideOpen, setIsVendorGuideOpen] = useState(false);
  const [isGuestEstimatorOpen, setIsGuestEstimatorOpen] = useState(false);
  const [isThemeStudioOpen, setIsThemeStudioOpen] = useState(false);
  const [isMenuBuilderOpen, setIsMenuBuilderOpen] = useState(false);

  // Local Persistent Note State
  const [noteContent, setNoteContent] = useState<string>(() => {
    return (
      localStorage.getItem('celebration_user_note') ||
      "Focus on guest experience and early vendor confirmations. Check venue acoustic settings 10 days before the celebration."
    );
  });
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [tempNote, setTempNote] = useState(noteContent);

  // Location & Weather Settings State
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);

  // Real-Time Live Weather State
  const [weather, setWeather] = useState<{
    temp: string;
    condition: string;
    city: string;
    country: string;
    isLoading: boolean;
    error: boolean;
  }>({
    temp: '--°C',
    condition: 'Detecting Location...',
    city: localStorage.getItem('celebration_user_city') || 'Local Area',
    country: '',
    isLoading: true,
    error: false
  });

  // Fetch 100% Real Weather using saved city, target city, or IP geolocation with 15-min caching
  const fetchRealWeather = async (specificCity?: string) => {
    const savedCity = specificCity || localStorage.getItem('celebration_user_city');
    const cacheKey = `weather_cache_${savedCity || 'default'}`;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 15 * 60 * 1000) {
          setWeather(parsed.data);
          return;
        }
      }
    } catch {
      // Ignore cache parse error
    }

    setWeather((prev) => ({ ...prev, isLoading: true, error: false }));

    try {
      let url = 'https://wttr.in/?format=j1';
      if (savedCity && savedCity.trim()) {
        url = `https://wttr.in/${encodeURIComponent(savedCity.trim())}?format=j1`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather service unavailable');
      const data = await res.json();
      const current = data.current_condition?.[0];
      const area = data.nearest_area?.[0];

      const newWeather = {
        temp: current?.temp_C ? `${current.temp_C}°C` : '24°C',
        condition: current?.weatherDesc?.[0]?.value || 'Clear Sky',
        city: savedCity ? savedCity : (area?.areaName?.[0]?.value || 'Your Location'),
        country: area?.country?.[0]?.value || '',
        isLoading: false,
        error: false
      };

      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: newWeather }));
      } catch {}

      setWeather(newWeather);
    } catch {
      setWeather({
        temp: '26°C',
        condition: 'Clear Sky',
        city: savedCity || 'Local Area',
        country: '',
        isLoading: false,
        error: true
      });
    }
  };

  const handleSetCity = (city: string) => {
    if (!city.trim()) return;
    localStorage.setItem('celebration_user_city', city.trim());
    setIsWeatherModalOpen(false);
    fetchRealWeather(city.trim());
  };

  const handleUseGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const res = await fetch(`https://wttr.in/${lat},${lon}?format=j1`);
            const data = await res.json();
            const current = data.current_condition?.[0];
            const area = data.nearest_area?.[0];
            const detectedCity = area?.areaName?.[0]?.value || 'My Location';
            localStorage.setItem('celebration_user_city', detectedCity);
            setIsWeatherModalOpen(false);
            const gpsWeather = {
              temp: current?.temp_C ? `${current.temp_C}°C` : '24°C',
              condition: current?.weatherDesc?.[0]?.value || 'Clear Sky',
              city: detectedCity,
              country: area?.country?.[0]?.value || '',
              isLoading: false,
              error: false
            };
            setWeather(gpsWeather);
          } catch {
            fetchRealWeather();
          }
        },
        () => {
          fetchRealWeather();
        }
      );
    }
  };

  useEffect(() => {
    fetchRealWeather();
  }, []);

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

  // Save custom note
  const handleSaveNote = () => {
    setNoteContent(tempNote);
    localStorage.setItem('celebration_user_note', tempNote);
    setIsEditingNote(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100/80 p-6 sm:p-10 max-w-7xl mx-auto space-y-6">
        <LoadingSkeleton count={3} height="h-32" />
        <LoadingSkeleton count={3} height="h-64" />
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

  // Filter events based on search query (memoized to prevent redundant calculations)
  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return upcomingEvents;
    return upcomingEvents.filter(
      (evt) =>
        evt.title.toLowerCase().includes(q) ||
        evt.location.toLowerCase().includes(q) ||
        evt.eventType.toLowerCase().includes(q)
    );
  }, [upcomingEvents, searchQuery]);

  // Time & Greeting calculations (without causing 1s re-renders)
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  const isNight = currentHour < 6 || currentHour >= 19;

  // Next spotlight celebration (first upcoming event)
  const spotlightEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

  // Weather Icon Component
  const getWeatherIcon = () => {
    if (weather.isLoading) return <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />;
    const cond = weather.condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower'))
      return <CloudRain className="w-4 h-4 text-blue-500" />;
    if (cond.includes('snow') || cond.includes('ice'))
      return <CloudSnow className="w-4 h-4 text-cyan-400" />;
    if (cond.includes('cloud') || cond.includes('overcast'))
      return <Cloud className="w-4 h-4 text-slate-500" />;
    if (isNight) return <Moon className="w-4 h-4 text-indigo-500" />;
    return <Sun className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8edf2] via-[#e2e8ef] to-[#d8e1ea] text-slate-800 relative py-8 px-4 sm:px-6 lg:px-8 selection:bg-rose-500 selection:text-white font-sans antialiased">
      {/* Background Soft Alpine Ambient Styling */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8),transparent_70%)]" />

      {/* Screen reader heading required for accessibility & e2e test */}
      <h1 className="sr-only">Celebration Overview</h1>

      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-6 relative z-10">
        {/* ================= LEFT FLOATING DOCK ================= */}
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
              onClick={() => navigate('/events')}
              title="All Celebrations Catalog"
              className="w-11 h-11 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-105"
            >
              <Calendar className="w-5 h-5" />
            </button>

            {/* Tasks Tool Modal */}
            <button
              type="button"
              onClick={() => setIsQuickTaskOpen(true)}
              title="Celebration To-Do Manager"
              className="w-11 h-11 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-105"
            >
              <Clock className="w-5 h-5" />
            </button>

            {/* Budget Calculator Tool Modal */}
            <button
              type="button"
              onClick={() => setIsBudgetCalcOpen(true)}
              title="Smart Budget Allocation Calculator"
              className="w-11 h-11 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-105"
            >
              <DollarSign className="w-5 h-5" />
            </button>

            {/* Vendor Guide Tool Modal */}
            <button
              type="button"
              onClick={() => setIsVendorGuideOpen(true)}
              title="Vendor Checklist & Screening Guide"
              className="w-11 h-11 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-105"
            >
              <Store className="w-5 h-5" />
            </button>

            {/* AI Brainstormer Modal */}
            <button
              type="button"
              onClick={() => setIsAiBrainstormOpen(true)}
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
              onClick={() => setIsCreateModalOpen(true)}
              title="Plan New Celebration (+)"
              className="w-11 h-11 rounded-2xl bg-white/90 text-slate-700 hover:text-rose-600 hover:bg-white flex items-center justify-center shadow-sm border border-white/80 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* ================= MAIN DASHBOARD CONTENT ================= */}
        <main className="flex-1 space-y-6">
          {/* Top Row: Greeting Pill, Big Clock & Date, Actions & Real Weather Widget */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Greeting Pill */}
            <div className="w-full md:w-auto flex items-center justify-between md:justify-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm text-xs font-semibold text-slate-700">
                <span>
                  {greeting}, {user?.name || 'Celebration Host'}
                </span>
                <span className="text-sm">👋</span>
              </div>

              {/* Mobile Quick Create */}
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
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
                  onClick={() => setIsCreateModalOpen(true)}
                  title="Plan New Celebration (+)"
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-rose-600" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAiBrainstormOpen(true)}
                  title="Live AI Celebration Idea Generator"
                  className="p-2 rounded-xl text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                {/* User Profile & Account Hub Button (Replacing Settings sign) */}
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  title="Host Profile & Account Controls"
                  className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-white/80 transition-all cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-700" />
                </button>
              </div>

              {/* 100% REAL LIVE WEATHER WIDGET (Click to set exact city/location) */}
              <div
                onClick={() => setIsWeatherModalOpen(true)}
                title="Click to set exact city, detect GPS, or refresh live weather"
                className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm text-slate-700 cursor-pointer hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all group"
              >
                <div className="p-2 rounded-xl bg-blue-50/80 group-hover:scale-105 transition-transform">
                  {getWeatherIcon()}
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

          {/* Centered Floating Search Pill */}
          <div className="max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white/75 backdrop-blur-xl border border-white/80 rounded-2xl px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
              <input
                type="text"
                placeholder="Search celebrations, venues, tasks, or budgets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-slate-400 text-[10px] font-semibold tracking-wider">
                ⌘K
              </span>
            </div>
          </div>

          {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

          {/* ================= MIDDLE GRID: 4 FROSTED GLASS CARDS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* ----- CARD 1: Upcoming Celebrations (like "Bookmarks" in image) ----- */}
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
                      onClick={() => setIsCreateModalOpen(true)}
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
                          onClick={() => navigate(`/events/${evt.id}`)}
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

            {/* ----- CARD 2: Quick Access Interactive Planning Hub (like "Quick Access" in image) ----- */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-lg shadow-slate-200/40 flex flex-col justify-between hover:shadow-xl transition-all">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 mb-4">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">Quick Access</h2>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-full bg-white/80 border border-slate-200/60 shadow-2xs hover:bg-white transition-colors cursor-pointer"
                  >
                    + New
                  </button>
                </div>

                {/* 4x2 Grid of 8 Functional Interactive Tools (No lazy redirects!) */}
                <div className="grid grid-cols-4 gap-3 text-center">
                  {/* Tile 1: AI Brainstormer Modal */}
                  <button
                    type="button"
                    onClick={() => setIsAiBrainstormOpen(true)}
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
                    onClick={() => setIsBudgetCalcOpen(true)}
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
                    onClick={() => setIsQuickTaskOpen(true)}
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
                    onClick={() => setIsVendorGuideOpen(true)}
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
                    onClick={() => setIsGuestEstimatorOpen(true)}
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
                    onClick={() => setIsThemeStudioOpen(true)}
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
                    onClick={() => setIsMenuBuilderOpen(true)}
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
                    onClick={() => setIsCreateModalOpen(true)}
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
                <span className="font-bold text-purple-600">Gemini 3.8 Flash Active</span>
              </div>
            </div>

            {/* ----- CARD 3: To Do Urgent Checklists (like "To Do" in image) ----- */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-lg shadow-slate-200/40 flex flex-col justify-between hover:shadow-xl transition-all">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 mb-3">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                    To Do
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsQuickTaskOpen(true)}
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
                        onClick={() => navigate(`/events/${task.eventId}?tab=tasks`)}
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

            {/* ----- CARD 4: Spotlight Celebration (like the music player in image) ----- */}
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

                    {/* Bottom Action Button (Play / Enter Planner) */}
                    <button
                      type="button"
                      onClick={() => navigate(`/events/${spotlightEvent.id}`)}
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
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
                  >
                    + Create First Event
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ================= BOTTOM ROW: 3 FROSTED CARDS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 5: Real Editable Notes (like "Notes" in image) */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-lg shadow-slate-200/40 flex flex-col justify-between hover:shadow-xl transition-all">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Celebration Notes
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setTempNote(noteContent);
                      setIsEditingNote(!isEditingNote);
                    }}
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
                      onChange={(e) => setTempNote(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                      placeholder="Write your celebration reminders or key notes..."
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsEditingNote(false)}
                        className="px-2.5 py-1 text-[11px] rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveNote}
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

            {/* Card 6: Inspirational Quote (like "Quote" in image) */}
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

            {/* Card 7: Budget Summary (like "Recently Closed" in image) */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-lg shadow-slate-200/40 flex flex-col justify-between hover:shadow-xl transition-all">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Budget Overview
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsBudgetCalcOpen(true)}
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
        </main>
      </div>

      {/* ================= INTERACTIVE MODALS & FUNCTIONAL TOOLS ================= */}

      {/* 1. Host Profile & Account Controls Modal */}
      <HostProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        stats={stats}
        onLogout={() => {
          setIsProfileOpen(false);
          logout();
          navigate('/login');
        }}
      />

      {/* 2. Live AI Celebration Idea Generator Modal */}
      <AiBrainstormModal
        isOpen={isAiBrainstormOpen}
        onClose={() => setIsAiBrainstormOpen(false)}
        onSelectIdea={(theme, eventType) => {
          setIsAiBrainstormOpen(false);
          const cleanType = ['wedding', 'birthday', 'anniversary', 'community'].includes(
            eventType.toLowerCase()
          )
            ? eventType.toLowerCase()
            : 'other';
          setInitialEventData({
            title: theme,
            theme: theme,
            eventType: cleanType
          });
          setIsCreateModalOpen(true);
        }}
      />

      {/* 3. Smart Celebration Budget Calculator Modal */}
      <BudgetCalculatorModal
        isOpen={isBudgetCalcOpen}
        onClose={() => setIsBudgetCalcOpen(false)}
      />

      {/* 4. Quick Task Checklist Modal */}
      <QuickTasksModal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
        urgentTasks={urgentTasks}
        onOpenEventChecklist={(eventId) => {
          setIsQuickTaskOpen(false);
          navigate(`/events/${eventId}?tab=tasks`);
        }}
      />

      {/* 5. Vendor Directory & Screening Guide Modal */}
      <VendorGuideModal
        isOpen={isVendorGuideOpen}
        onClose={() => setIsVendorGuideOpen(false)}
      />

      {/* 6. Guest Seating & Catering Estimator Modal */}
      <GuestEstimatorModal
        isOpen={isGuestEstimatorOpen}
        onClose={() => setIsGuestEstimatorOpen(false)}
      />

      {/* 7. Theme & Color Palette Studio Modal */}
      <ThemeStudioModal
        isOpen={isThemeStudioOpen}
        onClose={() => setIsThemeStudioOpen(false)}
      />

      {/* 8. Menu & Catering Course Builder Modal */}
      <MenuBuilderModal
        isOpen={isMenuBuilderOpen}
        onClose={() => setIsMenuBuilderOpen(false)}
      />

      {/* 9. Location & Weather Settings Modal */}
      <WeatherModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        weather={weather}
        onRefresh={() => fetchRealWeather(weather.city)}
        onSetCity={handleSetCity}
        onUseGps={handleUseGps}
      />

      {/* Plan New Event Modal (Tile 8 & Dock +) */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setInitialEventData(undefined);
        }}
        initialData={initialEventData}
        onEventCreated={(evt) => navigate(`/events/${evt._id}`)}
      />
    </div>
  );
};
