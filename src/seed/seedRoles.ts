import Role from '../models/Role';
import { logger } from '../config/logger';

const systemRoles = [
    { name: 'admin', displayName: 'Administrator', description: 'Full system access', hierarchy: 10, isSystem: true },
    { name: 'employee', displayName: 'Employee', description: 'Standard employee access', hierarchy: 50, isSystem: true },
    { name: 'manager', displayName: 'Manager', description: 'Department manager access', hierarchy: 20, isSystem: false },
    { name: 'hr', displayName: 'Human Resources', description: 'HR department access', hierarchy: 15, isSystem: false },
    { name: 'team_lead', displayName: 'Team Lead', description: 'Team lead access', hierarchy: 30, isSystem: false },
];

export async function seedRoles(): Promise<void> {
    for (const roleData of systemRoles) {
        const exists = await Role.findOne({ name: roleData.name });
        if (!exists) {
            await Role.create(roleData);
            logger.info(`Seeded role: ${roleData.name}`);
        }
    }
}
