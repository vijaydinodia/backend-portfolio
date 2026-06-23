import Achievement from '../models/Achievement.js';

export const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ isDeleted: false }).sort({ date: -1 });
    res.json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getAllAchievementsAdmin = async (req, res) => {
  try {
    const achievements = await Achievement.find({}).sort({ date: -1 });
    res.json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const createAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.create(req.body);
    res.status(201).json(achievement);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

export const updateAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (achievement) {
      res.json(achievement);
    } else {
      res.status(404).json({ message: 'Achievement not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

export const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (achievement) {
      res.json({ message: 'Achievement soft deleted successfully' });
    } else {
      res.status(404).json({ message: 'Achievement not found' });
    }
  } catch (error) {
    console.error('deleteAchievement error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const restoreAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (achievement) {
      achievement.isDeleted = false;
      await achievement.save();
      res.json({ message: 'Achievement restored successfully', achievement });
    } else {
      res.status(404).json({ message: 'Achievement not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
