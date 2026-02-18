import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

export const errorHandler = (
    err: Error | ApiError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (err instanceof ApiError) {
        logger.warn(`API Error: ${err.message}`, {
            statusCode: err.statusCode,
            path: _req.path,
            method: _req.method,
        });
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        logger.warn(`Validation Error: ${err.message}`, { path: _req.path });
        res.status(400).json({
            success: false,
            message: err.message,
        });
        return;
    }

    // Mongoose duplicate key error
    if ((err as any).code === 11000) {
        logger.warn(`Duplicate Key Error`, { path: _req.path, error: err.message });
        res.status(409).json({
            success: false,
            message: 'Duplicate entry. This record already exists.',
        });
        return;
    }

    // Unexpected errors
    logger.error('Unhandled error', { error: err.message, stack: err.stack, path: _req.path });
    res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
};
