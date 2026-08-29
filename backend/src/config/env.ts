import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/pccoe-college-rag-chatbot',
  JWT_SECRET: process.env.JWT_SECRET || 'pccoe_rag_default_jwt_secret_key_change_in_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // LLM Config
  LLM_PROVIDER: (process.env.LLM_PROVIDER || 'gemini').toLowerCase(),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  LLM_MODEL: process.env.LLM_MODEL || 'gemini-1.5-flash',

  // Embedding Config
  EMBEDDING_PROVIDER: (process.env.EMBEDDING_PROVIDER || 'gemini').toLowerCase(),
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'text-embedding-004',

  // Vector DB Config
  VECTOR_STORE_PROVIDER: (process.env.VECTOR_STORE_PROVIDER || 'memory').toLowerCase(),
  PINECONE_API_KEY: process.env.PINECONE_API_KEY || '',
  PINECONE_INDEX: process.env.PINECONE_INDEX || 'pccoe-rag',
  PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT || '',

  // Google OAuth 2.0 Credentials
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

  // Admin seed & authorized admin emails for PCCOE
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@pccoe.org',
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS || 'admin@pccoe.org').split(',').map((e) => e.trim().toLowerCase()),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'PccoeAdmin2026!',
  ADMIN_NAME: process.env.ADMIN_NAME || 'PCCOE Administrator',

  isProduction: process.env.NODE_ENV === 'production',
};
