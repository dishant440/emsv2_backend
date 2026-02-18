import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../access-control';
import * as adminController from './admin.controller';

const router = Router();

// All admin routes require authentication + policy authorization
router.get('/employees', authenticate, authorize('employee', 'list'), adminController.getAllEmployees);
router.get('/employees/:id', authenticate, authorize('employee', 'read'), adminController.getEmployeeById);
router.post('/employees', authenticate, authorize('employee', 'create'), adminController.createEmployee);
router.put('/employees/:id', authenticate, authorize('employee', 'update'), adminController.updateEmployee);
router.delete('/employees/:id', authenticate, authorize('employee', 'delete'), adminController.deleteEmployee);
router.get('/dashboard', authenticate, authorize('dashboard', 'read'), adminController.getDashboard);

export default router;
