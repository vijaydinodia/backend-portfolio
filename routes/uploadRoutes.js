import express from "express";
import { uploadCV } from "../middleware/uploadMiddleware.js";
import cloudinary from "../utils/cloudinary.js";
import { protect } from "../middleware/authMiddleware.js";
import SiteProfile from "../models/SiteProfile.js";
import stream from "stream";

const router = express.Router();

// ── CV / Resume Upload ────────────────────────────────────────
router.post("/cv", protect, uploadCV.single("cv"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "vijay_portfolio/cv",
        resource_type: "raw",   // important for pdf
        public_id: "resume",
        format: "pdf",
        overwrite: true,
      },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({
            message: "Error uploading PDF",
            error,
          });
        }

        // Save PDF URL in database
        try {
          let profile = await SiteProfile.findOne();
          if (!profile) profile = new SiteProfile();

          profile.resumeUrl = result.secure_url;
          await profile.save();
        } catch (dbErr) {
          console.error("Database save error:", dbErr.message);
        }

        res.status(200).json({
          message: "Resume uploaded successfully",
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    // Convert buffer into stream
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    bufferStream.pipe(uploadStream);

  } catch (error) {
    res.status(500).json({
      message: "Server error during PDF upload",
      error: error.message,
    });
  }
});

export default router;