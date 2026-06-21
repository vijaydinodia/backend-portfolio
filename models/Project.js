import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    shortDescription: { type: String, required: true, maxlength: 150 },
    fullDescription: { type: String, required: true }, // Rich text HTML
    techStack: [{ type: String }],
    category: {
      type: String,
      enum: ['Full Stack', 'Frontend', 'Backend', 'Mobile', 'AI Project'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Completed', 'In Progress', 'Upcoming'],
      default: 'Completed',
    },
    thumbnail: { type: String }, // Cloudinary URL
    gallery: [{ type: String }], // Array of Cloudinary URLs
    demoVideo: { type: String }, // URL (YouTube or Cloudinary)
    liveUrl: { type: String },
    githubUrl: { type: String },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    completionDate: { type: Date },
    keyFeatures: [{ type: String }],
    challengesFaced: { type: String },
    metrics: {
      users: { type: String },
      performanceScore: { type: String },
      apiCalls: { type: String },
      other: { type: String },
    },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      keywords: { type: String },
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexing for faster queries
projectSchema.index({ slug: 1 });
projectSchema.index({ isDeleted: 1 });
projectSchema.index({ displayOrder: 1 });

const Project = mongoose.model('Project', projectSchema);
export default Project;
