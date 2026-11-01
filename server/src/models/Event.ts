import mongoose, { Document, Model, Schema } from 'mongoose';

export type EventType = 'wedding' | 'birthday' | 'anniversary' | 'community' | 'other';
export type EventStatus = 'planning' | 'confirmed' | 'completed' | 'cancelled';

export interface IEvent extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  eventType: EventType;
  date: Date;
  location: string;
  guestCount: number;
  budget: number;
  currency: string;
  theme: string;
  dietaryRequirements: string[];
  accessibilityRequirements: string[];
  notes?: string;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    eventType: {
      type: String,
      enum: ['wedding', 'birthday', 'anniversary', 'community', 'other'],
      required: [true, 'Event type is required']
    },
    date: {
      type: Date,
      required: [true, 'Event date is required']
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true
    },
    guestCount: {
      type: Number,
      required: [true, 'Guest count is required'],
      min: [1, 'Guest count must be at least 1']
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
      uppercase: true
    },
    theme: {
      type: String,
      default: 'Classic',
      trim: true
    },
    dietaryRequirements: {
      type: [String],
      default: []
    },
    accessibilityRequirements: {
      type: [String],
      default: []
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['planning', 'confirmed', 'completed', 'cancelled'],
      default: 'planning'
    }
  },
  {
    timestamps: true
  }
);

eventSchema.index({ userId: 1, date: 1 });
eventSchema.index({ userId: 1, eventType: 1 });
eventSchema.index({ userId: 1, status: 1 });

export const Event: Model<IEvent> = mongoose.model<IEvent>('Event', eventSchema);
