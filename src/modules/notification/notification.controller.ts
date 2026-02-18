import { Request, Response } from 'express';
import NotificationService from './notification.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const result = await NotificationService.getByUser(req.user!.userId);
    res.json({ success: true, data: result });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const result = await NotificationService.markAsRead(req.params.id as string, req.user!.userId);
    res.json({ success: true, data: result });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
    const result = await NotificationService.markAllRead(req.user!.userId);
    res.json({ success: true, data: result });
});
