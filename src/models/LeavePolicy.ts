import mongoose, { Schema, Document, Types } from 'mongoose';
import {
    LEAVE_POLICY_TYPES, LeavePolicyType,
    ACCRUAL_FREQUENCIES, AccrualFrequency,
    CARRY_FORWARD_MODES, CarryForwardMode,
    ROUNDING_MODES, RoundingMode,
    LEAVE_TYPES,
    USER_ROLES,
    DEPARTMENTS,
} from '../types/models';

// ── Interfaces ──

export interface IAccrualConfig {
    rate: number;
    frequency: AccrualFrequency;
    roundingMode: RoundingMode;
    proRataOnJoining: boolean;
}

export interface ICarryForwardConfig {
    enabled: boolean;
    mode: CarryForwardMode;
    maxDays?: number;
    expiryMonths?: number;
}

export interface ICapsConfig {
    maxAccrualPerYear?: number;
    maxBalance?: number;
}

export interface IPolicyScope {
    leaveTypes: string[];
    roles: string[];
    departments: string[];
    minTenureDays?: number;
}

export interface ILeavePolicy extends Document {
    policyCode: string;
    policyType: LeavePolicyType;
    name: string;
    description: string;
    scope: IPolicyScope;
    accrual: IAccrualConfig;
    carryForward: ICarryForwardConfig;
    caps: ICapsConfig;
    version: number;
    isActive: boolean;
    effectiveFrom: Date;
    effectiveUntil: Date | null;
    supersededBy: Types.ObjectId | null;
    createdBy: Types.ObjectId | null;
    changelog: string;
    createdAt: Date;
    updatedAt: Date;
}

// ── Sub-schemas ──

const accrualSchema = new Schema(
    {
        rate: { type: Number, required: true, min: 0 },
        frequency: { type: String, enum: ACCRUAL_FREQUENCIES, required: true },
        roundingMode: { type: String, enum: ROUNDING_MODES, default: 'FLOOR' },
        proRataOnJoining: { type: Boolean, default: false },
    },
    { _id: false }
);

const carryForwardSchema = new Schema(
    {
        enabled: { type: Boolean, default: true },
        mode: { type: String, enum: CARRY_FORWARD_MODES, default: 'UNLIMITED' },
        maxDays: { type: Number, min: 0, default: null },
        expiryMonths: { type: Number, min: 0, default: null },
    },
    { _id: false }
);

const capsSchema = new Schema(
    {
        maxAccrualPerYear: { type: Number, min: 0, default: null },
        maxBalance: { type: Number, min: 0, default: null },
    },
    { _id: false }
);

const scopeSchema = new Schema(
    {
        leaveTypes: [{ type: String, enum: LEAVE_TYPES }],
        roles: [{ type: String, enum: USER_ROLES }],
        departments: [{ type: String, enum: DEPARTMENTS }],
        minTenureDays: { type: Number, min: 0, default: null },
    },
    { _id: false }
);

// ── Main Schema ──

const leavePolicySchema = new Schema<ILeavePolicy>(
    {
        policyCode: { type: String, required: true, trim: true, uppercase: true },
        policyType: { type: String, enum: LEAVE_POLICY_TYPES, required: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, default: '' },

        scope: { type: scopeSchema, required: true },
        accrual: { type: accrualSchema, required: true },
        carryForward: { type: carryForwardSchema, required: true },
        caps: { type: capsSchema, default: () => ({}) },

        version: { type: Number, required: true, default: 1, min: 1 },
        isActive: { type: Boolean, default: true },
        effectiveFrom: { type: Date, required: true },
        effectiveUntil: { type: Date, default: null },
        supersededBy: { type: Schema.Types.ObjectId, ref: 'LeavePolicy', default: null },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        changelog: { type: String, default: 'Initial version' },
    },
    { timestamps: true }
);

// ── Indexes ──

// Fast lookup: find the active version of a specific policy
leavePolicySchema.index({ policyCode: 1, version: -1 }, { unique: true });

// Query all active policies of a given type
leavePolicySchema.index({ policyType: 1, isActive: 1 });

// Leave-type-specific lookups (e.g., "what accrual rules apply to Earned leaves?")
leavePolicySchema.index({ 'scope.leaveTypes': 1, isActive: 1 });

export default mongoose.model<ILeavePolicy>('LeavePolicy', leavePolicySchema);
