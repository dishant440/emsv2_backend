import mongoose, { Schema, Document, Types } from 'mongoose';
import { LEAVE_TYPES, LEAVE_STATUSES, LeaveType, LeaveStatus } from '../types/models';

export interface ILeaveRequest extends Document {
    employeeId: Types.ObjectId;
    leaveType: LeaveType;
    leaveReasonType?: string;
    fromDate: Date;
    toDate: Date;
    fromTime?: string;
    toTime?: string;
    days: number;
    reason: string;
    siteVisitNote?: string;
    status: LeaveStatus;
    appliedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: Types.ObjectId;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
    {
        employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
        leaveType: { type: String, enum: LEAVE_TYPES, required: true },
        leaveReasonType: { type: String, default: '' },
        fromDate: { type: Date, required: true },
        toDate: { type: Date, required: true },
        fromTime: { type: String },
        toTime: { type: String },
        days: { type: Number, required: true, min: 0.5 },
        reason: { type: String, required: true },
        siteVisitNote: { type: String, default: '' },
        status: { type: String, enum: LEAVE_STATUSES, default: 'Pending' },
        appliedAt: { type: Date, default: Date.now },
        reviewedAt: { type: Date },
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

leaveRequestSchema.index({ employeeId: 1, status: 1 });
leaveRequestSchema.index({ status: 1, appliedAt: -1 });

export default mongoose.model<ILeaveRequest>('LeaveRequest', leaveRequestSchema);
