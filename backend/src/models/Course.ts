import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  department: string;
  degreeType: 'B.Tech' | 'M.Tech' | 'MCA' | 'Ph.D';
  durationYears: number;
  dteChoiceCode: string;
  intake: number;
  eligibility: string;
  tuitionFeeAnnual: number;
  totalFeeAnnual: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true },
    department: { type: String, required: true },
    degreeType: { type: String, enum: ['B.Tech', 'M.Tech', 'MCA', 'Ph.D'], default: 'B.Tech' },
    durationYears: { type: Number, default: 4 },
    dteChoiceCode: { type: String, required: true },
    intake: { type: Number, required: true },
    eligibility: { type: String, required: true },
    tuitionFeeAnnual: { type: Number, required: true },
    totalFeeAnnual: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
