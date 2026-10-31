import { Router } from 'express';
import {
  listVendors,
  createVendor,
  updateVendor,
  deleteVendor
} from '../controllers/vendor.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createVendorSchema, updateVendorSchema } from '../validators/vendor.validator.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', listVendors);
router.post('/', validateBody(createVendorSchema), createVendor);
router.put('/:id', validateBody(updateVendorSchema), updateVendor);
router.delete('/:id', deleteVendor);

export default router;
