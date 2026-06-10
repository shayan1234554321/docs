import { Router } from 'express';
import {
  getDocuments,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  updateAccess,
  getShareDocument,
} from '../controllers/docController';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';
import {
  createDocSchema,
  updateDocSchema,
  updateAccessSchema,
} from '../validators/sharedSchemas';

const router = Router();

// Retrieve all user's documents & create new one
router.get('/', requireAuth as any, getDocuments as any);
router.post('/', requireAuth as any, validateBody(createDocSchema), createDocument as any);

// Retrieve, update, or delete specific documents
router.get('/:id', requireAuth as any, getDocument as any);
router.put('/:id', requireAuth as any, validateBody(updateDocSchema), updateDocument as any);
router.delete('/:id', requireAuth as any, deleteDocument as any);

// Share and access routes
router.put('/:id/access', requireAuth as any, validateBody(updateAccessSchema), updateAccess as any);
router.get('/:id/share', optionalAuth as any, getShareDocument as any);

export default router;
