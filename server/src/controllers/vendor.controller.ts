import { Response, NextFunction } from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import { Vendor, IVendor } from '../models/Vendor.js';
import { Event } from '../models/Event.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getParam } from '../utils/params.js';

export async function listVendors(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = getParam(req.params.eventId);
    const userId = req.user!._id;
    const { category, status } = req.query;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const event = await Event.findOne({ _id: eventId, userId }).select('_id').lean();
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
      return;
    }

    const query: FilterQuery<IVendor> = { eventId, userId };
    if (category && typeof category === 'string') query.category = category;
    if (status && typeof status === 'string') query.status = status as any;

    const vendors = await Vendor.find(query).sort({ category: 1, quoteAmount: 1 }).lean();

    // Calculate vendor breakdown summary
    let totalQuotes = 0;
    let bookedVendors = 0;
    for (const v of vendors) {
      totalQuotes += v.quoteAmount || 0;
      if (v.status === 'booked') bookedVendors += 1;
    }

    res.status(200).json({
      success: true,
      count: vendors.length,
      vendorSummary: {
        totalVendors: vendors.length,
        bookedVendors,
        totalQuotes: Math.round(totalQuotes * 100) / 100
      },
      vendors
    });
  } catch (error) {
    next(error);
  }
}

export async function createVendor(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = getParam(req.params.eventId);
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const event = await Event.findOne({ _id: eventId, userId }).select('_id').lean();
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
      return;
    }

    const vendor = await Vendor.create({
      ...req.body,
      eventId,
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Vendor added successfully',
      vendor
    });
  } catch (error) {
    next(error);
  }
}

export async function updateVendor(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = getParam(req.params.eventId);
    const id = getParam(req.params.id);
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid ID parameters' });
      return;
    }

    const vendor = await Vendor.findOneAndUpdate(
      { _id: id, eventId, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      res.status(404).json({ success: false, message: 'Vendor not found or unauthorized' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      vendor
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteVendor(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventId = getParam(req.params.eventId);
    const id = getParam(req.params.id);
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid ID parameters' });
      return;
    }

    const vendor = await Vendor.findOneAndDelete({ _id: id, eventId, userId });
    if (!vendor) {
      res.status(404).json({ success: false, message: 'Vendor not found or unauthorized' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
