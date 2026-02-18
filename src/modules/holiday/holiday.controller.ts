import { Request, Response } from 'express';
import HolidayService from './holiday.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const getAll = asyncHandler(async (req: Request, res: Response) => {
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const result = await HolidayService.getAll(year);
    res.json({ success: true, data: result });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
    const result = await HolidayService.create(req.body);
    res.status(201).json({ success: true, data: result });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
    const result = await HolidayService.update(req.params.id as string, req.body);
    res.json({ success: true, data: result });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
    const result = await HolidayService.delete(req.params.id as string);
    res.json({ success: true, data: result });
});
