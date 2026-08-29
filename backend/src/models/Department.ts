import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  hodName: string;
  hodEmail: string;
  hodPhone: string;
  description: string;
  intake: number;
  establishedYear: number;
  laboratories: string[];
  clubs: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, uppercase: true },
    hodName: { type: String, required: true },
    hodEmail: { type: String, required: true },
    hodPhone: { type: String, default: '+91-020-27653168' },
    description: { type: String, required: true },
    intake: { type: Number, required: true },
    establishedYear: { type: Number, default: 1999 },
    laboratories: [{ type: String }],
    clubs: [{ type: String }],
  },
  { timestamps: true }
);

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
