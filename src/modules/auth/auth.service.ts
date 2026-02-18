import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import Employee from '../../models/Employee';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { IUserPayload } from '../../types/models';

class AuthService {
    async login(email: string, password: string): Promise<{ token: string; user: IUserPayload }> {
        const user = await User.findOne({ email }).select('+password');
        if (!user) throw ApiError.unauthorized('Invalid email or password');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

        const payload: IUserPayload = {
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        };

        const token = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] });

        return { token, user: payload };
    }

    async register(name: string, email: string, password: string, role: string = 'employee') {
        const existing = await User.findOne({ email });
        if (existing) throw ApiError.badRequest('Email already registered');

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        const payload: IUserPayload = {
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        };

        const token = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] });

        return { token, user: payload };
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await User.findById(userId).select('+password');
        if (!user) throw ApiError.notFound('User not found');

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        return { message: 'Password changed successfully' };
    }

    async getProfile(userId: string) {
        const user = await User.findById(userId);
        if (!user) throw ApiError.notFound('User not found');

        // If employee, return enriched profile
        if (user.role !== 'admin') {
            const employee = await Employee.findOne({ userId: user._id });
            return { user, employee };
        }

        return { user };
    }
}

export default new AuthService();
