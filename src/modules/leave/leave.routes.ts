import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../access-control';
import * as leaveController from './leave.controller';
import LeaveRequest from '../../models/LeaveRequest';

const router = Router();

// Employee: apply for leave
router.post(
    '/',
    authenticate,
    authorize('leave_request', 'create'),
    leaveController.applyLeave
);

// Employee: view own leave requests
router.get(
    '/my',
    authenticate,
    authorize('leave_request', 'list'),
    leaveController.getMyLeaveRequests
);

// Admin: view all leave requests
router.get(
    '/',
    authenticate,
    authorize('leave_request', 'list'),
    leaveController.getAllLeaveRequests
);

// Admin: approve/reject leave
router.put(
    '/:id',
    authenticate,
    authorize('leave_request', 'approve', {
        resourceLoader: async (req) => {
            const leave = await LeaveRequest.findById(req.params.id)
                .populate('employeeId', 'name employeeId department')
                .lean();
            return leave
                ? { ...leave, employee: (leave as any).employeeId }
                : null;
        },
    }),
    leaveController.reviewLeave
);

export default router;
