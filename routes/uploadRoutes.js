import express from "express";
import multer from "multer";
import stream from "stream";
import cloudinary from "../utils/cloudinary.js";
import { protect } from "../middleware/authMiddleware.js";
import SiteProfile from "../models/SiteProfile.js";

const router = express.Router();


// ── Multer Setup for PDF Upload ─────────────────────────────
const storage = multer.memoryStorage();

const uploadCV = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});


// ── CV Upload Route ─────────────────────────────────────────
router.post("/cv", protect, uploadCV.single("cv"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF file uploaded",
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "vijay_portfolio/cv",
        resource_type: "raw",
        public_id: "resume",
        format: "pdf",
        overwrite: true,
      },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);

          return res.status(500).json({
            success: false,
            message: "Error uploading PDF to Cloudinary",
            error: error.message,
          });
        }

        try {
          // Save resume URL in DB
          let profile = await SiteProfile.findOne();

          if (!profile) {
            profile = new SiteProfile();
          }

          profile.resumeUrl = result.secure_url;
          await profile.save();

          return res.status(200).json({
            success: true,
            message: "Resume uploaded successfully",
            url: result.secure_url,
            public_id: result.public_id,
          });

        } catch (dbError) {
          console.error("Database Error:", dbError.message);

          return res.status(500).json({
            success: false,
            message: "PDF uploaded but failed to save URL in database",
          });
        }
      }
    );

    // Convert buffer into stream
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    bufferStream.pipe(uploadStream);

  } catch (error) {
    console.error("Server Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during upload",
      error: error.message,
    });
  }
});

export default router;