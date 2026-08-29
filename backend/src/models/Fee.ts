import mongoose, { Document, Schema } from 'mongoose';

export interface IFee extends Document {
  courseName: string;
  degreeType: 'B.Tech' | 'M.Tech' | 'MCA' | 'Ph.D' | 'B.Voc';
  academicYear: string;
  category: 'Open' | 'OBC' | 'EBC/EWS' | 'SC/ST/VJNT/SBC' | 'TFWS' | 'NRI/OCI/PIO';
  tuitionFee: number;
  developmentFee: number;
  otherFees: number;
  totalFeeAnnual: number;
  scholarshipWaiverDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeeSchema = new Schema<IFee>(
  {
    courseName: { type: String, required: true, trim: true },
    degreeType: {
      type: String,
      enum: ['B.Tech', 'M.Tech', 'MCA', 'Ph.D', 'B.Voc'],
      default: 'B.Tech',
    },
    academicYear: { type: String, default: '2026-2027' },
    category: {
      type: String,
      enum: ['Open', 'OBC', 'EBC/EWS', 'SC/ST/VJNT/SBC', 'TFWS', 'NRI/OCI/PIO'],
      required: true,
    },
    tuitionFee: { type: Number, required: true },
    developmentFee: { type: Number, required: true },
    otherFees: { type: Number, default: 0 },
    totalFeeAnnual: { type: Number, required: true },
    scholarshipWaiverDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Fee = mongoose.model<IFee>('Fee', FeeSchema);
