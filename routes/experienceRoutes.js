import express from 'express';
import {
  getExperiences,
  getAllExperiencesAdmin,
  createExperience,
  updateExperience,
  deleteExperience,
  restoreExperience,
} from '../controllers/experienceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getExperiences)
  .post(protect, createExperience);

router.route('/all').get(protect, getAllExperiencesAdmin);

router.route('/:id')
  .put(protect, updateExperience)
  .delete(protect, deleteExperience);

router.route('/:id/restore').patch(protect, restoreExperience);

export default router;
