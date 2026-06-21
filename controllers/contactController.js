import ContactMessage from '../models/ContactMessage.js';
import sendContactEmail from '../utils/nodemailer.js';

// @desc    Submit a contact form
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const newMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    // Send email notification
    await sendContactEmail(name, email, subject, message);

    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export { submitContactForm };
