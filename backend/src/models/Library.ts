import mongoose, { Document, Schema } from 'mongoose';

export interface ILibrary extends Document {
  libraryName: string;
  location: string;
  workingHoursRegular: string;
  workingHoursExamPeriod: string;
  totalVolumes: number;
  totalTitles: number;
  eJournalSubscriptions: string[];
  librarianName: string;
  librarianEmail: string;
  facilities: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LibrarySchema = new Schema<ILibrary>(
  {
    libraryName: { type: String, default: 'Dr. APJ Abdul Kalam Central Library' },
    location: { type: String, default: 'Central Building, PCCOE Nigdi Campus' },
    workingHoursRegular: { type: String, default: '8:00 AM to 10:00 PM (Monday to Saturday)' },
    workingHoursExamPeriod: { type: String, default: '8:00 AM to 12:00 Midnight' },
    totalVolumes: { type: Number, default: 60000 },
    totalTitles: { type: Number, default: 15000 },
    eJournalSubscriptions: [{ type: String }],
    librarianName: { type: String, default: 'Dr. S. K. Patil' },
    librarianEmail: { type: String, default: 'library@pccoepune.org' },
    facilities: [{ type: String }],
  },
  { timestamps: true }
);

export const Library = mongoose.model<ILibrary>('Library', LibrarySchema);
