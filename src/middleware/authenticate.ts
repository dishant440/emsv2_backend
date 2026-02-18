import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { IUserPayload } from '../types/models';
import { ApiError } from '../utils/ApiError';

/**
 * JWT authentication middleware.
 * Decodes the token and attaches req.user with { userId, role, email }.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        return next(ApiError.unauthorized('No token provided'));
    }

    try {
        const decoded = jwt.verify(token, env.jwtSecret) as IUserPayload;
        req.user = decoded;
        next();
    } catch {
        next(ApiError.unauthorized('Invalid or expired token'));
    }
};
