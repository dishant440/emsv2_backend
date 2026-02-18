import mongoose, { Schema, Document } from 'mongoose';
import { IPolicyCondition, PolicyEffect } from '../types/policy';

export interface IPolicy extends Document {
    name: string;
    description: string;
    effect: PolicyEffect;
    priority: number;
    subject: {
        roles: string[];
        departments?: string[];
    };
    resource: string;
    actions: string[];
    conditions: IPolicyCondition[];
    isActive: boolean;
    version: number;
    validFrom: Date | null;
    validUntil: Date | null;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const conditionSchema = new Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ['ownership', 'department_match', 'threshold', 'time_window', 'probation_check', 'date_range', 'custom'],
        },
        field: { type: String },
        operator: {
            type: String,
            enum: [
                'equals', 'not_equals', 'less_than', 'greater_than',
                'less_than_or_equal', 'greater_than_or_equal', 'within_period', 'in', 'not_in',
            ],
        },
        value: { type: Schema.Types.Mixed },
        valueSource: { type: String },
        subjectField: { type: String },
        resourceField: { type: String },
        handler: { type: String },
    },
    { _id: false }
);

const policySchema = new Schema<IPolicy>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        description: { type: String, default: '' },
        effect: { type: String, required: true, enum: ['allow', 'deny'] },
        priority: { type: Number, required: true, default: 0 },
        subject: {
            roles: [{ type: String }],
            departments: [{ type: String }],
        },
        resource: { type: String, required: true },
        actions: [{ type: String, required: true }],
        conditions: [conditionSchema],
        isActive: { type: Boolean, default: true },
        version: { type: Number, default: 1 },
        validFrom: { type: Date, default: null },
        validUntil: { type: Date, default: null },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

policySchema.index({ resource: 1, isActive: 1, priority: -1 });
policySchema.index({ 'subject.roles': 1, resource: 1 });

export default mongoose.model<IPolicy>('Policy', policySchema);
