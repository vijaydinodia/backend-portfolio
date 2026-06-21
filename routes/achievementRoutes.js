import express from 'express';
import {
  getAchievements,
  getAllAchievementsAdmin,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  restoreAchievement,
} from '../controllers/achievementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAchievements)
  .post(protect, createAchievement);

router.route('/all').get(protect, getAllAchievementsAdmin);

router.route('/:id')
  .put(protect, updateAchievement)
  .delete(protect, deleteAchievement);

router.route('/:id/restore').patch(protect, restoreAchievement);

export default router;
