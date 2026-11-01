import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../app.js';
import { geminiService } from '../../services/gemini.service.js';
import { Event } from '../../models/Event.js';
import { Expense } from '../../models/Expense.js';
import { Task } from '../../models/Task.js';
import { Vendor } from '../../models/Vendor.js';

let mongoServer: MongoMemoryServer;
let user1Token: string;
let user2Token: string;
let eventId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Mock external Gemini AI call for fast, reliable, offline-capable integration tests
  vi.spyOn(geminiService, 'generateEventPlan').mockImplementation(async (event: any, additionalPrompt?: string) => {
    return {
      plan: geminiService.generateTailoredFallback(event, additionalPrompt),
      isDemoFallback: false,
      disclaimer: 'Live AI Generation Verified: Generated with Google Gemini.'
    };
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Full-Stack API Integration Tests', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Planner',
        email: 'alice@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@example.com');
    user1Token = res.body.token;
  });

  it('should reject registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Impostor',
        email: 'alice@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should register user 2 for authorization tests', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Guest',
        email: 'bob@example.com',
        password: 'password456'
      });

    expect(res.status).toBe(201);
    user2Token = res.body.token;
  });

  it('should access /api/auth/me with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.name).toBe('Alice Planner');
  });

  it('should reject unauthenticated request to /api/events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(401);
  });

  it('should create a new wedding event for User 1', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Alice & Charlie Wedding Celebration',
        eventType: 'wedding',
        date: '2026-11-20T17:00:00.000Z',
        location: 'Sunset Botanical Gardens',
        guestCount: 120,
        budget: 12000,
        currency: 'USD',
        theme: 'Rustic Botanical Elegance',
        dietaryRequirements: ['Vegetarian', 'Gluten-Free'],
        accessibilityRequirements: ['Wheelchair Ramp Access']
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.event.title).toBe('Alice & Charlie Wedding Celebration');
    eventId = res.body.event._id;
  });

  it('should list events for User 1', async () => {
    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(1);
    expect(res.body.events[0]._id).toBe(eventId);
  });

  it('should generate an AI plan for the event (fallback or live)', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/ai/generate`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        additionalPrompt: 'Emphasize eco-friendly decor and local organic catering'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.plan).toBeDefined();
    expect(res.body.plan.budgetRecommendations.length).toBeGreaterThan(0);
    expect(res.body.plan.checklistTasks.length).toBeGreaterThan(0);
    expect(res.body.disclaimer).toBeDefined();
  });

  it('should apply the generated plan to populate budget, tasks, and vendors', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/ai/apply`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        applyBudget: true,
        applyTasks: true,
        applyVendors: true,
        applyTheme: true
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.applied.budgetItemsCreated).toBeGreaterThan(0);
    expect(res.body.applied.tasksCreated).toBeGreaterThan(0);
    expect(res.body.applied.vendorsCreated).toBeGreaterThan(0);
  });

  it('should fetch expenses with budget summary metrics', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}/expenses`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.budgetSummary).toBeDefined();
    expect(res.body.budgetSummary.totalBudget).toBe(12000);
    expect(res.body.budgetSummary.totalAllocated).toBeGreaterThan(0);
    expect(res.body.expenses.length).toBeGreaterThan(0);
  });

  it('should add a custom expense and calculate overrun', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/expenses`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        category: 'Venue',
        title: 'Main Pavilion Hall Deposit',
        allocatedAmount: 4000,
        actualAmount: 4200,
        paidStatus: 'paid'
      });

    expect(res.status).toBe(201);
    expect(res.body.expense.actualAmount).toBe(4200);

    const listRes = await request(app)
      .get(`/api/events/${eventId}/expenses`)
      .set('Authorization', `Bearer ${user1Token}`);

    const venue = listRes.body.budgetSummary.categoryBreakdowns.find(
      (c: any) => c.category === 'Venue'
    );
    expect(venue.actual).toBeGreaterThanOrEqual(4200);
  });

  it('should toggle task completion status', async () => {
    const taskListRes = await request(app)
      .get(`/api/events/${eventId}/tasks`)
      .set('Authorization', `Bearer ${user1Token}`);

    const firstTask = taskListRes.body.tasks[0];
    expect(firstTask).toBeDefined();

    const toggleRes = await request(app)
      .patch(`/api/events/${eventId}/tasks/${firstTask._id}/toggle`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.task.status).toBe('completed');
    expect(toggleRes.body.task.completedAt).toBeDefined();

    const updatedListRes = await request(app)
      .get(`/api/events/${eventId}/tasks`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(updatedListRes.body.taskMetrics.completed).toBeGreaterThanOrEqual(1);
    expect(updatedListRes.body.taskMetrics.completionPercentage).toBeGreaterThan(0);
  });

  it('should prevent User 2 from accessing User 1 event (Security Check)', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should prevent User 2 from creating expenses on User 1 event', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/expenses`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        category: 'Venue',
        title: 'Unauthorized Entry',
        allocatedAmount: 100,
        actualAmount: 100
      });

    expect(res.status).toBe(404);
  });

  it('should return aggregated dashboard data for User 1', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.totalEvents).toBe(1);
    expect(res.body.stats.upcomingEventsCount).toBe(1);
    expect(res.body.stats.totalBudget).toBe(12000);
    expect(res.body.upcomingEvents).toHaveLength(1);
    expect(res.body.upcomingEvents[0].taskPercentage).toBeGreaterThan(0);
  });

  it('should cascade delete event and all related resources', async () => {
    const deleteRes = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Verify sub-resources are completely cleaned up
    const remainingExpenses = await Expense.find({ eventId });
    const remainingTasks = await Task.find({ eventId });
    const remainingVendors = await Vendor.find({ eventId });

    expect(remainingExpenses).toHaveLength(0);
    expect(remainingTasks).toHaveLength(0);
    expect(remainingVendors).toHaveLength(0);
  });
});
