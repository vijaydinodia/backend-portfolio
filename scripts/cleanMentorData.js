import dotenv from 'dotenv';
import mongoose from 'mongoose';
import SiteProfile from '../models/SiteProfile.js';
import Experience from '../models/Experience.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

const cleanMentorData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Clean SiteProfile (default paragraph 2 & highlights)
    const profile = await SiteProfile.findOne();
    if (profile) {
      console.log('📄 Found SiteProfile');
      
      // Clean aboutPara2
      if (profile.aboutPara2 && profile.aboutPara2.includes('and Mentor')) {
        profile.aboutPara2 = profile.aboutPara2.replace('and Mentor', '').replace('  ', ' ');
        console.log('🧹 Cleaned aboutPara2 in DB profile');
      }

      // Clean highlights
      const originalCount = profile.highlights.length;
      profile.highlights = profile.highlights.filter(h => !h.title.toLowerCase().includes('mentor'));
      if (profile.highlights.length !== originalCount) {
        console.log(`🧹 Removed Mentor highlight card (was ${originalCount}, now ${profile.highlights.length})`);
      }

      await profile.save();
      console.log('✅ SiteProfile updated successfully');
    } else {
      console.log('⚠️ No SiteProfile document found to clean');
    }

    // 2. Soft-delete Mentor Experience entries
    const experienceResult = await Experience.updateMany(
      { 
        $or: [
          { role: /mentor/i },
          { type: 'Mentor' }
        ],
        isDeleted: false
      },
      { $set: { isDeleted: true } }
    );
    console.log(`🧹 Soft-deleted ${experienceResult.modifiedCount} Mentor experiences`);

    console.log('🎉 DB Cleanup completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during database cleanup:', err.message);
    process.exit(1);
  }
};

cleanMentorData();
