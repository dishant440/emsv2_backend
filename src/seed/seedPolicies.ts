import Policy from '../models/Policy';
import { logger } from '../config/logger';

const initialPolicies = [
    // ── Admin: Full Access ──
    {
        name: 'admin_full_employee_access',
        description: 'Admins can perform all operations on employee records',
        effect: 'allow', priority: 100,
        subject: { roles: ['admin'] },
        resource: 'employee',
        actions: ['create', 'read', 'update', 'delete', 'list'],
        conditions: [], isActive: true, version: 1,
    },
    {
        name: 'admin_full_leave_access',
        description: 'Admins can view and manage all leave requests',
        effect: 'allow', priority: 100,
        subject: { roles: ['admin'] },
        resource: 'leave_request',
        actions: ['read', 'list', 'approve', 'reject', 'create'],
        conditions: [], isActive: true, version: 1,
    },
    {
        name: 'admin_manage_holidays',
        description: 'Admins can manage holidays',
        effect: 'allow', priority: 100,
        subject: { roles: ['admin'] },
        resource: 'holiday',
        actions: ['create', 'read', 'update', 'delete', 'list'],
        conditions: [], isActive: true, version: 1,
    },
    {
        name: 'admin_manage_attendance',
        description: 'Admins can manage attendance records',
        effect: 'allow', priority: 100,
        subject: { roles: ['admin'] },
        resource: 'attendance',
        actions: ['create', 'read', 'update', 'delete', 'list'],
        conditions: [], isActive: true, version: 1,
    },
    {
        name: 'admin_view_dashboard',
        description: 'Admins can view the admin dashboard',
        effect: 'allow', priority: 100,
        subject: { roles: ['admin'] },
        resource: 'dashboard',
        actions: ['read'],
        conditions: [], isActive: true, version: 1,
    },

    // ── Employee: Own Data Only ──
    {
        name: 'employee_view_own_profile',
        description: 'Employees can view and update their own profile',
        effect: 'allow', priority: 10,
        subject: { roles: ['employee'] },
        resource: 'employee',
        actions: ['read', 'update'],
        conditions: [],
        isActive: true, version: 1,
    },
    {
        name: 'employee_apply_leave',
        description: 'Employees can create leave requests',
        effect: 'allow', priority: 10,
        subject: { roles: ['employee'] },
        resource: 'leave_request',
        actions: ['create'],
        conditions: [], isActive: true, version: 1,
    },
    {
        name: 'employee_view_own_leaves',
        description: 'Employees can view their own leave records',
        effect: 'allow', priority: 10,
        subject: { roles: ['employee'] },
        resource: 'leave_request',
        actions: ['read', 'list'],
        conditions: [],
        isActive: true, version: 1,
    },
    {
        name: 'employee_view_own_attendance',
        description: 'Employees can view their own attendance',
        effect: 'allow', priority: 10,
        subject: { roles: ['employee'] },
        resource: 'attendance',
        actions: ['read'],
        conditions: [],
        isActive: true, version: 1,
    },
    {
        name: 'employee_view_dashboard',
        description: 'Employees can view their personal dashboard',
        effect: 'allow', priority: 10,
        subject: { roles: ['employee'] },
        resource: 'dashboard',
        actions: ['read'],
        conditions: [], isActive: true, version: 1,
    },

    // ── Everyone: Read Holidays ──
    {
        name: 'all_view_holidays',
        description: 'All authenticated users can view holidays',
        effect: 'allow', priority: 5,
        subject: { roles: ['admin', 'employee', 'manager', 'hr', 'team_lead'] },
        resource: 'holiday',
        actions: ['read', 'list'],
        conditions: [], isActive: true, version: 1,
    },

    // ── Future-ready: Manager policies (inactive by default) ──
    {
        name: 'manager_approve_leave_same_dept',
        description: 'Managers can approve leave for employees in their department',
        effect: 'allow', priority: 15,
        subject: { roles: ['manager'] },
        resource: 'leave_request',
        actions: ['approve', 'reject', 'read', 'list'],
        conditions: [
            {
                type: 'department_match',
                subjectField: 'subject.department',
                resourceField: 'resource.employee.department',
                operator: 'equals',
            },
        ],
        isActive: false, version: 1,
    },
    {
        name: 'manager_approve_leave_under_5_days',
        description: 'Managers can only approve leave requests under 5 days',
        effect: 'allow', priority: 14,
        subject: { roles: ['manager'] },
        resource: 'leave_request',
        actions: ['approve'],
        conditions: [
            {
                type: 'threshold',
                field: 'resource.days',
                operator: 'less_than',
                value: 5,
            },
            {
                type: 'department_match',
                subjectField: 'subject.department',
                resourceField: 'resource.employee.department',
                operator: 'equals',
            },
        ],
        isActive: false, version: 1,
    },
    {
        name: 'deny_leave_during_probation',
        description: 'Employees cannot apply for leave during probation period (6 months)',
        effect: 'deny', priority: 200,
        subject: { roles: ['employee'] },
        resource: 'leave_request',
        actions: ['create'],
        conditions: [
            {
                type: 'probation_check',
                field: 'subject.dateOfJoining',
                operator: 'within_period',
                value: 6,
            },
        ],
        isActive: false, version: 1,
    },
];

export async function seedPolicies(): Promise<void> {
    for (const policyData of initialPolicies) {
        const exists = await Policy.findOne({ name: policyData.name });
        if (!exists) {
            await Policy.create(policyData);
            logger.info(`Seeded policy: ${policyData.name} (active: ${policyData.isActive})`);
        }
    }
}
