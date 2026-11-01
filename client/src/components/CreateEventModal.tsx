import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/event.service.js';
import { EventItem, EventType } from '../types/index.js';
import { Modal } from './Modal.js';
import { Button } from './Button.js';
import { Input } from './Input.js';
import { Select } from './Select.js';
import { Alert } from './Alert.js';
import { getErrorMessage } from '../utils/error.js';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: (event: EventItem) => void;
  initialData?: Partial<{
    title: string;
    eventType: EventType;
    date: string;
    location: string;
    guestCount: number;
    budget: number;
    currency: string;
    theme: string;
    dietaryRequirements: string[];
    accessibilityRequirements: string[];
    notes: string;
  }>;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  initialData
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
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

  // Sync initialData when modal opens
  React.useEffect(() => {
    if (isOpen && initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData
      }));
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Please provide a celebration title');
      return;
    }
    if (!formData.date) {
      setError('Please select a valid date');
      return;
    }
    if (!formData.location.trim()) {
      setError('Please specify the location or venue');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await eventService.create(formData);
      if (res.success && res.event) {
        onClose();
        if (onEventCreated) {
          onEventCreated(res.event);
        } else {
          navigate(`/events/${res.event._id}`);
        }
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to create celebration event'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDietary = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      dietaryRequirements: prev.dietaryRequirements.includes(item)
        ? prev.dietaryRequirements.filter((d) => d !== item)
        : [...prev.dietaryRequirements, item]
    }));
  };

  const toggleAccessibility = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      accessibilityRequirements: prev.accessibilityRequirements.includes(item)
        ? prev.accessibilityRequirements.filter((a) => a !== item)
        : [...prev.accessibilityRequirements, item]
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Plan New Celebration"
      description="Enter your celebration parameters to organize budget, timelines, and AI planning."
      maxWidth="xl"
    >
      {error && <Alert type="error" message={error} className="mb-4" onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Celebration Title"
          required
          placeholder="e.g. Maya's 30th Birthday Soirée or Summer Community Picnic"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Celebration Type"
            options={[
              { value: 'wedding', label: 'Wedding' },
              { value: 'birthday', label: 'Birthday' },
              { value: 'anniversary', label: 'Anniversary' },
              { value: 'community', label: 'Community Event' },
              { value: 'other', label: 'Other Celebration' }
            ]}
            value={formData.eventType}
            onChange={(e) => setFormData({ ...formData, eventType: e.target.value as EventType })}
          />

          <Input
            label="Celebration Date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Location / Venue"
            required
            placeholder="e.g. Central City Botanical Garden"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />

          <Input
            label="Estimated Guest Count"
            type="number"
            min={1}
            required
            value={formData.guestCount}
            onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) || 1 })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Planned Budget"
              type="number"
              min={0}
              required
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
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
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          />
        </div>

        <Input
          label="Theme & Style Preference"
          placeholder="e.g. Boho Chic, Golden Glamour, Tropical Sunset, Minimalist"
          value={formData.theme}
          onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Dietary Considerations
          </label>
          <div className="flex flex-wrap gap-2">
            {['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Nut-Free', 'Dairy-Free'].map(
              (item) => {
                const isSelected = formData.dietaryRequirements.includes(item);
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
              const isSelected = formData.accessibilityRequirements.includes(item);
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
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Celebration & Open Planner
          </Button>
        </div>
      </form>
    </Modal>
  );
};
