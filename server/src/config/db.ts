import mongoose from 'mongoose';
import { env } from './env.js';

let mongoMemoryServer: any = null;

export async function connectDB(): Promise<void> {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    // Attempt connecting to the configured MONGODB_URI
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`Connected to MongoDB at ${env.MONGODB_URI}`);
  } catch (error) {
    console.warn(`Could not connect to external MongoDB at ${env.MONGODB_URI}.`);
    console.warn('Initializing in-memory MongoDB for local zero-setup execution...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`Connected to in-memory MongoDB at ${memoryUri}`);
    } catch (memError) {
      console.error('Failed to start in-memory MongoDB:', memError);
      throw error;
    }
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
