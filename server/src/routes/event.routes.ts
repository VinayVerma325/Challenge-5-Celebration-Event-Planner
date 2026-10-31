import { Router } from 'express';
import {
  listEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent
} from '../controllers/event.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createEventSchema, updateEventSchema } from '../validators/event.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', listEvents);
router.post('/', validateBody(createEventSchema), createEvent);
router.get('/:id', getEventById);
router.put('/:id', validateBody(updateEventSchema), updateEvent);
router.delete('/:id', deleteEvent);

export default router;
