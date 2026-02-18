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
