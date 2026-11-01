import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Info,
  DollarSign,
  Clock,
  CheckSquare,
  Users,
  Send,
  Save,
  Palette
} from 'lucide-react';
import { aiService } from '../../services/ai.service.js';
import { EventItem, AiPlanOutput } from '../../types/index.js';
import { Button } from '../Button.js';
import { Card } from '../Card.js';
import { Alert } from '../Alert.js';
import { formatCurrency } from '../../utils/formatters.js';
import { getErrorMessage } from '../../utils/error.js';

interface AiPlannerTabProps {
  event: EventItem;
  onPlanApplied: () => void;
}

export const AiPlannerTab: React.FC<AiPlannerTabProps> = ({ event, onPlanApplied }) => {
  const [promptNotes, setPromptNotes] = useState('');
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [plan, setPlan] = useState<AiPlanOutput | null>(null);
  const [isDemoFallback, setIsDemoFallback] = useState<boolean>(false);
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Apply checkboxes
  const [applyBudget, setApplyBudget] = useState(true);
  const [applyTasks, setApplyTasks] = useState(true);
  const [applyVendors, setApplyVendors] = useState(true);
  const [applyTheme, setApplyTheme] = useState(true);

  // Check for existing plan on load
  useEffect(() => {
    async function checkExistingPlan() {
      try {
        const res = await aiService.getLatest(event._id);
        if (res.success && res.plan) {
          setPlan(res.plan);
          setIsDemoFallback(res.isDemoFallback);
          setDisclaimer(
            res.isDemoFallback
              ? 'Curated celebration plan loaded from verified planning archive.'
              : 'LIVE AI: Generated previously with Google Gemini.'
          );
        }
      } catch {
        // No previous plan, continue
      }
    }
    checkExistingPlan();
  }, [event._id]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await aiService.generate(event._id, promptNotes, selectedFocus);
      if (res.success) {
        setPlan(res.plan);
        setIsDemoFallback(res.isDemoFallback);
        setDisclaimer(res.disclaimer);
        setMessage(res.message);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to generate AI plan'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (!plan) return;
    setIsApplying(true);
    setError(null);

    try {
      const res = await aiService.apply(event._id, {
        applyBudget,
        applyTasks,
        applyVendors,
        applyTheme,
        plan
      });

      if (res.success) {
        setMessage('Plan successfully applied to event! Budget items, tasks, and vendors were updated.');
        onPlanApplied();
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to apply plan'));
    } finally {
      setIsApplying(false);
    }
  };

  const toggleFocus = (tag: string) => {
    setSelectedFocus((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-8">
      {/* AI Assistant Banner */}
      <div className="bg-gradient-to-br from-rose-900 via-rose-800 to-amber-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-rose-100 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Powered by Google Gemini GenAI
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Intelligent Event Assistant for "{event.title}"
          </h2>
          <p className="mt-1 text-sm text-rose-100/90 leading-relaxed">
            Generate customized themes, decor concepts, budget breakdowns, milestone checklists, and curated vendor recommendations tailored to your {event.guestCount} guests and {formatCurrency(event.budget, event.currency)} budget.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
      {message && <Alert type="success" message={message} onDismiss={() => setMessage(null)} />}

      {/* Generator Prompt Box */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-600" />
          Customize Your Planning Prompt
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Add specific creative preferences, color palettes, venue quirks, or traditions you want the AI to incorporate.
        </p>

        <textarea
          rows={3}
          value={promptNotes}
          onChange={(e) => setPromptNotes(e.target.value)}
          placeholder="e.g. Focus on an intimate golden hour outdoor reception, include gluten-free pastry ideas, and keep entertainment budget friendly."
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 text-slate-900"
        />

        <div className="mt-4">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
            Focus Areas
          </span>
          <div className="flex flex-wrap gap-2">
            {['Theme & Styling', 'Budget Optimization', 'Timeline Milestones', 'Task Checklist', 'Vendor Selection', 'Dietary & Menu'].map(
              (tag) => {
                const active = selectedFocus.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleFocus(tag)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-rose-100 border-rose-400 text-rose-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {tag}
                  </button>
                );
              }
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button onClick={handleGenerate} isLoading={isLoading} size="md">
            <Send className="w-4 h-4" />
            {plan ? 'Regenerate Plan' : 'Generate Comprehensive Plan'}
          </Button>
        </div>
      </Card>

      {/* Display Generated Plan */}
      {plan && (
        <div className="space-y-6">
          {/* Disclaimer & Transparency Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isDemoFallback
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-current" />
            <div className="text-xs space-y-1">
              <span className="font-bold block uppercase tracking-wider">
                {isDemoFallback ? 'Smart Planning Blueprint' : 'Gemini AI Generation Verification'}
              </span>
              <p className="leading-relaxed">{disclaimer}</p>
              <p className="text-[11px] opacity-80">
                * Note: Pricing estimates, quotes, and vendor suggestions are automated planning recommendations. Verify availability and terms with local service providers before booking.
              </p>
            </div>
          </div>

          {/* Theme & Concept */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-bold text-slate-900">Theme Concept & Atmosphere</h3>
            </div>
            <p className="text-sm text-slate-700 bg-rose-50/50 p-4 rounded-xl border border-rose-100 leading-relaxed font-medium">
              {plan.themeConcept}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Decor Ideas */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Curated Decor Ideas
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {plan.decorIdeas.map((idea, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Food & Beverage Ideas */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Food & Beverage Ideas
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {plan.foodAndBeverageIdeas.map((food, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{food}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Activities */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Guest Activities & Highlights
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {plan.activityIdeas.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Recommended Budget Allocation */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Recommended Budget Allocation</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.budgetRecommendations.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-slate-800">{item.category}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      {item.percentage}%
                    </span>
                  </div>
                  <p className="text-base font-extrabold text-slate-900">
                    {formatCurrency(item.suggestedAmount, event.currency)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.rationale}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Milestone Timeline */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Preparation Timeline & Milestones</h3>
            </div>
            <div className="space-y-3">
              {plan.milestoneTimeline.map((mile, idx) => (
                <div key={idx} className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs shrink-0">
                    {mile.timeframe}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{mile.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{mile.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Checklist & Vendor Suggestions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Action Checklist */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckSquare className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">Checklist Tasks ({plan.checklistTasks.length})</h3>
              </div>
              <ul className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {plan.checklistTasks.map((task, idx) => (
                  <li key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-800 block">{task.title}</span>
                      <span className="text-[11px] text-slate-500">
                        {task.category} • Due ~{task.daysBeforeEvent} days before
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Vendor Suggestions */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Recommended Vendor Categories</h3>
              </div>
              <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {plan.vendorSuggestions.map((vend, idx) => (
                  <li key={idx} className="p-3 rounded-xl border border-slate-100 bg-purple-50/30 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900">{vend.name}</span>
                      <span className="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                        {vend.category}
                      </span>
                    </div>
                    {vend.estimatedBudgetShare && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        Est. Budget: <span className="font-medium text-slate-700">{vend.estimatedBudgetShare}</span>
                      </p>
                    )}
                    <p className="text-slate-600 text-[11px] mt-1">{vend.recommendationTips}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Apply Plan Card */}
          <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <h3 className="text-lg font-bold">Apply Generated Plan to Your Event</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Choose which sections of this plan you want to populate directly into your live Budget, Task Checklist, and Vendor directory.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <label className="flex items-center gap-2 text-xs cursor-pointer bg-white/10 p-2.5 rounded-xl hover:bg-white/15 transition-colors">
                <input
                  type="checkbox"
                  checked={applyBudget}
                  onChange={(e) => setApplyBudget(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-400"
                />
                <span>Budget Items</span>
              </label>

              <label className="flex items-center gap-2 text-xs cursor-pointer bg-white/10 p-2.5 rounded-xl hover:bg-white/15 transition-colors">
                <input
                  type="checkbox"
                  checked={applyTasks}
                  onChange={(e) => setApplyTasks(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-400"
                />
                <span>Timeline Tasks</span>
              </label>

              <label className="flex items-center gap-2 text-xs cursor-pointer bg-white/10 p-2.5 rounded-xl hover:bg-white/15 transition-colors">
                <input
                  type="checkbox"
                  checked={applyVendors}
                  onChange={(e) => setApplyVendors(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-400"
                />
                <span>Vendors</span>
              </label>

              <label className="flex items-center gap-2 text-xs cursor-pointer bg-white/10 p-2.5 rounded-xl hover:bg-white/15 transition-colors">
                <input
                  type="checkbox"
                  checked={applyTheme}
                  onChange={(e) => setApplyTheme(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-400"
                />
                <span>Update Theme</span>
              </label>
            </div>

            <Button
              variant="primary"
              size="md"
              className="bg-rose-600 hover:bg-rose-500 font-bold"
              onClick={handleApply}
              isLoading={isApplying}
            >
              <Save className="w-4 h-4" />
              Save & Apply Plan to Event
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
