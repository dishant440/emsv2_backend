import { Request, Response } from 'express';
import AttendanceService from './attendance.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const getMyAttendance = asyncHandler(async (req: Request, res: Response) => {
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const result = await AttendanceService.getByEmployee(req.user!.userId, month, year);
    res.json({ success: true, data: result });
});

export const markAttendance = asyncHandler(async (req: Request, res: Response) => {
    const result = await AttendanceService.markAttendance(req.body);
    res.status(201).json({ success: true, data: result });
});

export const getAllAttendance = asyncHandler(async (req: Request, res: Response) => {
    const date = req.query.date as string | undefined;
    const result = await AttendanceService.getAll(date);
    res.json({ success: true, data: result });
});
