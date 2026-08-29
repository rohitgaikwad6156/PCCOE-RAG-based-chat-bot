import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IConversation extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  title: string;
  departmentFilter?: string;
  collectionFilter?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New College Inquiry',
      trim: true,
    },
    departmentFilter: {
      type: String,
      default: 'All Departments',
    },
    collectionFilter: {
      type: String,
      default: 'All Collections',
    },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
