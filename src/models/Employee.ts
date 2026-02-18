import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { DEPARTMENTS, Department } from '../types/models';

export interface IEmployee extends Document {
    employeeId: number;
    name: string;
    personalEmail?: string;
    workEmail: string;
    dateOfBirth?: Date;
    dateOfJoining: Date;
    allocatedLeaves: number;
    availableLeaves: number;
    department: Department;
    position?: string;
    phone?: string;
    address?: string;
    profilePhoto?: string;
    salary?: number;
    workPassword?: string;
    userId: Types.ObjectId;
}

const employeeSchema = new Schema<IEmployee>(
    {
        employeeId: { type: Number, unique: true },
        name: { type: String, required: true, trim: true },
        personalEmail: { type: String, lowercase: true },
        workEmail: { type: String, unique: true, lowercase: true, required: true },
        dateOfBirth: { type: Date },
        dateOfJoining: { type: Date, default: Date.now },
        allocatedLeaves: { type: Number, default: 20 },
        availableLeaves: { type: Number, default: 20 },
        department: { type: String, enum: DEPARTMENTS, required: true },
        position: { type: String },
        phone: { type: String, trim: true },
        address: { type: String },
        profilePhoto: { type: String },
        salary: { type: Number, min: 0 },
        workPassword: { type: String, select: false },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

employeeSchema.pre('save', async function (next) {
    if (this.isModified('workPassword') && this.workPassword) {
        const salt = await bcrypt.genSalt(10);
        this.workPassword = await bcrypt.hash(this.workPassword, salt);
    }
    next();
});

employeeSchema.index({ userId: 1 });
employeeSchema.index({ department: 1 });

export default mongoose.model<IEmployee>('Employee', employeeSchema);
