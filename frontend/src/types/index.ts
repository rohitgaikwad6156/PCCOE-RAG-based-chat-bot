export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  department: string;
  avatar?: string;
  authProvider?: 'local' | 'google';
}

export interface SourceRef {
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  relevanceScore: number;
  relevanceLabel: 'High' | 'Medium' | 'Low';
  snippet: string;
}

export interface MessageItem {
  _id?: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: SourceRef[];
  isGrounded?: boolean;
  confidenceScore?: number;
  confidenceLabel?: 'High' | 'Medium' | 'Low';
  language?: string;
  createdAt: string;
}

export interface ConversationItem {
  _id: string;
  title: string;
  userId: string;
  departmentFilter?: string;
  collectionFilter?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  _id: string;
  title: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  department: string;
  collectionName: string;
  version: number;
  status: 'uploaded' | 'processing' | 'processed' | 'failed' | 'archived';
  processingProgress: number;
  processingStage?: string;
  errorMessage?: string;
  chunkCount: number;
  pageCount: number;
  uploadedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  _id: string;
  name: string;
  description?: string;
  department: string;
  icon?: string;
  documentCount?: number;
  createdAt: string;
}

export interface AdminStats {
  totalDocuments: number;
  processedDocuments: number;
  processingDocuments: number;
  failedDocuments: number;
  totalChunks: number;
  vectorCount: number;
  totalUsers: number;
  totalQuestions: number;
  positiveFeedback: number;
  negativeFeedback: number;
  satisfactionRate: number;
  recentUploads: DocumentItem[];
}

export interface TopicAnalytic {
  topic: string;
  count: number;
}

export interface AdminAnalytics {
  topics: TopicAnalytic[];
  totalAnalyzed: number;
}
