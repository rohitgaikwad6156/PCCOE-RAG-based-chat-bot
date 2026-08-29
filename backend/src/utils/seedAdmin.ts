import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { connectDatabase, isDbConnected } from '../config/database';

export async function seedAdminUser(): Promise<void> {
  try {
    if (isDbConnected()) {
      const existingAdmin = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, salt);

        await User.create({
          name: env.ADMIN_NAME,
          email: env.ADMIN_EMAIL.toLowerCase(),
          passwordHash,
          role: 'admin',
          department: 'Central Administration',
        });
        logger.info(`PCCOE Administrator seeded: ${env.ADMIN_EMAIL}`);
      }

      const demoStudentEmail = 'student@pccoe.org';
      const existingStudent = await User.findOne({ email: demoStudentEmail });
      if (!existingStudent) {
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash('PccoeStudent2026!', salt);

        await User.create({
          name: 'Rohan Deshmukh',
          email: demoStudentEmail,
          passwordHash,
          role: 'student',
          department: 'Computer Engineering',
        });
        logger.info(`PCCOE Demo Student seeded: ${demoStudentEmail}`);
      }
    } else {
      logger.info(`PCCOE Administrator & Student available in memory store: ${env.ADMIN_EMAIL} & student@pccoe.org`);
    }
  } catch (error: any) {
    logger.warn(`Admin seed check skipped: ${error.message}`);
  }
}

if (require.main === module) {
  connectDatabase().then(async () => {
    await seedAdminUser();
    process.exit(0);
  });
}
