import { Router } from 'express';
import { generatePlan, getLatestPlan, applyPlan } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { generateAiPlanRequestSchema, applyAiPlanSchema } from '../validators/ai.validator.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/generate', aiRateLimiter, validateBody(generateAiPlanRequestSchema), generatePlan);
router.get('/latest', getLatestPlan);
router.post('/apply', validateBody(applyAiPlanSchema), applyPlan);

export default router;
