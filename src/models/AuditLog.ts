import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    subjectId: mongoose.Types.ObjectId;
    subjectRole: string;
    resource: string;
    action: string;
    decision: 'allow' | 'deny';
    policyId?: mongoose.Types.ObjectId;
    policyName: string;
    context?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
    subjectId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectRole: { type: String, required: true },
    resource: { type: String, required: true },
    action: { type: String, required: true },
    decision: { type: String, required: true, enum: ['allow', 'deny'] },
    policyId: { type: Schema.Types.ObjectId, ref: 'Policy' },
    policyName: { type: String, required: true },
    context: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
});

// Auto-expire after 90 days
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
auditLogSchema.index({ subjectId: 1, timestamp: -1 });

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
