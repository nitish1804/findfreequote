import express from 'express';
import {
  createQuote,
  getQuotesByContractor,
  getQuotesForLead,
  getQuote,
  updateQuoteStatus,
} from '../controllers/quoteController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes
router.post('/', protect, authorize('contractor'), createQuote);
router.get('/', protect, authorize('contractor'), getQuotesByContractor);
router.get('/lead/:leadId', protect, getQuotesForLead);
router.get('/:id', protect, getQuote);
router.patch('/:id/status', protect, updateQuoteStatus);

export default router;