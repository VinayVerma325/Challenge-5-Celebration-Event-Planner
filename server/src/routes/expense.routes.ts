import { Router } from 'express';
import {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} from '../controllers/expense.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createExpenseSchema, updateExpenseSchema } from '../validators/expense.validator.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', listExpenses);
router.post('/', validateBody(createExpenseSchema), createExpense);
router.put('/:id', validateBody(updateExpenseSchema), updateExpense);
router.delete('/:id', deleteExpense);

export default router;
