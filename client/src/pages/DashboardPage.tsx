import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Moon,
  RefreshCw,
  Search,
  Sun
} from 'lucide-react';
import { dashboardService, DashboardSummary } from '../services/dashboard.service.js';
import { useAuth } from '../context/AuthContext.js';
import { LoadingSkeleton } from '../components/LoadingSkeleton.js';
import { Alert } from '../components/Alert.js';
import { CreateEventModal } from '../components/CreateEventModal.js';
import { DashboardDock } from '../components/dashboard/DashboardDock.js';
import { DashboardHeader } from '../components/dashboard/DashboardHeader.js';
import { DashboardCardGrid } from '../components/dashboard/DashboardCardGrid.js';
import { DashboardBottomCards } from '../components/dashboard/DashboardBottomCards.js';
import { HostProfileModal } from '../components/modals/HostProfileModal.js';
import { WeatherModal } from '../components/modals/WeatherModal.js';
import { AiBrainstormModal } from '../components/modals/AiBrainstormModal.js';
import { BudgetCalculatorModal } from '../components/modals/BudgetCalculatorModal.js';
import { QuickTasksModal } from '../components/modals/QuickTasksModal.js';
import { VendorGuideModal } from '../components/modals/VendorGuideModal.js';
import { GuestEstimatorModal } from '../components/modals/GuestEstimatorModal.js';
import { ThemeStudioModal } from '../components/modals/ThemeStudioModal.js';
import { MenuBuilderModal } from '../components/modals/MenuBuilderModal.js';
import { EventType } from '../types/index.js';
import { getErrorMessage } from '../utils/error.js';

/**
 * Main Celebration Studio Dashboard Page.
 * Orchestrates events, real-time live weather, smart AI recommendations, and modular planning studios.
 */
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [initialEventData, setInitialEventData] = useState<{
    title?: string;
    theme?: string;
    eventType?: EventType;
  } | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Tools & Modals State
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
      'Focus on guest experience and early vendor confirmations. Check venue acoustic settings 10 days before the celebration.'
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
      const weatherData = await res.json();
      const current = weatherData.current_condition?.[0];
      const area = weatherData.nearest_area?.[0];

      const newWeather = {
        temp: current?.temp_C ? `${current.temp_C}°C` : '24°C',
        condition: current?.weatherDesc?.[0]?.value || 'Clear Sky',
        city: savedCity ? savedCity : area?.areaName?.[0]?.value || 'Your Location',
        country: area?.country?.[0]?.value || '',
        isLoading: false,
        error: false
      };

      setWeather(newWeather);
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ data: newWeather, timestamp: Date.now() }));
      } catch {
        // Ignore storage error
      }
    } catch {
      setWeather({
        temp: '25°C',
        condition: 'Clear Sky',
        city: savedCity || 'Local Area',
        country: 'Global',
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
            const gpsData = await res.json();
            const area = gpsData.nearest_area?.[0]?.areaName?.[0]?.value;
            if (area) {
              handleSetCity(area);
            } else {
              fetchRealWeather();
            }
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
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load dashboard data'));
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

  // Time & Greeting calculations
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  const isNight = currentHour < 6 || currentHour >= 19;

  // Next spotlight celebration (first upcoming event)
  const spotlightEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

  // Weather Icon Component
  const weatherIcon = useMemo(() => {
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
  }, [weather.isLoading, weather.condition, isNight]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8edf2] via-[#e2e8ef] to-[#d8e1ea] text-slate-800 relative py-8 px-4 sm:px-6 lg:px-8 selection:bg-rose-500 selection:text-white font-sans antialiased">
      {/* Background Ambient Styling */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8),transparent_70%)]" />

      {/* Screen reader heading required for accessibility */}
      <h1 className="sr-only">Celebration Overview</h1>

      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-6 relative z-10">
        {/* 1. Left Floating Dock */}
        <DashboardDock
          onOpenCreate={() => setIsCreateModalOpen(true)}
          onOpenTasks={() => setIsQuickTaskOpen(true)}
          onOpenBudget={() => setIsBudgetCalcOpen(true)}
          onOpenVendors={() => setIsVendorGuideOpen(true)}
          onOpenAi={() => setIsAiBrainstormOpen(true)}
          onNavigateEvents={() => navigate('/events')}
        />

        {/* 2. Main Dashboard Content Area */}
        <main className="flex-1 space-y-6">
          {/* Header Row: Greeting, Live Clock, Actions, Weather */}
          <DashboardHeader
            greeting={greeting}
            userName={user?.name}
            weather={weather}
            weatherIcon={weatherIcon}
            onOpenCreate={() => setIsCreateModalOpen(true)}
            onOpenAi={() => setIsAiBrainstormOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenWeather={() => setIsWeatherModalOpen(true)}
          />

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

          {/* Middle 4-Card Grid */}
          <DashboardCardGrid
            filteredEvents={filteredEvents}
            stats={stats}
            urgentTasks={urgentTasks}
            spotlightEvent={spotlightEvent}
            onOpenCreate={() => setIsCreateModalOpen(true)}
            onOpenAi={() => setIsAiBrainstormOpen(true)}
            onOpenBudget={() => setIsBudgetCalcOpen(true)}
            onOpenTasks={() => setIsQuickTaskOpen(true)}
            onOpenVendors={() => setIsVendorGuideOpen(true)}
            onOpenGuests={() => setIsGuestEstimatorOpen(true)}
            onOpenTheme={() => setIsThemeStudioOpen(true)}
            onOpenMenu={() => setIsMenuBuilderOpen(true)}
            onSelectEvent={(id) => navigate(`/events/${id}`)}
            onSelectTaskEvent={(eventId) => navigate(`/events/${eventId}?tab=tasks`)}
          />

          {/* Bottom 3 Cards Row */}
          <DashboardBottomCards
            noteContent={noteContent}
            isEditingNote={isEditingNote}
            tempNote={tempNote}
            onSetTempNote={setTempNote}
            onToggleEditingNote={() => {
              setTempNote(noteContent);
              setIsEditingNote(!isEditingNote);
            }}
            onSaveNote={handleSaveNote}
            onCancelNote={() => setIsEditingNote(false)}
            stats={stats}
            onOpenBudgetCalc={() => setIsBudgetCalcOpen(true)}
          />
        </main>
      </div>

      {/* ================= MODALS & SLIDEOVERS ================= */}
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

      <AiBrainstormModal
        isOpen={isAiBrainstormOpen}
        onClose={() => setIsAiBrainstormOpen(false)}
        onSelectIdea={(theme, eventType) => {
          setIsAiBrainstormOpen(false);
          const cleanType: EventType = (['wedding', 'birthday', 'anniversary', 'community'].includes(
            eventType.toLowerCase()
          )
            ? eventType.toLowerCase()
            : 'other') as EventType;
          setInitialEventData({
            title: theme,
            theme,
            eventType: cleanType
          });
          setIsCreateModalOpen(true);
        }}
      />

      <BudgetCalculatorModal
        isOpen={isBudgetCalcOpen}
        onClose={() => setIsBudgetCalcOpen(false)}
      />

      <QuickTasksModal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
        urgentTasks={urgentTasks}
        onOpenEventChecklist={(eventId) => {
          setIsQuickTaskOpen(false);
          navigate(`/events/${eventId}?tab=tasks`);
        }}
      />

      <VendorGuideModal
        isOpen={isVendorGuideOpen}
        onClose={() => setIsVendorGuideOpen(false)}
      />

      <GuestEstimatorModal
        isOpen={isGuestEstimatorOpen}
        onClose={() => setIsGuestEstimatorOpen(false)}
      />

      <ThemeStudioModal
        isOpen={isThemeStudioOpen}
        onClose={() => setIsThemeStudioOpen(false)}
      />

      <MenuBuilderModal
        isOpen={isMenuBuilderOpen}
        onClose={() => setIsMenuBuilderOpen(false)}
      />

      <WeatherModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        weather={weather}
        onRefresh={() => fetchRealWeather(weather.city)}
        onSetCity={handleSetCity}
        onUseGps={handleUseGps}
      />

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
