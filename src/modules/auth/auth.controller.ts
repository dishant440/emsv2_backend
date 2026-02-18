import { Request, Response } from 'express';
import AuthService from './auth.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json({ success: true, data: result });
});

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    const result = await AuthService.register(name, email, password, role);
    res.status(201).json({ success: true, data: result });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const result = await AuthService.changePassword(req.user!.userId, currentPassword, newPassword);
    res.json({ success: true, data: result });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.getProfile(req.user!.userId);
    res.json({ success: true, data: result });
});
