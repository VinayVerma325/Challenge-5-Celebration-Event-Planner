import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  DollarSign,
  CheckSquare,
  Users,
  ChevronLeft,
  Edit2,
  Trash2,
  LayoutDashboard
} from 'lucide-react';
import { eventService } from '../services/event.service.js';
import { EventItem, EventType } from '../types/index.js';
import { Button } from '../components/Button.js';
import { Modal } from '../components/Modal.js';
import { Input } from '../components/Input.js';
import { Select } from '../components/Select.js';
import { Alert } from '../components/Alert.js';
import { LoadingSkeleton } from '../components/LoadingSkeleton.js';
import { OverviewTab } from '../components/tabs/OverviewTab.js';
import { AiPlannerTab } from '../components/tabs/AiPlannerTab.js';
import { BudgetTab } from '../components/tabs/BudgetTab.js';
import { TimelineTab } from '../components/tabs/TimelineTab.js';
import { VendorsTab } from '../components/tabs/VendorsTab.js';

type TabKey = 'overview' | 'ai' | 'budget' | 'tasks' | 'vendors';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab
  const initialTab = (searchParams.get('tab') as TabKey) || 'overview';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    eventType: 'wedding' as EventType,
    date: '',
    location: '',
    guestCount: 50,
    budget: 5000,
    currency: 'USD',
    theme: '',
    status: 'planning' as any
  });

  const loadEvent = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await eventService.getById(id);
      if (res.success && res.event) {
        setEvent(res.event);
        setEditFormData({
          title: res.event.title,
          eventType: res.event.eventType,
          date: new Date(res.event.date).toISOString().split('T')[0],
          location: res.event.location,
          guestCount: res.event.guestCount,
          budget: res.event.budget,
          currency: res.event.currency,
          theme: res.event.theme || '',
          status: res.event.status
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load celebration details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setIsSubmitting(true);
      await eventService.update(id, editFormData);
      setIsEditModalOpen(false);
      loadEvent();
    } catch (err: any) {
      setError(err.message || 'Failed to update celebration details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!id) return;
    if (
      !window.confirm(
        'Are you sure you want to delete this celebration? All associated budgets, expenses, tasks, and vendors will also be deleted.'
      )
    )
      return;

    try {
      await eventService.delete(id);
      navigate('/events');
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <LoadingSkeleton count={1} height="h-32" />
        <LoadingSkeleton count={3} height="h-64" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Alert type="error" message="Celebration not found or unauthorized access." />
        <div className="mt-4">
          <Button onClick={() => navigate('/events')}>Return to Events List</Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'ai', label: 'AI Planner', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    { key: 'budget', label: 'Budget Manager', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'tasks', label: 'Timeline & Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { key: 'vendors', label: 'Vendors', icon: <Users className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 focus:outline-none focus-visible:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to All Celebrations
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
            <Edit2 className="w-3.5 h-3.5" />
            Edit Event
          </Button>
          <Button variant="danger" size="sm" onClick={handleDeleteEvent}>
            <Trash2 className="w-3.5 h-3.5" />
            Delete Event
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      {/* Accessible Tab Navigation */}
      <div className="border-b border-slate-200 bg-white rounded-t-2xl px-4 sm:px-6 shadow-xs">
        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto py-2" aria-label="Celebration Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key as TabKey)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-t-md ${
                  isActive
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <OverviewTab event={event} setActiveTab={handleTabChange} />
        )}
        {activeTab === 'ai' && (
          <AiPlannerTab event={event} onPlanApplied={loadEvent} />
        )}
        {activeTab === 'budget' && <BudgetTab event={event} />}
        {activeTab === 'tasks' && <TimelineTab event={event} />}
        {activeTab === 'vendors' && <VendorsTab event={event} />}
      </div>

      {/* Edit Event Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Celebration Details"
        description="Update dates, guest counts, and budget parameters"
      >
        <form onSubmit={handleUpdateEvent} className="space-y-4">
          <Input
            label="Event Title"
            required
            value={editFormData.title}
            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
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
              value={editFormData.eventType}
              onChange={(e) =>
                setEditFormData({ ...editFormData, eventType: e.target.value as EventType })
              }
            />

            <Input
              label="Date"
              type="date"
              required
              value={editFormData.date}
              onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              required
              value={editFormData.location}
              onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
            />

            <Input
              label="Guest Count"
              type="number"
              min={1}
              required
              value={editFormData.guestCount}
              onChange={(e) =>
                setEditFormData({ ...editFormData, guestCount: parseInt(e.target.value) || 1 })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Budget Ceiling"
                type="number"
                min={0}
                required
                value={editFormData.budget}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, budget: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <Select
              label="Currency"
              options={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
                { value: 'INR', label: 'INR (₹)' },
                { value: 'CAD', label: 'CAD ($)' }
              ]}
              value={editFormData.currency}
              onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value })}
            />
          </div>

          <Input
            label="Theme / Style Preference"
            value={editFormData.theme}
            onChange={(e) => setEditFormData({ ...editFormData, theme: e.target.value })}
          />

          <Select
            label="Planning Status"
            options={[
              { value: 'planning', label: 'In Planning' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
            value={editFormData.status}
            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
