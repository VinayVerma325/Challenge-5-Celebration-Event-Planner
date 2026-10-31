import mongoose, { Document, Model, Schema } from 'mongoose';

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

export interface IExpense extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  category: ExpenseCategory;
  title: string;
  allocatedAmount: number;
  actualAmount: number;
  paidStatus: PaidStatus;
  notes?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
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
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Venue',
        'Catering',
        'Photography',
        'Decor & Flowers',
        'Entertainment',
        'Attire & Beauty',
        'Invitations & Favors',
        'Transport & Lodging',
        'Miscellaneous'
      ]
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true
    },
    allocatedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Allocated amount cannot be negative']
    },
    actualAmount: {
      type: Number,
      default: 0,
      min: [0, 'Actual amount cannot be negative']
    },
    paidStatus: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid'],
      default: 'unpaid'
    },
    notes: {
      type: String,
      default: ''
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

expenseSchema.index({ eventId: 1, category: 1 });

export const Expense: Model<IExpense> = mongoose.model<IExpense>('Expense', expenseSchema);
