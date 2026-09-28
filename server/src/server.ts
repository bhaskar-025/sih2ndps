import dotenv from 'dotenv';
import { createApp } from './app';
import { connectDatabase } from './config/database';
import { Logger } from './utils/logger';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Initialize Express application
    const app = createApp();

    // Start listening on configured port
    const server = app.listen(PORT, () => {
      Logger.info(`🚀 Server running on http://localhost:${PORT}`);
      Logger.info(`📌 Health check: http://localhost:${PORT}/api/v1/health`);
      Logger.info(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful Shutdown Handler
    const handleGracefulShutdown = (signal: string) => {
      Logger.warn(`Received ${signal}. Starting graceful shutdown...`);
      server.close(() => {
        Logger.info('HTTP server closed cleanly.');
        process.exit(0);
      });

      // Force close if graceful shutdown hangs
      setTimeout(() => {
        Logger.error('Forced shutdown due to timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

  } catch (error: any) {
    Logger.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  }
};

startServer();
