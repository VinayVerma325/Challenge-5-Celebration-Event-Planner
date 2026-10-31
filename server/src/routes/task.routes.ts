import { Router } from 'express';
import {
  listTasks,
  createTask,
  updateTask,
  toggleTaskStatus,
  deleteTask
} from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createTaskSchema, updateTaskSchema } from '../validators/task.validator.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', listTasks);
router.post('/', validateBody(createTaskSchema), createTask);
router.put('/:id', validateBody(updateTaskSchema), updateTask);
router.patch('/:id/toggle', toggleTaskStatus);
router.delete('/:id', deleteTask);

export default router;
