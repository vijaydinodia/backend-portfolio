import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String },
    iconUrl: { type: String }, // Simple Icons CDN URL
    level: { type: Number, min: 0, max: 100, default: 0 },
    experience: { type: String },
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'Database', 'Tools', 'DevOps', 'Programming Languages', 'Soft Skills', 'Other'],
      required: true,
    },
    displayOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    color: { type: String, default: '#2563EB' },
    description: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

skillSchema.index({ category: 1 });
skillSchema.index({ isDeleted: 1 });
skillSchema.index({ displayOrder: 1 });

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;
