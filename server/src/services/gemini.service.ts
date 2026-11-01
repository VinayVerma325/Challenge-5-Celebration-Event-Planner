import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import { IEvent } from '../models/Event.js';
import { AiPlanOutput, aiPlanOutputSchema } from '../validators/ai.validator.js';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
  }

  public hasApiKey(): boolean {
    return !!env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0;
  }

  public async generateEventPlan(
    event: IEvent,
    additionalPrompt: string = '',
    focusAreas: string[] = []
  ): Promise<{ plan: AiPlanOutput; isDemoFallback: boolean; disclaimer: string }> {
    // If no API key is provided, return a structured, tailored celebration plan
    if (!this.genAI || !this.hasApiKey()) {
      const fallbackPlan = this.generateTailoredFallback(event, additionalPrompt);
      return {
        plan: fallbackPlan,
        isDemoFallback: true,
        disclaimer:
          'Celebration Planning Advisory: Structured recommendations tailored algorithmically to your event parameters. Connect your live Gemini API key in settings for real-time generative intelligence.'
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-3.8-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      });

      const prompt = `
You are an expert master celebration and event planner.
Generate a comprehensive, actionable, realistic event plan in strictly valid JSON format matching the schema below.

EVENT DETAILS:
- Title: ${event.title}
- Event Type: ${event.eventType}
- Target Date: ${new Date(event.date).toLocaleDateString()}
- Location: ${event.location}
- Expected Guest Count: ${event.guestCount}
- Planned Budget: ${event.currency} ${event.budget}
- Stated Theme/Style: ${event.theme || 'Classic & Elegant'}
- Dietary Needs: ${event.dietaryRequirements?.length ? event.dietaryRequirements.join(', ') : 'Standard'}
- Accessibility Considerations: ${event.accessibilityRequirements?.length ? event.accessibilityRequirements.join(', ') : 'Standard accessible venue'}
- Additional Notes / User Preferences: ${event.notes || 'None'}
- Custom Focus: ${additionalPrompt || 'Comprehensive planning'}
- Focus Areas: ${focusAreas.join(', ') || 'All categories'}

REQUIRED JSON OUTPUT FORMAT:
{
  "themeConcept": "A vivid 2-3 sentence concept description highlighting color palette, ambience, and mood",
  "decorIdeas": ["Array of 4-6 specific decor ideas"],
  "foodAndBeverageIdeas": ["Array of 4-6 food, beverage, and menu concepts tailored to the dietary requirements"],
  "activityIdeas": ["Array of 4-5 engaging activities or entertainment elements for guests"],
  "budgetRecommendations": [
    {
      "category": "One of: Venue, Catering, Photography, Decor & Flowers, Entertainment, Attire & Beauty, Invitations & Favors, Transport & Lodging, Miscellaneous",
      "percentage": 30, // integer percentage
      "suggestedAmount": 3000, // numeric calculated amount
      "rationale": "Brief rationale for this allocation"
    }
  ],
  "milestoneTimeline": [
    {
      "timeframe": "e.g. 6 Months Before, 3 Months Before, 1 Month Before, Week Of, Day Of",
      "title": "Milestone title",
      "description": "Milestone summary"
    }
  ],
  "checklistTasks": [
    {
      "title": "Actionable task name",
      "category": "Category name",
      "priority": "low | medium | high",
      "daysBeforeEvent": 60 // number of days before target date this should be done
    }
  ],
  "vendorSuggestions": [
    {
      "category": "e.g. Venue, Catering, Photography, Entertainment",
      "name": "Suggested Vendor Type or Sample Title (clearly non-binding recommendation)",
      "estimatedBudgetShare": "e.g. 25-30% of total budget",
      "recommendationTips": "Practical screening tips and questions to ask"
    }
  ],
  "personalizedTips": [
    "Array of 3-5 specific, tailored tips addressing budget limits, guest comfort, accessibility, and smooth flow"
  ]
}

Ensure all calculated suggestedAmounts in budgetRecommendations sum approximately to the total budget of ${event.budget}.
Ensure all JSON is valid and clean.
`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API response timed out after 15 seconds')), 15000)
      );

      const result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise
      ]);
      const textResponse = result.response.text();

      // Clean markdown code blocks if any exist
      const cleanedJson = textResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const parsedData = JSON.parse(cleanedJson);
      const validatedPlan = aiPlanOutputSchema.parse(parsedData);

      return {
        plan: validatedPlan,
        isDemoFallback: false,
        disclaimer:
          'Live AI Generation Verified: Generated with Google Gemini. All budget estimates, timelines, and vendor recommendations are advisory suggestions to help guide your celebration.'
      };
    } catch (apiError: any) {
      console.error('Gemini API call or validation failed, using fallback:', apiError?.message || apiError);
      const fallbackPlan = this.generateTailoredFallback(event, additionalPrompt);
      return {
        plan: fallbackPlan,
        isDemoFallback: true,
        disclaimer: 'Celebration Planning Advisory: Structured recommendations tailored to your event parameters.'
      };
    }
  }

  public generateTailoredFallback(event: IEvent, customNotes: string = ''): AiPlanOutput {
    const totalBudget = event.budget || 5000;
    const eventType = event.eventType.toLowerCase();

    // Default category allocations according to event type
    let allocations = [
      { category: 'Venue', pct: 0.30, rationale: 'Primary location and amenities' },
      { category: 'Catering', pct: 0.30, rationale: 'Food service and beverages for all guests' },
      { category: 'Photography', pct: 0.12, rationale: 'Professional photography and video captures' },
      { category: 'Decor & Flowers', pct: 0.10, rationale: 'Thematic decoration and atmosphere styling' },
      { category: 'Entertainment', pct: 0.08, rationale: 'Sound, DJ, live performances or games' },
      { category: 'Miscellaneous', pct: 0.10, rationale: 'Contingency fund and day-of emergency buffer' }
    ];

    if (eventType === 'community') {
      allocations = [
        { category: 'Venue', pct: 0.25, rationale: 'Community hall or public park permits' },
        { category: 'Catering', pct: 0.35, rationale: 'Buffet, refreshment stations, water points' },
        { category: 'Entertainment', pct: 0.15, rationale: 'Public address system, stages, activities' },
        { category: 'Decor & Flowers', pct: 0.10, rationale: 'Signage, banners, accessible pathways' },
        { category: 'Miscellaneous', pct: 0.15, rationale: 'Safety supplies, insurance, first-aid' }
      ];
    } else if (eventType === 'birthday') {
      allocations = [
        { category: 'Venue', pct: 0.25, rationale: 'Private room or lounge rental' },
        { category: 'Catering', pct: 0.30, rationale: 'Custom cake, finger foods, and bar' },
        { category: 'Entertainment', pct: 0.15, rationale: 'Music, games, host or entertainer' },
        { category: 'Decor & Flowers', pct: 0.15, rationale: 'Balloons, backdrop, lighting & table decor' },
        { category: 'Photography', pct: 0.08, rationale: 'Party photography and polaroid station' },
        { category: 'Miscellaneous', pct: 0.07, rationale: 'Party favors and gift bags' }
      ];
    }

    const budgetRecommendations = allocations.map((item) => ({
      category: item.category,
      percentage: Math.round(item.pct * 100),
      suggestedAmount: Math.round(totalBudget * item.pct),
      rationale: item.rationale
    }));

    return {
      themeConcept: `A bespoke "${event.theme || 'Modern Celebration'}" concept curated for ${event.guestCount} guests, harmonizing warm ambient lighting with cohesive accents at ${event.location}.`,
      decorIdeas: [
        'Curated floral/accent welcome table with an interactive guestbook station',
        'Warm ambient fairy lighting and customized directional signage',
        'Accessible, spaced seating layouts accommodating all attendees',
        'Photo-ready themed focal backdrop with branded or milestone accents'
      ],
      foodAndBeverageIdeas: [
        'Curated signature welcome drinks (both non-alcoholic mocktail and cocktail)',
        `Multi-course menu with options addressing: ${event.dietaryRequirements?.length ? event.dietaryRequirements.join(', ') : 'Vegetarian, Vegan, Gluten-Free'}`,
        'Interactive dessert table featuring artisanal miniatures and ceremonial cake',
        'Late-evening refreshment coffee and tea service'
      ],
      activityIdeas: [
        'Icebreaker welcome interactive trivia or video retrospective',
        'Live acoustic music or curated dynamic playlist progression',
        'Dedicated celebration toast and ceremonial cake cutting',
        'Interactive memory wall or digital photo booth'
      ],
      budgetRecommendations,
      milestoneTimeline: [
        {
          timeframe: '6-8 Weeks Before',
          title: 'Core Venue & Key Vendor Confirmation',
          description: 'Lock in primary venue contract, caterer, and lead photographer.'
        },
        {
          timeframe: '4 Weeks Before',
          title: 'Guest RSVPs & Dietary Finalization',
          description: 'Gather final headcount, dietary preferences, and finalize seating chart.'
        },
        {
          timeframe: '2 Weeks Before',
          title: 'Decor, Music & Run of Show',
          description: 'Finalize minute-by-minute schedule and supply list.'
        },
        {
          timeframe: 'Week Of Event',
          title: 'Vendor Reconfirmation & Final Packout',
          description: 'Confirm load-in times, contact persons, and balance payments.'
        },
        {
          timeframe: 'Day of Event',
          title: 'Setup, Execution & Celebration',
          description: 'Early venue check, welcome guests, and follow timeline smoothly.'
        }
      ],
      checklistTasks: [
        {
          title: 'Confirm venue contract and access times',
          category: 'Venue',
          priority: 'high',
          daysBeforeEvent: 45
        },
        {
          title: 'Finalize catering menu and dietary accommodations',
          category: 'Catering',
          priority: 'high',
          daysBeforeEvent: 30
        },
        {
          title: 'Send formal invitations and track RSVPs',
          category: 'Invitations & Favors',
          priority: 'high',
          daysBeforeEvent: 35
        },
        {
          title: 'Book photographer and provide shot list',
          category: 'Photography',
          priority: 'medium',
          daysBeforeEvent: 28
        },
        {
          title: 'Order themed decorations and signage',
          category: 'Decor & Flowers',
          priority: 'medium',
          daysBeforeEvent: 20
        },
        {
          title: 'Prepare run-of-show schedule and share with key helpers',
          category: 'General',
          priority: 'medium',
          daysBeforeEvent: 7
        },
        {
          title: 'Confirm day-of emergency kit and payment balances',
          category: 'General',
          priority: 'low',
          daysBeforeEvent: 2
        }
      ],
      vendorSuggestions: [
        {
          category: 'Venue',
          name: 'Independent Event Space or Private Banquet Hall',
          estimatedBudgetShare: '25-30%',
          recommendationTips: 'Check noise curfew, accessibility ramps, and whether cleanup is included in the fee.'
        },
        {
          category: 'Catering',
          name: 'Local Boutique Catering / Full-Service Kitchen',
          estimatedBudgetShare: '30-35%',
          recommendationTips: 'Request a tasting and verify allergy separation protocols.'
        },
        {
          category: 'Photography',
          name: 'Professional Event Photographer',
          estimatedBudgetShare: '10-12%',
          recommendationTips: 'Review past celebration portfolios in low-light and outdoor environments.'
        },
        {
          category: 'Entertainment',
          name: 'Live Musician, DJ, or Sound Specialist',
          estimatedBudgetShare: '8-10%',
          recommendationTips: 'Ask for equipment specifications and provide a "do-not-play" song list.'
        }
      ],
      personalizedTips: [
        `Ensure ${event.location} has clear ADA / accessibility pathways for all ${event.guestCount} guests.`,
        'Keep 5-10% of your total budget aside in the Miscellaneous category for unexpected last-minute purchases.',
        'Designate a trusted friend or point person on event day so you can fully enjoy the celebration without answering delivery calls.'
      ]
    };
  }
}

export const geminiService = new GeminiService();
