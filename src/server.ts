import app from './app';
import { connectToDB } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';
import { seedRoles } from './seed/seedRoles';
import { seedPolicies } from './seed/seedPolicies';
import { seedAdmin, seedEmployee } from './seed/seedAdmin';

const startServer = async (): Promise<void> => {
    try {
        // Connect to MongoDB
        await connectToDB();

        // Auto-seed on startup (idempotent)
        await seedRoles();
        await seedPolicies();
        await seedAdmin();
        await seedEmployee();

        // Start listening
        app.listen(env.port, '0.0.0.0', () => {
            logger.info(`Server running on port ${env.port} [${env.nodeEnv}]`);
            logger.info('PBAC engine initialized — policies loaded from database');
        });
    } catch (error) {
        logger.error('Failed to start server', { error });
        process.exit(1);
    }
};

startServer();
