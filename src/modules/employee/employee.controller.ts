import { Request, Response } from 'express';
import EmployeeService from './employee.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    const result = await EmployeeService.getProfile(req.user!.userId);
    res.json({ success: true, data: result });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const result = await EmployeeService.updateProfile(req.user!.userId, req.body);
    res.json({ success: true, data: result });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const result = await EmployeeService.changePassword(req.user!.userId, currentPassword, newPassword);
    res.json({ success: true, data: result });
});

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const result = await EmployeeService.getDashboard(req.user!.userId);
    res.json({ success: true, data: result });
});
