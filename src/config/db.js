const mongoose = require('mongoose');

let inMemoryServerInstance = null;

const connectDB = async (customUri = null) => {
  const uri = customUri || process.env.MONGO_URI || 'mongodb://localhost:27017/ncc_cadet_db';

  try {
    // Attempt standard connection with 5s timeout
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    // In dev mode, if local MongoDB is not running, automatically spin up in-memory instance
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      try {
        console.warn(`[MongoDB] Could not connect to MongoDB at ${uri} (${error.message}).`);
        console.log('[MongoDB] Starting zero-config in-memory MongoDB instance for local development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        inMemoryServerInstance = await MongoMemoryServer.create();
        const memUri = inMemoryServerInstance.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[MongoDB] Connected to in-memory database at ${memUri}`);

        // Automatically seed initial data if empty
        const Rank = require('../models/Rank');
        const count = await Rank.countDocuments();
        if (count === 0) {
          console.log('[MongoDB] In-memory database is empty. Seeding initial NCC records...');
          await autoSeed();
        }

        return conn;
      } catch (memErr) {
        console.error(`[MongoDB] Failed to start in-memory fallback: ${memErr.message}`);
      }
    }

    console.error(`[MongoDB] Error connecting to database: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      console.error('[MongoDB] Please ensure MongoDB is running or check your MONGO_URI in .env');
      process.exit(1);
    }
    throw error;
  }
};

const autoSeed = async () => {
  try {
    const { seedDatabase } = require('../seeds/seed');
    await seedDatabase();
    console.log('[MongoDB] Auto-seeding completed with all default NCC records, accounts, and units!');
  } catch (seedErr) {
    console.warn('[MongoDB] Auto-seeding warning:', seedErr.message);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (inMemoryServerInstance) {
      await inMemoryServerInstance.stop();
    }
    console.log('[MongoDB] Database connection closed');
  } catch (error) {
    console.error(`[MongoDB] Error closing database connection: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
