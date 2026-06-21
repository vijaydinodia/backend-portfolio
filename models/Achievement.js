import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    image: { type: String }, // Cloudinary URL
    certificateLink: { type: String },
    category: {
      type: String,
      enum: ['LeetCode', 'Certification', 'Award', 'Hackathon'],
      required: true,
    },
    displayOrder: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

achievementSchema.index({ isDeleted: 1 });
achievementSchema.index({ date: -1 });

const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;
