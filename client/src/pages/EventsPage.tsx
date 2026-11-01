import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Users,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { eventService } from '../services/event.service.js';
import { EventItem } from '../types/index.js';
import { Button } from '../components/Button.js';
import { Card } from '../components/Card.js';
import { EmptyState } from '../components/EmptyState.js';
import { LoadingSkeleton } from '../components/LoadingSkeleton.js';
import { Alert } from '../components/Alert.js';
import { CreateEventModal } from '../components/CreateEventModal.js';
import { formatCurrency, formatDate, getEventTypeBadge } from '../utils/formatters.js';
import { getErrorMessage } from '../utils/error.js';

export const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create Event Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsModalOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await eventService.list();
      if (res.success) {
        setEvents(res.events);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch events'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Filtered Events
  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || evt.eventType === typeFilter;
    const matchesStatus = statusFilter === 'all' || evt.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Celebrations & Events</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your weddings, birthday parties, anniversaries, and community gatherings
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Create New Event
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 text-slate-700 w-full sm:w-auto"
            aria-label="Filter by event type"
          >
            <option value="all">All Event Types</option>
            <option value="wedding">Weddings</option>
            <option value="birthday">Birthdays</option>
            <option value="anniversary">Anniversaries</option>
            <option value="community">Community Events</option>
            <option value="other">Other Celebrations</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 text-slate-700 w-full sm:w-auto"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="planning">In Planning</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <LoadingSkeleton count={3} height="h-36" />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8" />}
          title={searchTerm || typeFilter !== 'all' ? 'No events matched your filters' : 'No celebrations yet'}
          description={
            searchTerm || typeFilter !== 'all'
              ? 'Try adjusting your search terms or resetting the filter options.'
              : 'Start your celebration planning journey by creating your first event.'
          }
          actionLabel={searchTerm || typeFilter !== 'all' ? 'Clear Filters' : 'Create Event'}
          onAction={() => {
            if (searchTerm || typeFilter !== 'all' || statusFilter !== 'all') {
              setSearchTerm('');
              setTypeFilter('all');
              setStatusFilter('all');
            } else {
              setIsModalOpen(true);
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const badge = getEventTypeBadge(evt.eventType);

            return (
              <Card
                key={evt._id}
                className="p-5 flex flex-col justify-between hover:border-rose-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/events/${evt._id}`)}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badge.bg} ${badge.text}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 capitalize">
                      {evt.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                    {evt.title}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(evt.date)}</span>
                    </p>
                    <p className="flex items-center gap-2 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.location}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.guestCount} Guests expected</span>
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                      Budget
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 flex items-center">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      {formatCurrency(evt.budget, evt.currency)}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-rose-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Open Planner
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEventCreated={(evt) => navigate(`/events/${evt._id}`)}
      />
    </div>
  );
};
