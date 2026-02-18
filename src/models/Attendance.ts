import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAttendance extends Document {
    employeeId: Types.ObjectId;
    date: Date;
    status: 'Present' | 'Absent' | 'Half Day' | 'On Leave' | 'Holiday';
    checkIn?: string;
    checkOut?: string;
    workingHours?: number;
    notes?: string;
}

const attendanceSchema = new Schema<IAttendance>(
    {
        employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
        date: { type: Date, required: true },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Half Day', 'On Leave', 'Holiday'],
            default: 'Present',
        },
        checkIn: { type: String },
        checkOut: { type: String },
        workingHours: { type: Number },
        notes: { type: String },
    },
    { timestamps: true }
);

attendanceSchema.index({ employeeId: 1, date: -1 });
attendanceSchema.index({ date: 1 });

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);
