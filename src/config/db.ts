import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export const connectToDB = async (): Promise<void> => {
    try {
        logger.info('Connecting to MongoDB...', { uri: env.mongoUri.replace(/\/\/.*@/, '//<credentials>@') });
        await mongoose.connect(env.mongoUri);
        logger.info('MongoDB connected successfully');
    } catch (error) {
        logger.error('MongoDB connection error', { error });
        process.exit(1);
    }

    mongoose.connection.on('error', (err) => {
        logger.error('MongoDB runtime error', { error: err });
    });

    mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
    });
};
