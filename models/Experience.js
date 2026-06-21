import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    companyLogo: { type: String }, // Cloudinary URL
    type: {
      type: String,
      enum: ['Internship', 'Full-Time', 'Freelance', 'Mentor', 'Teaching'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // Null if current
    isCurrent: { type: Boolean, default: false },
    description: { type: String, required: true },
    technologies: [{ type: String }],
    displayOrder: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

experienceSchema.index({ isDeleted: 1 });
experienceSchema.index({ startDate: -1 });

const Experience = mongoose.model('Experience', experienceSchema);
export default Experience;
