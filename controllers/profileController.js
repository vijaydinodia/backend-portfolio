import SiteProfile from '../models/SiteProfile.js';

// @desc    Get site profile (public)
// @route   GET /api/profile
// @access  Public
export const getProfile = async (req, res) => {
  try {
    let profile = await SiteProfile.findOne();
    if (!profile) {
      // Auto-create with defaults on first request
      profile = await SiteProfile.create({});
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update site profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    let profile = await SiteProfile.findOne();
    if (!profile) {
      profile = await SiteProfile.create(req.body);
    } else {
      Object.assign(profile, req.body);
      await profile.save();
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
