import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  updatePassword,
} from '../controllers/authController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateUserProfile);
router.put('/password', protect, updatePassword);

// Admin routes
router.get('/', protect, authorize('admin'), async (req, res) => {
  // Get all users implementation
  res.status(200).json({ message: 'Get all users route' });
});

export default router;