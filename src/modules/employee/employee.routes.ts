import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../access-control';
import * as employeeController from './employee.controller';

const router = Router();

router.get('/profile', authenticate, authorize('employee', 'read'), employeeController.getProfile);
router.put('/profile', authenticate, authorize('employee', 'update'), employeeController.updateProfile);
router.put('/change-password', authenticate, employeeController.changePassword);
router.get('/dashboard', authenticate, authorize('dashboard', 'read'), employeeController.getDashboard);

export default router;
