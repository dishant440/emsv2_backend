import Attendance from '../../models/Attendance';
import Employee from '../../models/Employee';
import { ApiError } from '../../utils/ApiError';

class AttendanceService {
    async getByEmployee(userId: string, month?: number, year?: number) {
        const employee = await Employee.findOne({ userId });
        if (!employee) throw ApiError.notFound('Employee not found');

        const query: Record<string, any> = { employeeId: employee._id };
        if (month && year) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59);
            query.date = { $gte: start, $lte: end };
        }

        return Attendance.find(query).sort({ date: -1 }).lean();
    }

    async markAttendance(data: Record<string, any>) {
        return Attendance.create(data);
    }

    async getAll(date?: string) {
        const query: Record<string, any> = {};
        if (date) {
            const d = new Date(date);
            const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
            query.date = { $gte: start, $lte: end };
        }
        return Attendance.find(query)
            .populate('employeeId', 'name employeeId department')
            .sort({ date: -1 })
            .lean();
    }
}

export default new AttendanceService();
