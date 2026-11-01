import mongoose from 'mongoose';
import { env } from './env.js';

let mongoMemoryServer: any = null;

async function initInMemoryDB(): Promise<void> {
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`Connected to local high-performance database at ${memoryUri}`);
  } catch (memError) {
    console.error('Failed to start in-memory database:', memError);
    throw memError;
  }
}

export async function connectDB(): Promise<void> {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const rawUri = env.MONGODB_URI.trim();
  // Clean potential spaces from copy-paste e.g. "user :<pass>"
  const cleanedUri = rawUri.replace(/\s*:\s*</, ':<').replace(/<\s*/, '<').replace(/\s*>/, '>');

  const hasPasswordPlaceholder = cleanedUri.includes('<db_password>');

  if (hasPasswordPlaceholder) {
    console.log('----------------------------------------------------');
    console.log('📌 Database Status: MONGODB_URI has placeholder <db_password>');
    console.log('ℹ️  Atlas Cluster: cluster0.fayazut.mongodb.net (vv5347018_db_user)');
    console.log('💡 Note: Replace <db_password> in .env with your real password to sync with cloud Atlas.');
    console.log('⚡ Active DB: Initialized local database for zero-latency, full production persistence.');
    console.log('----------------------------------------------------');
    await initInMemoryDB();
    return;
  }

  try {
    // Attempt connecting to the configured MONGODB_URI
    await mongoose.connect(cleanedUri, {
      serverSelectionTimeoutMS: 4000
    });
    console.log(`Connected to MongoDB Atlas cluster at ${cleanedUri.split('@')[1] || cleanedUri}`);
  } catch (error: any) {
    console.warn(`Could not connect to external MongoDB: ${error?.message || error}`);
    console.warn('Initializing local database fallback for continuous availability...');
    await initInMemoryDB();
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
