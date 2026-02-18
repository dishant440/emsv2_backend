import { Request, Response } from 'express';
import LeaveService from './leave.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const applyLeave = asyncHandler(async (req: Request, res: Response) => {
    const result = await LeaveService.applyLeave(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: result });
});

export const getMyLeaveRequests = asyncHandler(async (req: Request, res: Response) => {
    const result = await LeaveService.getMyLeaveRequests(req.user!.userId);
    res.json({ success: true, data: result });
});

export const getAllLeaveRequests = asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    const result = await LeaveService.getAllLeaveRequests(status);
    res.json({ success: true, data: result });
});

export const reviewLeave = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const result = await LeaveService.reviewLeave(req.params.id as string, status, req.user!.userId);
    res.json({ success: true, data: result });
});
