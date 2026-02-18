import { Types } from 'mongoose';

/** JWT payload stored in the token and decoded into req.user */
export interface IUserPayload {
    userId: string;
    role: string;
    email: string;
}

/** Subject built for policy evaluation — enriched from DB */
export interface ISubject {
    userId: string;
    role: string;
    email?: string;
    employeeId?: Types.ObjectId;
    department?: string;
    dateOfJoining?: Date;
}

/** Departments enum */
export const DEPARTMENTS = [
    'HR',
    'IT',
    'SALES',
    'FINANCE',
    'MARKETING',
    'OPERATIONS',
    'SUPPORT',
    'RESEARCH AND DEVELOPMENT',
    'PRODUCTION',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

/** Leave types */
export const LEAVE_TYPES = ['Casual', 'Sick', 'Earned', 'Compensatory', 'Other'] as const;
export type LeaveType = (typeof LEAVE_TYPES)[number];

/** Leave statuses */
export const LEAVE_STATUSES = ['Pending', 'Approved', 'Rejected'] as const;
export type LeaveStatus = (typeof LEAVE_STATUSES)[number];

/** User roles — extensible for future Manager, HR, Team Lead */
export const USER_ROLES = ['admin', 'employee', 'manager', 'hr', 'team_lead'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** ── Leave Policy Enums ── */

export const LEAVE_POLICY_TYPES = ['ACCRUAL', 'ENCASHMENT', 'CARRY_FORWARD', 'RESTRICTION'] as const;
export type LeavePolicyType = (typeof LEAVE_POLICY_TYPES)[number];

export const ACCRUAL_FREQUENCIES = ['MONTHLY', 'QUARTERLY', 'YEARLY', 'ON_JOINING'] as const;
export type AccrualFrequency = (typeof ACCRUAL_FREQUENCIES)[number];

export const CARRY_FORWARD_MODES = ['UNLIMITED', 'CAPPED', 'NONE'] as const;
export type CarryForwardMode = (typeof CARRY_FORWARD_MODES)[number];

export const ROUNDING_MODES = ['FLOOR', 'CEIL', 'NEAREST'] as const;
export type RoundingMode = (typeof ROUNDING_MODES)[number];
