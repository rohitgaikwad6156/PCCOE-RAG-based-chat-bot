import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

let isConnected = false;

export async function connectDatabase(): Promise<boolean> {
  if (isConnected) {
    return true;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    logger.info(`Connected to MongoDB successfully: ${env.MONGODB_URI.split('@')[1] || env.MONGODB_URI}`);
    return true;
  } catch (error: any) {
    logger.warn(`MongoDB direct connection failed (${error.message}). Running in mock/memory-backed database mode.`);
    mongoose.set('bufferCommands', false);
    isConnected = false;
    return false;
  }
}

export function getDatabaseStatus(): { isConnected: boolean; uri: string } {
  return {
    isConnected: mongoose.connection.readyState === 1,
    uri: env.MONGODB_URI ? env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'none',
  };
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
