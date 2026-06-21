import express from 'express';
import {
  getProjects,
  getAllProjectsAdmin,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  restoreProject,
  reorderProjects,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProjects)
  .post(protect, createProject);

router.route('/all').get(protect, getAllProjectsAdmin);
router.route('/reorder').put(protect, reorderProjects);

router.route('/:idOrSlug').get(getProjectById);

router.route('/:id')
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.route('/:id/restore').patch(protect, restoreProject);

export default router;
