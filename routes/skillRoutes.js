import express from 'express';
import {
  getSkills,
  getAllSkillsAdmin,
  createSkill,
  updateSkill,
  deleteSkill,
  restoreSkill,
} from '../controllers/skillController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getSkills)
  .post(protect, createSkill);

router.route('/all').get(protect, getAllSkillsAdmin);

router.route('/:id')
  .put(protect, updateSkill)
  .delete(protect, deleteSkill);

router.route('/:id/restore').patch(protect, restoreSkill);

export default router;
