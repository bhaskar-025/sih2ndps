import mongoose from 'mongoose';
import { config } from './environment';
import { Logger } from '../utils/logger';

let isConnected = false;

export const connectDatabase = async (): Promise<void> => {
  if (isConnected) {
    Logger.info('MongoDB is already connected.');
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    
    // Set connection options
    const connection = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = !!connection.connections[0].readyState;
    Logger.info(`MongoDB Connected successfully to: ${mongoose.connection.host}/${mongoose.connection.name}`);

    mongoose.connection.on('error', (err) => {
      Logger.error('MongoDB runtime connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      Logger.warn('MongoDB disconnected. Reconnecting...');
      isConnected = false;
    });

  } catch (error: any) {
    Logger.error(`MongoDB Connection Error: ${error.message}`);
    Logger.warn('Backend server will continue running. Ensure MongoDB Atlas or local daemon is reachable.');
  }
};

export const getDbStatus = (): { isConnected: boolean; host?: string } => {
  return {
    isConnected,
    host: mongoose.connection?.host,
  };
};
