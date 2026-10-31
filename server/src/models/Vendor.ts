import mongoose, { Document, Model, Schema } from 'mongoose';

export type VendorStatus = 'researching' | 'contacted' | 'quoted' | 'booked' | 'declined';

export interface IVendor extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
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
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Vendor category is required'],
      trim: true
    },
    contactPerson: {
      type: String,
      default: '',
      trim: true
    },
    email: {
      type: String,
      default: '',
      trim: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    website: {
      type: String,
      default: '',
      trim: true
    },
    quoteAmount: {
      type: Number,
      default: 0,
      min: [0, 'Quote amount cannot be negative']
    },
    status: {
      type: String,
      enum: ['researching', 'contacted', 'quoted', 'booked', 'declined'],
      default: 'researching'
    },
    notes: {
      type: String,
      default: ''
    },
    isAiSuggested: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

vendorSchema.index({ eventId: 1, category: 1 });

export const Vendor: Model<IVendor> = mongoose.model<IVendor>('Vendor', vendorSchema);
