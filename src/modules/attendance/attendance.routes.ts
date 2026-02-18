import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../access-control';
import * as attendanceController from './attendance.controller';

const router = Router();

router.get('/my', authenticate, authorize('attendance', 'read'), attendanceController.getMyAttendance);
router.get('/', authenticate, authorize('attendance', 'list'), attendanceController.getAllAttendance);
router.post('/', authenticate, authorize('attendance', 'create'), attendanceController.markAttendance);

export default router;
