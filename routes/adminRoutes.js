import express from 'express';
import {
  authAdmin,
  getMessages,
  markMessageRead,
  deleteMessage,
  openMessageMagicLink,
  setupAdmin,
  createAdmin,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authAdmin);
router.post('/setup', setupAdmin);
router.get('/messages/open/:token', openMessageMagicLink);
router.get('/messages', protect, getMessages);
router.put('/messages/:id/read', protect, markMessageRead);
router.delete('/messages/:id', protect, deleteMessage);
router.post('/create', createAdmin);

export default router;
