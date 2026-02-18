import AuditLog from '../../models/AuditLog';
import { IAuditLogEntry } from '../../types/policy';
import { logger } from '../../config/logger';

/**
 * Fire-and-forget audit logging service.
 * Never blocks the request pipeline.
 */
class AuditService {
    /** Log an access decision asynchronously */
    log(entry: IAuditLogEntry): void {
        setImmediate(async () => {
            try {
                await AuditLog.create({
                    ...entry,
                    timestamp: new Date(),
                });
            } catch (err) {
                logger.error('AuditService: failed to write audit log', { error: err, entry });
            }
        });
    }

    /** Query audit trail for a specific user */
    async getByUser(userId: string, limit = 50, offset = 0) {
        return AuditLog.find({ subjectId: userId })
            .sort({ timestamp: -1 })
            .skip(offset)
            .limit(limit)
            .lean();
    }

    /** Query all denied access attempts */
    async getDenials(since?: Date, limit = 100) {
        const query: Record<string, any> = { decision: 'deny' };
        if (since) query.timestamp = { $gte: since };
        return AuditLog.find(query).sort({ timestamp: -1 }).limit(limit).lean();
    }
}

export default new AuditService();
