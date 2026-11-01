import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Globe,
  Edit2,
  Trash2,
  Sparkles,
  Filter
} from 'lucide-react';
import { vendorService } from '../../services/vendor.service.js';
import { EventItem, VendorItem, VendorSummary, VendorStatus } from '../../types/index.js';
import { Card } from '../Card.js';
import { Button } from '../Button.js';
import { Input } from '../Input.js';
import { Select } from '../Select.js';
import { Modal } from '../Modal.js';
import { EmptyState } from '../EmptyState.js';
import { LoadingSkeleton } from '../LoadingSkeleton.js';
import { Alert } from '../Alert.js';
import { formatCurrency } from '../../utils/formatters.js';
import { getErrorMessage } from '../../utils/error.js';

interface VendorsTabProps {
  event: EventItem;
}

export const VendorsTab: React.FC<VendorsTabProps> = ({ event }) => {
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [summary, setSummary] = useState<VendorSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Catering',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    quoteAmount: 0,
    status: 'researching' as VendorStatus,
    notes: '',
    isAiSuggested: false
  });

  const loadVendors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await vendorService.list(event._id, {
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      if (res.success) {
        setVendors(res.vendors);
        setSummary(res.vendorSummary);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load vendors'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, [event._id, categoryFilter, statusFilter]);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      category: 'Catering',
      contactPerson: '',
      email: '',
      phone: '',
      website: '',
      quoteAmount: 0,
      status: 'researching',
      notes: '',
      isAiSuggested: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: VendorItem) => {
    setEditingVendor(v);
    setFormData({
      name: v.name,
      category: v.category,
      contactPerson: v.contactPerson || '',
      email: v.email || '',
      phone: v.phone || '',
      website: v.website || '',
      quoteAmount: v.quoteAmount || 0,
      status: v.status,
      notes: v.notes || '',
      isAiSuggested: v.isAiSuggested
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide a vendor or service name');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingVendor) {
        await vendorService.update(event._id, editingVendor._id, formData);
        setSuccessMsg('Vendor details updated');
      } else {
        await vendorService.create(event._id, formData);
        setSuccessMsg('Vendor added to directory');
      }
      setIsModalOpen(false);
      loadVendors();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save vendor'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this vendor from directory?')) return;
    try {
      await vendorService.delete(event._id, id);
      setSuccessMsg('Vendor removed');
      loadVendors();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to remove vendor'));
    }
  };

  if (isLoading && !vendors.length) {
    return <LoadingSkeleton count={3} height="h-28" />;
  }

  const vendorStats = summary || {
    totalVendors: 0,
    bookedVendors: 0,
    totalQuotes: 0
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Vendor & Partner Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare quotes, record contacts, and track vendor booking statuses
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" />
          Add Vendor
        </Button>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
      {successMsg && <Alert type="success" message={successMsg} onDismiss={() => setSuccessMsg(null)} />}

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-purple-600">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Vendors Tracked
          </span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {vendorStats.totalVendors}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Prospective and booked services</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Booked Vendors
          </span>
          <span className="text-xl font-black text-emerald-900 mt-1 block">
            {vendorStats.bookedVendors}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Confirmed bookings locked in</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-600">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Active Quotes
          </span>
          <span className="text-xl font-black text-blue-900 mt-1 block">
            {formatCurrency(vendorStats.totalQuotes, event.currency)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Sum of recorded estimates</span>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Filters:</span>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            aria-label="Filter by vendor category"
          >
            <option value="all">All Categories</option>
            <option value="Catering">Catering</option>
            <option value="Venue">Venue</option>
            <option value="Photography">Photography</option>
            <option value="Decor & Flowers">Decor & Flowers</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Music / DJ">Music / DJ</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            aria-label="Filter by vendor status"
          >
            <option value="all">All Statuses</option>
            <option value="researching">Researching</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="booked">Booked</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing {vendors.length} vendors
        </span>
      </div>

      {/* Vendors Grid */}
      {vendors.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No vendors in directory yet"
          description="Log caterers, photographers, venues, and florists or apply AI suggested vendor categories."
          actionLabel="Add Vendor"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vendors.map((v) => {
            const isBooked = v.status === 'booked';

            return (
              <Card
                key={v._id}
                className={`p-5 flex flex-col justify-between ${
                  isBooked ? 'border-emerald-200 bg-emerald-50/10' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {v.category}
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        v.status === 'booked'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.status === 'quoted'
                          ? 'bg-blue-100 text-blue-800'
                          : v.status === 'contacted'
                          ? 'bg-amber-100 text-amber-800'
                          : v.status === 'declined'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1">{v.name}</h3>

                  {/* AI Suggestion Label Indicator (Part 4 F) */}
                  {v.isAiSuggested && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md mt-1 border border-purple-200">
                      <Sparkles className="w-3 h-3" />
                      AI Recommendation
                    </span>
                  )}

                  {/* Contact details */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    {v.contactPerson && (
                      <p className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{v.contactPerson}</span>
                      </p>
                    )}
                    {v.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{v.phone}</span>
                      </p>
                    )}
                    {v.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{v.email}</span>
                      </p>
                    )}
                    {v.website && (
                      <p className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <a
                          href={v.website.startsWith('http') ? v.website : `https://${v.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-rose-600 hover:underline truncate"
                        >
                          {v.website}
                        </a>
                      </p>
                    )}
                  </div>

                  {v.notes && (
                    <p className="text-[11px] text-slate-500 mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 leading-snug">
                      {v.notes}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                      Quote
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {v.quoteAmount > 0
                        ? formatCurrency(v.quoteAmount, event.currency)
                        : 'No quote recorded'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(v)}
                      aria-label={`Edit ${v.name}`}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(v._id)}
                      aria-label={`Delete ${v.name}`}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
        description="Maintain contact details and compare pricing quotes"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Vendor / Business Name"
            required
            placeholder="e.g. Luminary Photography Studio"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Category"
              required
              placeholder="e.g. Catering, Venue, Photography, Flowers, DJ"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />

            <Select
              label="Status"
              options={[
                { value: 'researching', label: 'Researching' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'quoted', label: 'Quote Received' },
                { value: 'booked', label: 'Booked / Confirmed' },
                { value: 'declined', label: 'Declined' }
              ]}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as VendorStatus })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Person"
              placeholder="e.g. Sarah Jenkins"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="e.g. (555) 234-5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="contact@vendor.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Website or Portfolio"
              type="url"
              placeholder="https://vendorportfolio.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <Input
            label="Quote / Estimate Amount"
            type="number"
            min={0}
            step="any"
            value={formData.quoteAmount}
            onChange={(e) => setFormData({ ...formData, quoteAmount: parseFloat(e.target.value) || 0 })}
          />

          <Input
            label="Notes / Deliverables"
            placeholder="Package includes 8 hours coverage, 2 shooters, raw footage"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingVendor ? 'Update Vendor' : 'Save Vendor'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
