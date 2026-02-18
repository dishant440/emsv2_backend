import mongoose, { Schema, Document } from 'mongoose';
import { USER_ROLES, UserRole } from '../types/models';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    otp?: string;
    otpExpires?: Date;
    resetPasswordOtp?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: USER_ROLES, default: 'employee' },
        otp: { type: String },
        otpExpires: { type: Date },
        resetPasswordOtp: { type: String },
        resetPasswordExpires: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
