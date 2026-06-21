import AdminUser from '../models/AdminUser.js';
import ContactMessage from '../models/ContactMessage.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
const authAdmin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await AdminUser.findOne({ email });

  if (admin && (await admin.matchPassword(password))) {
    const token = generateToken(res, admin._id);
    res.json({
      _id: admin._id,
      email: admin.email,
      token,
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Get all messages
// @route   GET /api/admin/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Mark message as read
// @route   PUT /api/admin/messages/:id/read
// @access  Private
const markMessageRead = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (message) {
      message.isRead = true;
      const updatedMessage = await message.save();
      res.json(updatedMessage);
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a message
// @route   DELETE /api/admin/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (message) {
      await message.deleteOne();
      res.json({ message: 'Message removed' });
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    One-time admin setup (seed admin user)
// @route   POST /api/admin/setup
// @access  Public (temporary)
const setupAdmin = async (req, res) => {
  try {
    const count = await AdminUser.countDocuments();
    if (count > 0) {
      return res.status(409).json({ message: 'Admin already exists. Setup is disabled.' });
    }
    // Pass plain text — the model pre-save hook will hash it
    const admin = await AdminUser.create({
      email: 'vijaydinodia548@gmail.com',
      password: 'vijay@123',
    });
    res.status(201).json({ message: 'Admin created successfully!', email: admin.email, id: admin._id });
  } catch (error) {
    res.status(500).json({ message: 'Setup failed', error: error.message });
  }
};

// @desc    Create a new admin user
// @route   POST /api/admin/create
// @access  Private (existing admin only)
const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const existingAdmin = await AdminUser.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: 'An admin with this email already exists.' });
    }

    const admin = await AdminUser.create({ email, password });

    res.status(201).json({
      message: 'Admin created successfully!',
      _id: admin._id,
      email: admin.email,
      createdAt: admin.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export { authAdmin, getMessages, markMessageRead, deleteMessage, setupAdmin, createAdmin };
