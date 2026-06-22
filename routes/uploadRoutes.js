import express from "express";
import { uploadCV } from "../middleware/uploadMiddleware.js";
import cloudinary from "../utils/cloudinary.js";
import { protect } from "../middleware/authMiddleware.js";
import SiteProfile from "../models/SiteProfile.js";
import stream from "stream";

const router = express.Router();

// ── CV Upload Route ───────────────────────────────────────
router.post("/cv", protect, uploadCV.single("cv"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No PDF file uploaded",
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "vijay_portfolio/cv",
        resource_type: "raw", // best for PDF files
        public_id: "resume",
        overwrite: true,
      },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({
            message: "Error uploading PDF",
            error: error.message,
          });
        }

        try {
          // Save resume URL in database
          let profile = await SiteProfile.findOne();

          if (!profile) {
            profile = new SiteProfile();
          }

          profile.resumeUrl = result.secure_url;
          await profile.save();

          res.status(200).json({
            success: true,
            message: "Resume uploaded successfully",
            url: result.secure_url,
            public_id: result.public_id,
          });

        } catch (dbError) {
          console.error("Database Error:", dbError.message);

          res.status(500).json({
            message: "Uploaded but failed to save URL",
          });
        }
      }
    );

    // Convert file buffer to stream
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    bufferStream.pipe(uploadStream);

  } catch (error) {
    console.error("Server Error:", error.message);

    res.status(500).json({
      message: "Server error during upload",
      error: error.message,
    });
  }
});

export default router;