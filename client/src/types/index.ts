export type EventType = 'wedding' | 'birthday' | 'anniversary' | 'community' | 'other';
export type EventStatus = 'planning' | 'confirmed' | 'completed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface EventItem {
  _id: string;
  userId: string;
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
  notes?: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'Venue'
  | 'Catering'
  | 'Photography'
  | 'Decor & Flowers'
  | 'Entertainment'
  | 'Attire & Beauty'
  | 'Invitations & Favors'
  | 'Transport & Lodging'
  | 'Miscellaneous';

export type PaidStatus = 'unpaid' | 'partially_paid' | 'paid';

export interface ExpenseItem {
  _id: string;
  eventId: string;
  userId: string;
  category: ExpenseCategory;
  title: string;
  allocatedAmount: number;
  actualAmount: number;
  paidStatus: PaidStatus;
  notes?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySummary {
  category: string;
  allocated: number;
  actual: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
  expenseCount: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalAllocated: number;
  totalActual: number;
  remainingBudget: number;
  unallocatedBudget: number;
  isOverBudget: boolean;
  overageAmount: number;
  percentageUsed: number;
  categoryBreakdowns: CategorySummary[];
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface TaskItem {
  _id: string;
  eventId: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskMetrics {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  completionPercentage: number;
}

export type VendorStatus = 'researching' | 'contacted' | 'quoted' | 'booked' | 'declined';

export interface VendorItem {
  _id: string;
  eventId: string;
  userId: string;
  name: string;
  category: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  quoteAmount: number;
  status: VendorStatus;
  notes?: string;
  isAiSuggested: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorSummary {
  totalVendors: number;
  bookedVendors: number;
  totalQuotes: number;
}

export interface AiPlanOutput {
  themeConcept: string;
  decorIdeas: string[];
  foodAndBeverageIdeas: string[];
  activityIdeas: string[];
  budgetRecommendations: Array<{
    category: string;
    percentage: number;
    suggestedAmount: number;
    rationale: string;
  }>;
  milestoneTimeline: Array<{
    timeframe: string;
    title: string;
    description: string;
  }>;
  checklistTasks: Array<{
    title: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    daysBeforeEvent: number;
  }>;
  vendorSuggestions: Array<{
    category: string;
    name: string;
    estimatedBudgetShare: string;
    recommendationTips: string;
  }>;
  personalizedTips: string[];
}
