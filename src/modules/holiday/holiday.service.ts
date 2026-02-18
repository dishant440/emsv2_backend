import Holiday from '../../models/Holiday';
import { ApiError } from '../../utils/ApiError';

class HolidayService {
    async getAll(year?: number) {
        const query: Record<string, any> = {};
        if (year) query.year = year;
        return Holiday.find(query).sort({ date: 1 }).lean();
    }

    async create(data: { name: string; date: string; year: number; description?: string }) {
        return Holiday.create(data);
    }

    async update(id: string, data: Record<string, any>) {
        const holiday = await Holiday.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        if (!holiday) throw ApiError.notFound('Holiday not found');
        return holiday;
    }

    async delete(id: string) {
        const holiday = await Holiday.findByIdAndDelete(id);
        if (!holiday) throw ApiError.notFound('Holiday not found');
        return { message: 'Holiday deleted successfully' };
    }
}

export default new HolidayService();
