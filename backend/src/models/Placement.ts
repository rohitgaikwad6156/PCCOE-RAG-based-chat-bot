import mongoose, { Document, Schema } from 'mongoose';

export interface IPlacement extends Document {
  academicYear: string;
  highestPackageLPA: number;
  averagePackageLPA: number;
  totalCompaniesVisited: number;
  totalOffers: number;
  topRecruiters: string[];
  internshipOffersCount: number;
  tpoEmail: string;
  tpoPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlacementSchema = new Schema<IPlacement>(
  {
    academicYear: { type: String, required: true, unique: true },
    highestPackageLPA: { type: Number, required: true },
    averagePackageLPA: { type: Number, required: true },
    totalCompaniesVisited: { type: Number, required: true },
    totalOffers: { type: Number, required: true },
    topRecruiters: [{ type: String }],
    internshipOffersCount: { type: Number, required: true },
    tpoEmail: { type: String, default: 'tpo@pccoepune.org' },
    tpoPhone: { type: String, default: '+91-020-27653168' },
  },
  { timestamps: true }
);

export const Placement = mongoose.model<IPlacement>('Placement', PlacementSchema);
