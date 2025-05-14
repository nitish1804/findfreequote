import express from 'express';
import {
  getServiceCategories,
  getServices,
  getService,
  getServiceBySlug,
  createServiceCategory,
  createService,
} from '../controllers/serviceController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/categories', getServiceCategories);
router.get('/', getServices);
router.get('/:id', getService);
router.get('/slug/:slug', getServiceBySlug);

// Admin only routes
router.post('/categories', protect, authorize('admin'), createServiceCategory);
router.post('/', protect, authorize('admin'), createService);

// Additional admin routes could be added here for updating and deleting services

export default router;