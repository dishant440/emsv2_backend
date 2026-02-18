import mongoose, { Schema, Document } from 'mongoose';

export interface IHoliday extends Document {
    name: string;
    date: Date;
    year: number;
    description?: string;
}

const holidaySchema = new Schema<IHoliday>(
    {
        name: { type: String, required: true, trim: true },
        date: { type: Date, required: true },
        year: { type: Number, required: true },
        description: { type: String, default: '' },
    },
    { timestamps: true }
);

holidaySchema.index({ year: 1, date: 1 });

export default mongoose.model<IHoliday>('Holiday', holidaySchema);
