import mongoose, { Document, Schema } from 'mongoose';

export interface IFaculty extends Document {
  name: string;
  department: string;
  designation: string;
  qualification: string;
  email: string;
  phone?: string;
  specialization: string[];
  experienceYears: number;
  cabinLocation: string;
  researchArea?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FacultySchema = new Schema<IFaculty>(
  {
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    qualification: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    specialization: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    cabinLocation: { type: String, default: 'Department Faculty Wing' },
    researchArea: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Faculty = mongoose.model<IFaculty>('Faculty', FacultySchema);
