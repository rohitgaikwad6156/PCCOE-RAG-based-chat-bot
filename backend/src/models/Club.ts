import mongoose, { Document, Schema } from 'mongoose';

export interface IClub extends Document {
  name: string;
  shortCode: string;
  department: string;
  category: 'Technical' | 'Cultural' | 'Motorsports' | 'Robotics' | 'Social' | 'Sports';
  description: string;
  flagshipEvent: string;
  activities: string[];
  facultyCoordinator: string;
  studentPresident: string;
  contactEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClubSchema = new Schema<IClub>(
  {
    name: { type: String, required: true, unique: true },
    shortCode: { type: String, required: true, uppercase: true },
    department: { type: String, required: true },
    category: {
      type: String,
      enum: ['Technical', 'Cultural', 'Motorsports', 'Robotics', 'Social', 'Sports'],
      default: 'Technical',
    },
    description: { type: String, required: true },
    flagshipEvent: { type: String, required: true },
    activities: [{ type: String }],
    facultyCoordinator: { type: String, required: true },
    studentPresident: { type: String, required: true },
    contactEmail: { type: String, default: 'clubs@pccoe.org' },
  },
  { timestamps: true }
);

export const Club = mongoose.model<IClub>('Club', ClubSchema);
