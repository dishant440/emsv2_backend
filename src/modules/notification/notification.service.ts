import Notification from '../../models/Notification';
import { ApiError } from '../../utils/ApiError';

class NotificationService {
    async getByUser(userId: string) {
        return Notification.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
    }

    async markAsRead(notificationId: string, userId: string) {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { read: true },
            { new: true }
        );
        if (!notification) throw ApiError.notFound('Notification not found');
        return notification;
    }

    async markAllRead(userId: string) {
        await Notification.updateMany({ userId, read: false }, { read: true });
        return { message: 'All notifications marked as read' };
    }

    /** Create a notification (called from other services) */
    async create(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
        return Notification.create({ userId, title, message, type });
    }
}

export default new NotificationService();
