import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAiPlan extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  promptNotes?: string;
  plan: {
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
  };
  isDemoFallback: boolean;
  createdAt: Date;
}

const aiPlanSchema = new Schema<IAiPlan>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    promptNotes: {
      type: String,
      default: ''
    },
    plan: {
      type: Schema.Types.Mixed,
      required: true
    },
    isDemoFallback: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

aiPlanSchema.index({ eventId: 1, createdAt: -1 });

export const AiPlan: Model<IAiPlan> = mongoose.model<IAiPlan>('AiPlan', aiPlanSchema);
