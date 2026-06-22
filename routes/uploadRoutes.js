import express from 'express';
import upload, { uploadCV } from '../middleware/uploadMiddleware.js';
import cloudinary from '../utils/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';
import SiteProfile from '../models/SiteProfile.js';
import stream from 'stream';

const router = express.Router();

// ── Image Upload ──────────────────────────────────────────────
router.post('/', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'vijay_portfolio' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Error uploading to Cloudinary', error });
        }
        res.json({ message: 'Image uploaded successfully', url: result.secure_url, public_id: result.public_id });
      }
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    bufferStream.pipe(uploadStream);
  } catch (error) {
    res.status(500).json({ message: 'Server error during upload', error: error.message });
  }
});

// ── CV / Resume Upload ────────────────────────────────────────
router.post('/cv', protect, uploadCV.single('cv'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'vijay_portfolio/cv',
        resource_type: 'raw',          // Use raw for PDF documents to ensure they are not converted to images
        public_id: 'resume.pdf',       // Ensure the file has a .pdf extension
        overwrite: true,
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary CV upload error:', error);
          return res.status(500).json({ message: 'Error uploading CV to Cloudinary', error });
        }

        // Auto-save the URL to the site profile resumeUrl
        try {
          let profile = await SiteProfile.findOne();
          if (!profile) profile = new SiteProfile();
          profile.resumeUrl = result.secure_url;
          await profile.save();
        } catch (dbErr) {
          console.error('Failed to save resumeUrl to profile:', dbErr.message);
        }

        res.json({
          message: 'CV uploaded successfully',
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    bufferStream.pipe(uploadStream);
  } catch (error) {
    res.status(500).json({ message: 'Server error during CV upload', error: error.message });
  }
});

export default router;
