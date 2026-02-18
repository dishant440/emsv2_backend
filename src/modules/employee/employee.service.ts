import Employee from '../../models/Employee';
import User from '../../models/User';
import bcrypt from 'bcryptjs';
import { ApiError } from '../../utils/ApiError';

class EmployeeService {
    /** Get employee profile by userId */
    async getProfile(userId: string) {
        const employee = await Employee.findOne({ userId }).lean();
        if (!employee) throw ApiError.notFound('Employee profile not found');
        return employee;
    }

    /** Update own profile (limited fields) */
    async updateProfile(userId: string, data: Record<string, any>) {
        const allowedFields = ['phone', 'address', 'personalEmail', 'profilePhoto'];
        const updateData: Record<string, any> = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) updateData[field] = data[field];
        }

        const employee = await Employee.findOneAndUpdate({ userId }, updateData, {
            new: true,
            runValidators: true,
        });
        if (!employee) throw ApiError.notFound('Employee profile not found');
        return employee;
    }

    /** Change password */
    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await User.findById(userId).select('+password');
        if (!user) throw ApiError.notFound('User not found');

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();
        return { message: 'Password changed successfully' };
    }

    /** Employee dashboard */
    async getDashboard(userId: string) {
        const employee = await Employee.findOne({ userId }).lean();
        if (!employee) throw ApiError.notFound('Employee not found');

        const LeaveRequest = (await import('../../models/LeaveRequest')).default;
        const [pending, approved, rejected] = await Promise.all([
            LeaveRequest.countDocuments({ employeeId: employee._id, status: 'Pending' }),
            LeaveRequest.countDocuments({ employeeId: employee._id, status: 'Approved' }),
            LeaveRequest.countDocuments({ employeeId: employee._id, status: 'Rejected' }),
        ]);

        return {
            employee,
            leaveStats: { pending, approved, rejected },
            availableLeaves: employee.availableLeaves,
            allocatedLeaves: employee.allocatedLeaves,
        };
    }
}

export default new EmployeeService();
