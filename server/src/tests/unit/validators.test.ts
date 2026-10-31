import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../../validators/auth.validator.js';
import { createEventSchema } from '../../validators/event.validator.js';
import { createExpenseSchema } from '../../validators/expense.validator.js';
import { aiPlanOutputSchema } from '../../validators/ai.validator.js';

describe('Zod Schema Validators', () => {
  it('should validate valid user registration data', () => {
    const validData = {
      name: 'Jane Doe',
      email: 'Jane.Doe@Example.com',
      password: 'password123'
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('jane.doe@example.com'); // converted to lowercase
    }
  });

  it('should reject invalid email and short passwords', () => {
    const invalidEmail = registerSchema.safeParse({
      name: 'Jane',
      email: 'invalid-email',
      password: '123'
    });
    expect(invalidEmail.success).toBe(false);

    const emptyPassword = loginSchema.safeParse({
      email: 'jane@example.com',
      password: ''
    });
    expect(emptyPassword.success).toBe(false);
  });

  it('should validate event creation input correctly', () => {
    const validEvent = {
      title: 'Golden Jubilee Celebration',
      eventType: 'anniversary',
      date: '2026-10-15T18:00:00Z',
      location: 'Grand Heritage Hall, Boston',
      guestCount: 150,
      budget: 15000,
      currency: 'USD',
      theme: 'Vintage Gold'
    };

    const result = createEventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it('should reject negative budget or invalid event type', () => {
    const negativeBudget = createEventSchema.safeParse({
      title: 'Birthday Bash',
      eventType: 'birthday',
      date: '2026-10-15',
      location: 'Park',
      guestCount: 20,
      budget: -500
    });
    expect(negativeBudget.success).toBe(false);

    const invalidType = createEventSchema.safeParse({
      title: 'Conference',
      eventType: 'business_meeting',
      date: '2026-10-15',
      location: 'Park',
      guestCount: 20,
      budget: 1000
    });
    expect(invalidType.success).toBe(false);
  });

  it('should validate expense categories against permitted enums', () => {
    const validExpense = createExpenseSchema.safeParse({
      category: 'Catering',
      title: 'Buffet Dinner Deposit',
      allocatedAmount: 3000,
      actualAmount: 1500,
      paidStatus: 'partially_paid'
    });
    expect(validExpense.success).toBe(true);

    const invalidCategory = createExpenseSchema.safeParse({
      category: 'Automobile Purchase',
      title: 'Car',
      allocatedAmount: 10000
    });
    expect(invalidCategory.success).toBe(false);
  });

  it('should validate complete AI plan output structure', () => {
    const sampleAiOutput = {
      themeConcept: 'Starlight Romance with Navy & Silver highlights',
      decorIdeas: ['Twinkle fairy light canopy', 'Silver sequin table runners'],
      foodAndBeverageIdeas: ['Signature prosecco cocktail', 'Vegan wild mushroom risotto'],
      activityIdeas: ['Photo booth with customized props', 'First dance spotlight'],
      budgetRecommendations: [
        {
          category: 'Venue',
          percentage: 40,
          suggestedAmount: 4000,
          rationale: 'Primary historic ballroom'
        }
      ],
      milestoneTimeline: [
        {
          timeframe: '1 Month Before',
          title: 'Final walkthrough',
          description: 'Meet banquet manager'
        }
      ],
      checklistTasks: [
        {
          title: 'Order wedding favors',
          category: 'Invitations & Favors',
          priority: 'medium' as const,
          daysBeforeEvent: 30
        }
      ],
      vendorSuggestions: [
        {
          category: 'Photography',
          name: 'Artisan Visuals',
          estimatedBudgetShare: '15%',
          recommendationTips: 'Ask for full ceremony galleries'
        }
      ],
      personalizedTips: ['Confirm accessibility ramps at entrance']
    };

    const result = aiPlanOutputSchema.safeParse(sampleAiOutput);
    expect(result.success).toBe(true);
  });
});
