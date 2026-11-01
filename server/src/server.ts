import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

async function bootstrap() {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`Celebration & Event Planner Server listening on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`Client URL: ${env.CLIENT_URL}`);
      console.log(`Gemini AI Key: ${env.GEMINI_API_KEY ? 'Configured (Active)' : 'Offline Safety Mode'}`);
    });

    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('Database disconnected. Process exited.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Fatal startup error:', error);
    process.exit(1);
  }
}

bootstrap();
