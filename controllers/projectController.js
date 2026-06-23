import Project from '../models/Project.js';

// @desc    Get all active projects
// @route   GET /api/projects
// @access  Public
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isDeleted: false }).sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all projects (including deleted) for admin
// @route   GET /api/projects/all
// @access  Private/Admin
export const getAllProjectsAdmin = async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single project by ID or Slug
// @route   GET /api/projects/:idOrSlug
// @access  Public
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    let project;
    
    // Check if it's a valid ObjectId
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(id);
    } else if (id) {
      project = await Project.findOne({ slug: id });
    }

    if (project && !project.isDeleted) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

// @desc    Soft delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (project) {
      res.json({ message: 'Project soft deleted successfully' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    console.error('deleteProject error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Restore a soft-deleted project
// @route   PATCH /api/projects/:id/restore
// @access  Private/Admin
export const restoreProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project) {
      project.isDeleted = false;
      await project.save();
      res.json({ message: 'Project restored successfully', project });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Reorder projects using drag-and-drop
// @route   PUT /api/projects/reorder
// @access  Private/Admin
export const reorderProjects = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const bulkOps = ids.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { displayOrder: index } }
      }
    }));

    await Project.bulkWrite(bulkOps);
    res.json({ success: true, message: 'Projects reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
