import mongoose, { Document, Schema } from 'mongoose';

export interface INotice extends Document {
  title: string;
  category: 'Examination' | 'Admission' | 'Scholarship' | 'T&P' | 'Hostel' | 'General';
  department: string;
  publishedDate: Date;
  content: string;
  isImportant: boolean;
  referenceNo: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['Examination', 'Admission', 'Scholarship', 'T&P', 'Hostel', 'General'],
      default: 'General',
    },
    department: { type: String, default: 'All Departments' },
    publishedDate: { type: Date, default: Date.now },
    content: { type: String, required: true },
    isImportant: { type: Boolean, default: false },
    referenceNo: { type: String, default: 'PCCOE/CIRCULAR/2026' },
  },
  { timestamps: true }
);

export const Notice = mongoose.model<INotice>('Notice', NoticeSchema);
