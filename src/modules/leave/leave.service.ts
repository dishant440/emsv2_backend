import LeaveRequest from '../../models/LeaveRequest';
import Employee from '../../models/Employee';
import { ApiError } from '../../utils/ApiError';

class LeaveService {
    /** Apply for leave */
    async applyLeave(userId: string, data: Record<string, any>) {
        const employee = await Employee.findOne({ userId });
        if (!employee) throw ApiError.notFound('Employee profile not found');

        if (data.days > employee.availableLeaves) {
            throw ApiError.badRequest(
                `Insufficient leave balance. Available: ${employee.availableLeaves}, Requested: ${data.days}`
            );
        }

        const leaveRequest = await LeaveRequest.create({
            employeeId: employee._id,
            leaveType: data.leaveType,
            leaveReasonType: data.leaveReasonType,
            fromDate: data.fromDate,
            toDate: data.toDate,
            fromTime: data.fromTime,
            toTime: data.toTime,
            days: data.days,
            reason: data.reason,
            siteVisitNote: data.siteVisitNote,
        });

        return leaveRequest;
    }

    /** Get leave requests for an employee */
    async getMyLeaveRequests(userId: string) {
        const employee = await Employee.findOne({ userId });
        if (!employee) throw ApiError.notFound('Employee not found');

        return LeaveRequest.find({ employeeId: employee._id })
            .sort({ appliedAt: -1 })
            .lean();
    }

    /** Get all leave requests (admin) */
    async getAllLeaveRequests(status?: string) {
        const query: Record<string, any> = {};
        if (status) query.status = status;

        return LeaveRequest.find(query)
            .populate('employeeId', 'name employeeId department')
            .sort({ appliedAt: -1 })
            .lean();
    }

    /** Approve or reject leave */
    async reviewLeave(leaveId: string, status: 'Approved' | 'Rejected', reviewerId: string) {
        const leave = await LeaveRequest.findById(leaveId);
        if (!leave) throw ApiError.notFound('Leave request not found');
        if (leave.status !== 'Pending') throw ApiError.badRequest('Leave request already reviewed');

        leave.status = status;
        leave.reviewedAt = new Date();
        leave.reviewedBy = reviewerId as any;
        await leave.save();

        // If approved, deduct from available leaves
        if (status === 'Approved') {
            await Employee.findByIdAndUpdate(leave.employeeId, {
                $inc: { availableLeaves: -leave.days },
            });
        }

        return leave;
    }
}

export default new LeaveService();
