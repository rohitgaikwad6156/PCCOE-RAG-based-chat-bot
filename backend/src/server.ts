import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { seedAdminUser } from './utils/seedAdmin';
import { seedStructuredData } from './utils/seedStructuredData';
import { autoIndexDefaultKnowledge } from './utils/autoIndex';
import { logger } from './utils/logger';

async function startServer(): Promise<void> {
  try {
    logger.info('Initializing PCCOE RAG Assistant Backend Server...');

    // Connect to database (or enable memory mode)
    await connectDatabase();

    // Seed default admin and student demo user
    await seedAdminUser();

    // Seed structured college profiles (Departments, Courses, Clubs, Hostels, Scholarships)
    await seedStructuredData();

    // Auto-index default PCCOE knowledge base into vector store
    await autoIndexDefaultKnowledge();

    // Start Express listener
    app.listen(env.PORT, () => {
      logger.info(`========================================================`);
      logger.info(`🚀 PCCOE Assistant Backend running on port ${env.PORT}`);
      logger.info(`📡 Health Check: http://localhost:${env.PORT}/api/health`);
      logger.info(`🌐 Environment: ${env.NODE_ENV}`);
      logger.info(`🤖 LLM Provider: ${env.LLM_PROVIDER} (${env.LLM_MODEL})`);
      logger.info(`🎯 Vector Store: ${env.VECTOR_STORE_PROVIDER}`);
      logger.info(`========================================================`);
    });
  } catch (error: any) {
    logger.error(`Fatal Server Startup Error: ${error.message}`);
    process.exit(1);
  }
}

startServer();
