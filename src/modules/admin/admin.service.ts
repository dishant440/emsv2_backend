import Employee from '../../models/Employee';
import User from '../../models/User';
import LeaveRequest from '../../models/LeaveRequest';
import bcrypt from 'bcryptjs';
import { ApiError } from '../../utils/ApiError';

class AdminService {
    /** Get all employees */
    async getAllEmployees(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [employees, total] = await Promise.all([
            Employee.find().sort({ employeeId: 1 }).skip(skip).limit(limit).lean(),
            Employee.countDocuments(),
        ]);
        return { employees, total, page, totalPages: Math.ceil(total / limit) };
    }

    /** Get employee by ID */
    async getEmployeeById(id: string) {
        const employee = await Employee.findById(id).lean();
        if (!employee) throw ApiError.notFound('Employee not found');
        return employee;
    }

    /** Create a new employee + user account */
    async createEmployee(data: Record<string, any>) {
        // Generate next employeeId
        const lastEmployee = await Employee.findOne().sort({ employeeId: -1 }).lean();
        const nextId = (lastEmployee?.employeeId || 0) + 1;

        // Create user account
        const hashedPassword = await bcrypt.hash(data.password || '12345', 12);
        const user = await User.create({
            name: data.name,
            email: data.workEmail,
            password: hashedPassword,
            role: 'employee',
        });

        // Create employee record
        const employee = await Employee.create({
            ...data,
            employeeId: nextId,
            userId: user._id,
        });

        return employee;
    }

    /** Update an employee */
    async updateEmployee(employeeId: string, data: Record<string, any>) {
        const employee = await Employee.findByIdAndUpdate(employeeId, data, {
            new: true,
            runValidators: true,
        });
        if (!employee) throw ApiError.notFound('Employee not found');
        return employee;
    }

    /** Delete employee + user account */
    async deleteEmployee(id: string) {
        const employee = await Employee.findById(id);
        if (!employee) throw ApiError.notFound('Employee not found');
        await User.findByIdAndDelete(employee.userId);
        await Employee.findByIdAndDelete(id);
        return { message: 'Employee deleted successfully' };
    }

    /** Admin dashboard stats */
    async getDashboard() {
        const [totalEmployees, pendingLeaves, approvedLeaves, rejectedLeaves] = await Promise.all([
            Employee.countDocuments(),
            LeaveRequest.countDocuments({ status: 'Pending' }),
            LeaveRequest.countDocuments({ status: 'Approved' }),
            LeaveRequest.countDocuments({ status: 'Rejected' }),
        ]);

        return {
            totalEmployees,
            leaveStats: { pending: pendingLeaves, approved: approvedLeaves, rejected: rejectedLeaves },
        };
    }
}

export default new AdminService();
