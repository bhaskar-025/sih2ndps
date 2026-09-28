import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Logger } from '../utils/logger';

dotenv.config();

let isConnected = false;

export const connectDatabase = async (): Promise<void> => {
  if (isConnected) {
    Logger.info('MongoDB is already connected.');
    return;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/maitri_plus';

  try {
    mongoose.set('strictQuery', false);

    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = connection.connections[0].readyState === 1;
    Logger.info(`MongoDB Connected successfully: ${mongoose.connection.host}/${mongoose.connection.name}`);

    mongoose.connection.on('error', (err) => {
      Logger.error('MongoDB runtime connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      Logger.warn('MongoDB disconnected. Reconnecting...');
      isConnected = false;
    });
  } catch (error: any) {
    Logger.error(`MongoDB Connection Error: ${error.message}`);
    Logger.warn('Server will continue running. Ensure MongoDB Atlas or local daemon is reachable.');
  }
};

export const getDatabaseStatus = (): { isConnected: boolean; host?: string } => {
  return {
    isConnected,
    host: mongoose.connection?.host,
  };
};

export default connectDatabase;
