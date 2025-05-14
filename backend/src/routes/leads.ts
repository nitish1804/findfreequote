import express from 'express';
import {
  createLead,
  getLeads,
  getLead,
  updateLeadStatus,
  assignLeadToContractor,
  updateContractorStatus,
  verifyLead,
} from '../../controllers/leadController';
import { protect, authorize } from '../../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/', createLead);

// Protected routes
router.get('/', protect, getLeads);
router.get('/:id', protect, getLead);
router.patch('/:id/status', protect, updateLeadStatus);
router.patch('/:id/contractor-status', protect, authorize('contractor'), updateContractorStatus);

// Admin only routes
router.post('/:id/assign', protect, authorize('admin'), assignLeadToContractor);
router.post('/:id/verify', protect, authorize('admin'), verifyLead);

export default router;
