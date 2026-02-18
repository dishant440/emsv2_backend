import bcrypt from 'bcryptjs';
import User from '../models/User';
import Employee from '../models/Employee';
import { logger } from '../config/logger';

export async function seedAdmin(): Promise<void> {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('12345', 12);
        await User.create({
            name: 'Admin',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'admin',
        });
        logger.info('Default admin created — email: admin@test.com, password: 12345');
    }
}

export async function seedEmployee(): Promise<void> {
    const empExists = await User.findOne({ role: 'employee' });
    if (!empExists) {
        const hashedPassword = await bcrypt.hash('12345', 12);
        const user = await User.create({
            name: 'Test Employee',
            email: 'employee@test.com',
            password: hashedPassword,
            role: 'employee',
        });

        await Employee.create({
            employeeId: 1,
            name: 'Test Employee',
            personalEmail: 'employee@personal.com',
            workEmail: 'employee@test.com',
            department: 'IT',
            position: 'Software Developer',
            dateOfJoining: new Date(),
            allocatedLeaves: 20,
            availableLeaves: 20,
            salary: 50000,
            userId: user._id,
        });
        logger.info('Default employee created — email: employee@test.com, password: 12345');
    }
}
