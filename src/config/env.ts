import dotenv from 'dotenv';
dotenv.config();

export const env = {
    port: parseInt(process.env.PORT || '5002', 10),
    mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ems_v2',
    jwtSecret: process.env.JWT_SECRET || 'czarcore_ems_secret_key_2024',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    nodeEnv: process.env.NODE_ENV || 'development',
} as const;
