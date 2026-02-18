/** Types for the PBAC engine */

export type PolicyEffect = 'allow' | 'deny';

export type ConditionOperator =
    | 'equals'
    | 'not_equals'
    | 'less_than'
    | 'greater_than'
    | 'less_than_or_equal'
    | 'greater_than_or_equal'
    | 'in'
    | 'not_in'
    | 'within_period';

export type ConditionType =
    | 'ownership'
    | 'department_match'
    | 'threshold'
    | 'time_window'
    | 'probation_check'
    | 'date_range'
    | 'custom';

export interface IPolicyCondition {
    type: ConditionType;
    field?: string;
    operator?: ConditionOperator;
    value?: any;
    valueSource?: string;       // Dynamic path e.g. 'subject.employeeId'
    subjectField?: string;      // For comparison conditions
    resourceField?: string;     // For comparison conditions
    handler?: string;           // For custom condition type
}

export interface IPolicySubject {
    roles: string[];
    departments?: string[];
}

export interface IPolicyDocument {
    _id: any;
    name: string;
    description: string;
    effect: PolicyEffect;
    priority: number;
    subject: IPolicySubject;
    resource: string;
    actions: string[];
    conditions: IPolicyCondition[];
    isActive: boolean;
    version: number;
    validFrom: Date | null;
    validUntil: Date | null;
    createdBy?: any;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IEvaluationContext {
    ipAddress?: string;
    userAgent?: string;
    resourceId?: string;
    resourceData?: Record<string, any> | null;
}

export interface IEvaluationDecision {
    allowed: boolean;
    policy: IPolicyDocument | null;
    reason: string;
}

export interface IAuditLogEntry {
    subjectId: string;
    subjectRole: string;
    resource: string;
    action: string;
    decision: PolicyEffect;
    policyId?: any;
    policyName: string;
    context?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

/** Handler function type for pluggable conditions */
export type ConditionHandler = (
    condition: IPolicyCondition,
    subject: Record<string, any>,
    context: IEvaluationContext
) => boolean | Promise<boolean>;
