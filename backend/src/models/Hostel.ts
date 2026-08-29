import mongoose, { Document, Schema } from 'mongoose';

export interface IHostel extends Document {
  buildingName: string;
  gender: 'Boys' | 'Girls' | 'Co-ed';
  location: string;
  totalCapacity: number;
  doubleRoomFeeAnnual: number;
  tripleRoomFeeAnnual: number;
  messFeeAnnual: number;
  depositRefundable: number;
  curfewTimeWeekday: string;
  curfewTimeWeekend: string;
  wardenName: string;
  wardenContact: string;
  facilities: string[];
  createdAt: Date;
  updatedAt: Date;
}

const HostelSchema = new Schema<IHostel>(
  {
    buildingName: { type: String, required: true, unique: true },
    gender: { type: String, enum: ['Boys', 'Girls', 'Co-ed'], required: true },
    location: { type: String, default: 'Sector 26, Pradhikaran, Nigdi, Pune' },
    totalCapacity: { type: Number, required: true },
    doubleRoomFeeAnnual: { type: Number, required: true },
    tripleRoomFeeAnnual: { type: Number, required: true },
    messFeeAnnual: { type: Number, required: true },
    depositRefundable: { type: Number, default: 5000 },
    curfewTimeWeekday: { type: String, default: '9:30 PM' },
    curfewTimeWeekend: { type: String, default: '10:00 PM' },
    wardenName: { type: String, required: true },
    wardenContact: { type: String, default: '+91-020-27653168' },
    facilities: [{ type: String }],
  },
  { timestamps: true }
);

export const Hostel = mongoose.model<IHostel>('Hostel', HostelSchema);
