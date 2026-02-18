import { Request, Response } from 'express';
import AdminService from './admin.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const getAllEmployees = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await AdminService.getAllEmployees(page, limit);
    res.json({ success: true, data: result });
});

export const getEmployeeById = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminService.getEmployeeById(req.params.id    as string);
    res.json({ success: true, data: result });
});

export const createEmployee = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminService.createEmployee(req.body);
    res.status(201).json({ success: true, data: result });
});

export const updateEmployee = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminService.updateEmployee(req.params.id as string, req.body);
    res.json({ success: true, data: result });
});

export const deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
    const result = await AdminService.deleteEmployee(req.params.id as string);
    res.json({ success: true, data: result });
});

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
    const result = await AdminService.getDashboard();
    res.json({ success: true, data: result });
});
