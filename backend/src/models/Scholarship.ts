import mongoose, { Document, Schema } from 'mongoose';

export interface IScholarship extends Document {
  schemeName: string;
  category: string;
  portal: string;
  tuitionFeeWaiverPercentage: number;
  examFeeWaiverPercentage: number;
  incomeLimitAnnual: number;
  eligibilityCriteria: string;
  requiredDocuments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ScholarshipSchema = new Schema<IScholarship>(
  {
    schemeName: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    portal: { type: String, default: 'MahaDBT (https://mahadbt.maharashtra.gov.in)' },
    tuitionFeeWaiverPercentage: { type: Number, required: true },
    examFeeWaiverPercentage: { type: Number, default: 0 },
    incomeLimitAnnual: { type: Number, default: 800000 },
    eligibilityCriteria: { type: String, required: true },
    requiredDocuments: [{ type: String }],
  },
  { timestamps: true }
);

export const Scholarship = mongoose.model<IScholarship>('Scholarship', ScholarshipSchema);
