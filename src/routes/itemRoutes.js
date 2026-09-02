import { Router } from 'express';
import * as itemCtrl from '../controllers/itemController.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createItemSchema,
  updateItemSchema,
  patchItemSchema,
  itemParamsSchema,
  queryItemSchema,
  bulkDeleteSchema,
  bulkCreateSchema,
} from '../models/itemSchema.js';

const router = Router();

// Stats & bulk operations
router.get('/stats/summary', asyncHandler(itemCtrl.getItemStats));
router.get('/export', asyncHandler(itemCtrl.exportItems));
router.post('/reset', asyncHandler(itemCtrl.resetData));
router.post('/bulk-delete', validate(bulkDeleteSchema), asyncHandler(itemCtrl.bulkDeleteItems));
router.post('/bulk-create', validate(bulkCreateSchema), asyncHandler(itemCtrl.bulkCreateItems));

// Standard CRUD
router
  .route('/')
  .get(validate(queryItemSchema), asyncHandler(itemCtrl.getItems))
  .post(validate(createItemSchema), asyncHandler(itemCtrl.createItem));

router
  .route('/:id')
  .get(validate(itemParamsSchema), asyncHandler(itemCtrl.getItemById))
  .put(validate(updateItemSchema), asyncHandler(itemCtrl.updateItem))
  .patch(validate(patchItemSchema), asyncHandler(itemCtrl.patchItem))
  .delete(validate(itemParamsSchema), asyncHandler(itemCtrl.deleteItem));

export default router;
