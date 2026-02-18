import LeavePolicy from '../models/LeavePolicy';
import { logger } from '../config/logger';

const initialLeavePolicies = [
    {
        policyCode: 'EARNED_LEAVE_MONTHLY_ACCRUAL',
        policyType: 'ACCRUAL',
        name: 'Earned Leave Monthly Accrual',
        description:
            'Every employee earns 1.5 earned leaves per month. Unused leaves are carried forward without cap. ' +
            'Accrual runs on a monthly schedule.',
        scope: {
            leaveTypes: ['Earned'],
            roles: [],       // empty = applies to all roles
            departments: [], // empty = applies to all departments
        },
        accrual: {
            rate: 1.5,
            frequency: 'MONTHLY',
            roundingMode: 'FLOOR',
            proRataOnJoining: false,
        },
        carryForward: {
            enabled: true,
            mode: 'UNLIMITED',
        },
        caps: {},
        version: 1,
        isActive: true,
        effectiveFrom: new Date('2025-01-01'),
        changelog: 'Initial policy — 1.5 earned leaves per month with unlimited carry forward',
    },
];

export async function seedLeavePolicies(): Promise<void> {
    for (const policyData of initialLeavePolicies) {
        const exists = await LeavePolicy.findOne({
            policyCode: policyData.policyCode,
            version: policyData.version,
        });
        if (!exists) {
            await LeavePolicy.create(policyData);
            logger.info(`Seeded leave policy: ${policyData.name} (v${policyData.version})`);
        }
    }
}
