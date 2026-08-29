import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface ICollection extends MongooseDocument {
  name: string;
  description?: string;
  department: string;
  icon?: string;
  documentCount: number;
  createdAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: 'All Departments',
    },
    icon: {
      type: String,
      default: 'folder',
    },
    documentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Collection = mongoose.model<ICollection>('Collection', CollectionSchema);
