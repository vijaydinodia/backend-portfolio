import mongoose from 'mongoose';

const highlightSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
}, { _id: true });

const siteProfileSchema = new mongoose.Schema(
  {
    // Hero Section
    name: { type: String, default: 'Vijay Dinodia' },
    tagline: { type: String, default: 'I build Digital Experiences' },
    subtitle: { type: String, default: 'Welcome to my world' },
    bio: { type: String, default: 'A passionate MERN Stack Developer transforming complex problems into elegant, premium, and highly scalable solutions.' },
    resumeUrl: { type: String, default: '' },

    // About Section
    aboutPara1: { type: String, default: 'I am a passionate Full Stack Engineer specializing in the MERN stack. My focus is on building robust backend architectures and highly interactive, premium frontend experiences.' },
    aboutPara2: { type: String, default: 'With experience as a MERN Stack Developer Intern, I focus on clean full-stack delivery, strong DSA fundamentals, and hackathon-built problem solving.' },
    highlights: {
      type: [highlightSchema],
      default: [
        { title: 'LeetCode Practice', desc: 'Strong foundation in Data Structures and Algorithms.' },
        { title: 'Hackathon Enthusiast', desc: 'Building MVPs rapidly under pressure.' },
      ],
    },

    // Social Links
    github: { type: String, default: '' },
    leetcode: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '+91 9876543210' },
    location: { type: String, default: 'India' },

    // Profile image
    profileImageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

const SiteProfile = mongoose.model('SiteProfile', siteProfileSchema);
export default SiteProfile;
