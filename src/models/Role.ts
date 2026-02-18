import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
    name: string;
    displayName: string;
    description?: string;
    hierarchy: number;
    isActive: boolean;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
    {
        name: { type: String, required: true, unique: true, lowercase: true, trim: true },
        displayName: { type: String, required: true },
        description: { type: String, default: '' },
        hierarchy: { type: Number, required: true },
        isActive: { type: Boolean, default: true },
        isSystem: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model<IRole>('Role', roleSchema);
