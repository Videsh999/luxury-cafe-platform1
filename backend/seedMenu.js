import dotenv from 'dotenv';
import mongoose from 'mongoose';
import MenuItem from './models/MenuItem.js';
import { luxuryMenuItems } from './data/menuData.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/luxury-cafe';

export async function seedMenu() {
  try {
    console.log('🌱 Seeding luxury cafe menu items...');
    
    // Clear old items and insert all 33 luxury cafe items
    await MenuItem.deleteMany({});
    const inserted = await MenuItem.insertMany(luxuryMenuItems);
    console.log(`✅ Successfully seeded ${inserted.length} luxury cafe menu items!`);
    return inserted;
  } catch (err) {
    console.error('❌ Menu seed error:', err.message);
    throw err;
  }
}

// If run directly via node seedMenu.js
if (process.argv[1] && process.argv[1].endsWith('seedMenu.js')) {
  (async () => {
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log('✅ Connected to MongoDB');
      await seedMenu();
      await mongoose.disconnect();
      process.exit(0);
    } catch (e) {
      console.error('Seed failed:', e);
      process.exit(1);
    }
  })();
}
