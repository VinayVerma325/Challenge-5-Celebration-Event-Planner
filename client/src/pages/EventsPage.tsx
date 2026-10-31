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
import { EventItem, EventType } from '../types/index.js';
import { Button } from '../components/Button.js';
import { Card } from '../components/Card.js';
import { Input } from '../components/Input.js';
import { Select } from '../components/Select.js';
import { Modal } from '../components/Modal.js';
import { EmptyState } from '../components/EmptyState.js';
import { LoadingSkeleton } from '../components/LoadingSkeleton.js';
import { Alert } from '../components/Alert.js';
import { formatCurrency, formatDate, getEventTypeBadge } from '../utils/formatters.js';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    eventType: 'wedding' as EventType,
    date: '',
    location: '',
    guestCount: 50,
    budget: 5000,
    currency: 'USD',
    theme: 'Elegant & Modern',
    dietaryRequirements: [] as string[],
    accessibilityRequirements: [] as string[],
    notes: ''
  });

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
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newEvent.title.trim()) {
      setFormError('Please provide an event title');
      return;
    }
    if (!newEvent.date) {
      setFormError('Please select a valid event date');
      return;
    }
    if (!newEvent.location.trim()) {
      setFormError('Please specify the event location');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await eventService.create(newEvent);
      if (res.success) {
        setIsModalOpen(false);
        navigate(`/events/${res.event._id}`);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDietary = (item: string) => {
    setNewEvent((prev) => ({
      ...prev,
      dietaryRequirements: prev.dietaryRequirements.includes(item)
        ? prev.dietaryRequirements.filter((d) => d !== item)
        : [...prev.dietaryRequirements, item]
    }));
  };

  const toggleAccessibility = (item: string) => {
    setNewEvent((prev) => ({
      ...prev,
      accessibilityRequirements: prev.accessibilityRequirements.includes(item)
        ? prev.accessibilityRequirements.filter((a) => a !== item)
        : [...prev.accessibilityRequirements, item]
    }));
  };

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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Celebration"
        description="Provide key parameters to organize and generate AI assistance"
        maxWidth="xl"
      >
        {formError && <Alert type="error" message={formError} className="mb-4" />}

        <form onSubmit={handleCreateEvent} className="space-y-4">
          <Input
            label="Event Title"
            required
            placeholder="e.g. Maya's 30th Birthday Soirée or Summer Community Picnic"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Event Type"
              options={[
                { value: 'wedding', label: 'Wedding' },
                { value: 'birthday', label: 'Birthday' },
                { value: 'anniversary', label: 'Anniversary' },
                { value: 'community', label: 'Community Event' },
                { value: 'other', label: 'Other Celebration' }
              ]}
              value={newEvent.eventType}
              onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value as EventType })}
            />

            <Input
              label="Celebration Date"
              type="date"
              required
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location / Venue"
              required
              placeholder="e.g. Central City Botanical Garden"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            />

            <Input
              label="Estimated Guests"
              type="number"
              min={1}
              required
              value={newEvent.guestCount}
              onChange={(e) => setNewEvent({ ...newEvent, guestCount: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Planned Budget"
                type="number"
                min={0}
                required
                value={newEvent.budget}
                onChange={(e) => setNewEvent({ ...newEvent, budget: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <Select
              label="Currency"
              options={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
                { value: 'INR', label: 'INR (₹)' },
                { value: 'CAD', label: 'CAD ($)' },
                { value: 'AUD', label: 'AUD ($)' }
              ]}
              value={newEvent.currency}
              onChange={(e) => setNewEvent({ ...newEvent, currency: e.target.value })}
            />
          </div>

          <Input
            label="Theme & Style Preferences"
            placeholder="e.g. Boho Rustic, Tropical Sunset, Vintage Gold, Clean Minimalist"
            value={newEvent.theme}
            onChange={(e) => setNewEvent({ ...newEvent, theme: e.target.value })}
          />

          {/* Dietary Requirements Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Dietary Considerations
            </label>
            <div className="flex flex-wrap gap-2">
              {['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Nut-Free', 'Dairy-Free'].map(
                (item) => {
                  const isSelected = newEvent.dietaryRequirements.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleDietary(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'bg-rose-100 border-rose-400 text-rose-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {item}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Accessibility Requirements Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Accessibility Accommodations
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'Wheelchair Ramp Access',
                'Accessible Restrooms',
                'Sign Language Interpreter',
                'Low-Sensory Quiet Zone',
                'Elevator Access'
              ].map((item) => {
                const isSelected = newEvent.accessibilityRequirements.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAccessibility(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-purple-100 border-purple-400 text-purple-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Event & Open Planner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
