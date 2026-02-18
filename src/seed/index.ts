import { connectToDB } from '../config/db';
import { seedRoles } from './seedRoles';
import { seedPolicies } from './seedPolicies';
import { seedAdmin, seedEmployee } from './seedAdmin';
import { logger } from '../config/logger';

async function runSeed() {
    try {
        await connectToDB();
        logger.info('Starting database seed...');

        await seedRoles();
        await seedPolicies();
        await seedAdmin();
        await seedEmployee();

        logger.info('Database seed completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Seed failed', { error });
        process.exit(1);
    }
}

runSeed();
