# 🎓 PCCOE AI Assistant — Full-Stack RAG College Knowledge Platform

An enterprise-grade, full-stack **Retrieval-Augmented Generation (RAG)** platform designed specifically for **Pimpri Chinchwad College of Engineering (PCCOE), Pune** (Autonomous Institute, NAAC 'A++', DTE Code: 6175).

The system integrates **Google OAuth 2.0 & JWT Authentication**, **MongoDB Atlas User & Chat History Persistence**, **Pinecone Vector Database Search**, and **Multi-LLM Synthesizers (OpenAI, Gemini, OpenRouter)** with verified source citations.

---

## 🏛️ System Architecture

```
                      ┌─────────────────────────────────┐
                      │  Frontend (React 18 + Vite)     │
                      │  Deployed on Vercel             │
                      └────────────────┬────────────────┘
                                       │
                                (JWT Bearer Token)
                                       │
                      ┌────────────────▼────────────────┐
                      │  Backend (Node.js + Express)    │
                      │  Deployed on Render             │
                      └────────────────┬────────────────┘
                                       │
       ┌───────────────────────────────┼───────────────────────────────┐
       │                               │                               │
┌──────▼─────────────┐   ┌─────────────▼─────────────┐   ┌─────────────▼─────────────┐
│   MongoDB Atlas    │   │      Pinecone Vector DB   │   │     Multi-LLM Synthesis   │
│ ────────────────── │   │ ───────────────────────── │   │ ───────────────────────── │
│ • Users & Roles    │   │ • 140+ Knowledge Vectors  │   │ • OpenAI GPT-4o-mini      │
│ • Chat History     │   │ • 1024-dim Embeddings     │   │ • Google Gemini           │
│ • Structured Data  │   │ • Cosine Similarity       │   │ • OpenRouter              │
│   (Faculty, Fees,  │   │ • Departmental Filtering  │   │ • Grounded Answer Output  │
│   Clubs, Notices)  │   │ • Source Page Numbers     │   │ • Source Citation Cards   │
└────────────────────┘   └───────────────────────────┘   └───────────────────────────┘
```

---

## 🔐 Authentication & Security

### 1. Google OAuth 2.0 Integration
- **Google Identity Services (GSI)**: Supports one-click native Google popup using saved browser accounts.
- **Backend Cryptographic Verification**: Backend verifies Google ID tokens using `google-auth-library` (`OAuth2Client.verifyIdToken`), extracting verified `sub` (Google ID), `email`, `name`, and `picture`.
- **Role-Based Authorization**: Regular Google sign-ins default to the `student` role. Only verified institutional administrator emails (`ADMIN_EMAILS` or `ADMIN_EMAIL`) receive `admin` privileges.

### 2. JWT Session Security
- Signed using `JWT_SECRET` with configurable expiry (`JWT_EXPIRES_IN=7d`).
- Payload contains only `userId` and `role`.
- Enforced on all protected routes via `requireAuth` and `requireAdmin` middleware.

### 3. User-Specific Chat History Isolation
- All conversations (`POST /api/chat`, `GET /api/chat/conversations`) identify the user strictly via verified `req.user.id`.
- Students can only read, update, or delete their own chat threads.

---

## 📚 Real Grounded RAG Pipeline

```
Student Question
      ↓
Query Embedding (OpenAI text-embedding-3-small / Gemini)
      ↓
Pinecone Vector Database (1024-dim Cosine Similarity Search)
      ↓
Top-K Relevant Chunks (with Page Numbers & Handbook References)
      ↓
Structured MongoDB Knowledge Check (Faculty, Cutoffs, Fees, Clubs)
      ↓
Strict Prompt Context Construction (Zero-Hallucination Guardrails)
      ↓
LLM Generation (OpenAI / Gemini / OpenRouter)
      ↓
Final Grounded Answer + Source Attribution Cards
```

### Knowledge Base Ingestion
- Auto-indexes **140 official knowledge vectors** on boot from:
  1. *PCCOE Autonomous Academic Regulations & Examination Rules 2026-27*
  2. *PCCOE Departmental Student Associations & Technical Clubs (ITSA, CESA, TKR)*
  3. *PCCOE Official Profile & Comprehensive Overview 2026*
  4. *PCCOE All Departments, Programs & Course Curriculums*
  5. *PCCOE Collegiate Motorsports & Technical Teams (Red Baron, Kratos, Robocon)*
  6. *PCCOE National Rankings (NIRF), NBA & NAAC Accreditations*
  7. *PCCOE Admissions 2026-27: MHT-CET Cutoffs, Fee Structure & Scholarships*
  8. *PCCOE Training & Placement Cell (T&P) Statistics & Recruiters*

---

## ⚙️ Environment Variables

### Backend Configuration (Render / Local)
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://pccoe-rag-based-chat-bot.vercel.app

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/pccoe-rag?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI & LLM Providers
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=
OPENROUTER_API_KEY=
LLM_MODEL=gpt-4o-mini

# Embeddings
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small

# Vector Database (Pinecone)
VECTOR_STORE_PROVIDER=pinecone
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX=pccoe-rag
PINECONE_ENVIRONMENT=

# Administrator Privileges
ADMIN_EMAIL=admin@pccoe.org
ADMIN_EMAILS=admin@pccoe.org
ADMIN_PASSWORD=PccoeAdmin2026!
ADMIN_NAME=PCCOE Administrator
```

### Frontend Configuration (Vercel / Local)
```env
VITE_API_URL=https://pccoe-rag-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 🚀 Quickstart & Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/rohitgaikwad6156/PCCOE-RAG-based-chat-bot.git
cd PCCOE-RAG-based-chat-bot

# Install all dependencies
npm run install:all
```

### 2. Start Development Servers
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🌐 Cloud Deployment Guide

### Deploy Backend on Render
1. Go to [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect your repo and set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add backend environment variables (from the table above).
4. In **MongoDB Atlas** → **Network Access** → add `0.0.0.0/0` (Allow from Anywhere).

### Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New...** → **Project**.
2. Import repository and set:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add `VITE_API_URL=https://pccoe-rag-backend.onrender.com/api`.
4. Click **Deploy**.

---

## 👥 Demo Access Accounts

| Role | Email | Password | Google Sign-In |
|---|---|---|---|
| **PCCOE Administrator** | `admin@pccoe.org` | `PccoeAdmin2026!` | Auto-Admin |
| **PCCOE Student** | `student@pccoe.org` | `PccoeStudent2026!` | Standard Student |
| **Google User** | `your.email@gmail.com` | N/A | One-Click OAuth |

---

## 📄 License
MIT License. Developed for **Pimpri Chinchwad College of Engineering (PCCOE), Pune**.
