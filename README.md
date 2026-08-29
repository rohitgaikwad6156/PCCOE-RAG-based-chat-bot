# PCCOE Pune Digital Information Assistant

> **Pimpri Chinchwad College of Engineering (PCCOE), Pune**
> Autonomous | NAAC 'A' Grade | DTE Code: 6175

A production-ready **RAG (Retrieval-Augmented Generation)** chatbot that provides verified, grounded answers about PCCOE using real college documents, secured with Google OAuth and JWT authentication.

---

## 🎯 Problem Statement

Students and prospective applicants struggle to find accurate, up-to-date information about PCCOE's autonomous examinations, CAP admissions cutoffs, T&P placements, MahaDBT scholarships, and campus facilities. This assistant solves that by grounding all answers in official PCCOE documents using RAG — preventing hallucinations and ensuring accuracy.

---

## ✨ Features

- **Google OAuth Sign-In** — Secure authentication via verified Google credentials
- **JWT Session Management** — Stateless, role-aware authenticated sessions
- **Role-Based Access Control** — `student` and `admin` roles
- **RAG Pipeline** — Answers grounded in PCCOE college documents (not LLM hallucination)
- **Pinecone Vector Search** — Semantic similarity search over indexed document chunks
- **User-Specific Chat History** — Conversations stored per authenticated user in MongoDB
- **Source References** — Every answer includes document citations with relevance scores
- **Admin Document Management** — Upload, index, update, and delete knowledge documents
- **Structured Knowledge Base** — MongoDB-backed profiles for departments, courses, clubs, scholarships
- **Multi-LLM Support** — OpenAI, Google Gemini, OpenRouter (configurable)
- **Deployment-Ready** — Vercel (frontend) + Render (backend) + MongoDB Atlas + Pinecone

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Authentication | Google OAuth 2.0 + JWT |
| Application Database | MongoDB Atlas (users, conversations, documents) |
| Vector Database | Pinecone (document embeddings for semantic search) |
| LLM | OpenAI GPT-4o-mini / Google Gemini / OpenRouter |
| Embeddings | OpenAI text-embedding-3-small / Google text-embedding-004 |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## 🔐 Authentication Architecture

```
User opens app
  └─► ProtectedRoute checks localStorage token
      └─► If no token → redirect to /login
          └─► User clicks "Continue with Google"
              └─► Google GSI SDK (index.html script)
                  └─► Google ID token (credential JWT)
                      └─► POST /api/auth/google { credential }
                          └─► Backend: google-auth-library.verifyIdToken()
                              └─► Google's public keys verify token
                                  └─► Extract: email, name, sub, picture
                                      └─► MongoDB: find or create User
                                          └─► Backend generates app JWT { userId, role }
                                              └─► Frontend stores in localStorage
                                                  └─► All API requests: Authorization: Bearer <jwt>
                                                      └─► requireAuth middleware: verify JWT → req.user
                                                          └─► RAG pipeline uses req.user.userId
```

### Security Properties
- ✅ Backend verifies Google credential with Google's servers — no trust of frontend claims
- ✅ Role (`student`/`admin`) assigned server-side based on `ADMIN_EMAILS` — not from request body
- ✅ JWT contains only `{ userId, role }` — no sensitive data in token
- ✅ `userId` always derived from verified JWT — cannot be spoofed by frontend
- ✅ Conversation isolation — users can only access their own conversations
- ✅ Student JWT on admin route → HTTP 403
- ✅ No JWT → HTTP 401

### Google OAuth Flow

```
Google Sign-In (official GSI SDK)
   credential (signed JWT from Google)
   ↓
POST /api/auth/google
   { credential: "eyJ..." }
   ↓
Backend verifies with Google
   google-auth-library verifyIdToken()
   ↓
Extracts: email, name, sub (googleId), picture
   ↓
MongoDB upsert (find by googleId or email)
   ↓
Assign role: check ADMIN_EMAILS → admin or student
   ↓
Generate app JWT: { userId, role, expires: 7d }
   ↓
Return: { token, user: { id, name, email, role, ... } }
```

---

## 🤖 RAG Architecture

```
Student Question
  └─► Embedding Service (OpenAI / Gemini)
      └─► Query Vector (1536-dim / 768-dim)
          └─► Pinecone Similarity Search (Top-K chunks)
              └─► Relevance Threshold Filter (≥ 0.35)
                  └─► Context Assembly (document chunks)
                      └─► Structured MongoDB Query (departments, courses, etc.)
                          └─► RAG Prompt Construction
                              └─► LLM Generation (OpenAI / Gemini / OpenRouter)
                                  └─► Grounded Answer
                                      └─► Source References (documentTitle, page, relevance%)
                                          └─► Saved to MongoDB (Message under Conversation)
```

**If no relevant context found:** The LLM is instructed to clearly state it couldn't find reliable information — it does NOT hallucinate college facts.

---

## 📊 MongoDB Schema

### User
```
{
  _id, name, email, passwordHash?,
  googleId, authProvider: 'local' | 'google',
  role: 'student' | 'admin',
  department, profilePicture, avatar,
  isActive, lastLoginAt, createdAt, updatedAt
}
```

### Conversation
```
{ _id, userId (→ User), title, departmentFilter, collectionFilter, createdAt, updatedAt }
```

### Message
```
{ _id, conversationId (→ Conversation), role, content, sources[], isGrounded, confidenceScore, confidenceLabel, createdAt }
```

### Document
```
{ _id, title, filename, fileUrl, fileType, fileSize, department, collectionName, status, chunkCount, pageCount, uploadedBy (→ User), createdAt }
```

---

## 🛡️ API Endpoint Security

| Endpoint | Auth | Role | Notes |
|---|---|---|---|
| `GET /health` | Public | — | Render health check |
| `GET /api/health` | Public | — | |
| `POST /api/auth/signup` | Public | — | |
| `POST /api/auth/login` | Public | — | |
| `POST /api/auth/google` | Public | — | Verifies credential server-side |
| `POST /api/auth/logout` | Public | — | |
| `GET /api/auth/me` | ✅ JWT | any | Returns current user |
| `POST /api/chat` | ✅ JWT | any | RAG query |
| `GET /api/chat/conversations` | ✅ JWT | owner | User's own only |
| `GET /api/chat/conversations/:id` | ✅ JWT | owner | Verified by userId |
| `DELETE /api/chat/conversations/:id` | ✅ JWT | owner | |
| `GET /api/documents` | ✅ JWT | any | |
| `POST /api/documents` | ✅ JWT | admin | Upload + index |
| `PUT /api/documents/:id` | ✅ JWT | admin | |
| `DELETE /api/documents/:id` | ✅ JWT | admin | |
| `POST /api/documents/:id/reprocess` | ✅ JWT | admin | Re-index |
| `GET /api/admin/stats` | ✅ JWT | admin | |
| `GET /api/admin/users` | ✅ JWT | admin | |
| `GET /api/admin/analytics` | ✅ JWT | admin | |
| `POST /api/feedback` | ✅ JWT | any | |

---

## ⚙️ Environment Variables

### Backend (Render / `backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✅ | `production` or `development` |
| `PORT` | ✅ | Server port (Render uses 10000) |
| `FRONTEND_URL` | ✅ | Vercel frontend URL (for CORS) |
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Strong random secret (min 32 chars) |
| `JWT_EXPIRES_IN` | ✅ | Token expiry e.g. `7d` |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth Client Secret |
| `LLM_PROVIDER` | ✅ | `openai` \| `gemini` \| `openrouter` |
| `OPENAI_API_KEY` | If provider=openai | |
| `GEMINI_API_KEY` | If provider=gemini | |
| `OPENROUTER_API_KEY` | If provider=openrouter | |
| `LLM_MODEL` | ✅ | e.g. `gpt-4o-mini` |
| `EMBEDDING_PROVIDER` | ✅ | `openai` \| `gemini` |
| `EMBEDDING_MODEL` | ✅ | e.g. `text-embedding-3-small` |
| `VECTOR_STORE_PROVIDER` | ✅ | `pinecone` \| `memory` |
| `PINECONE_API_KEY` | If provider=pinecone | |
| `PINECONE_INDEX` | If provider=pinecone | Index name |
| `ADMIN_EMAIL` | ✅ | Primary admin email |
| `ADMIN_EMAILS` | ✅ | Comma-separated admin email list |
| `ADMIN_PASSWORD` | Optional | Seeded admin password |
| `ADMIN_NAME` | Optional | Seeded admin name |

### Frontend (Vercel / `frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend API URL |
| `VITE_GOOGLE_CLIENT_ID` | ✅ | Google OAuth Client ID (public) |

> ⚠️ **Never put `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, `MONGODB_URI`, or any API key in frontend variables.**

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Cloud project with OAuth credentials

### 1. Clone and Install

```bash
git clone https://github.com/your-repo/pccoe-rag-chatbot.git
cd pccoe-rag-chatbot

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure Backend

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

### 3. Configure Frontend

```bash
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your values
```

### 4. Start Development Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

---

## 🔑 Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create or select a project
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add **Authorized JavaScript origins**:
   - `http://localhost:5173` (local development)
   - `https://your-project.vercel.app` (production)
7. **Authorized redirect URIs**: leave empty (not needed for GSI credential flow)
8. Copy the **Client ID** → set as `GOOGLE_CLIENT_ID` (backend) and `VITE_GOOGLE_CLIENT_ID` (frontend)
9. Copy the **Client Secret** → set as `GOOGLE_CLIENT_SECRET` (backend only — NEVER frontend)

### Admin Users

To grant admin access to a Google account, add its email to `ADMIN_EMAILS`:

```env
ADMIN_EMAILS=admin@pccoe.org,your.email@gmail.com
```

The role is assigned **server-side only** — the frontend cannot request admin access.

---

## ☁️ Deployment

### Backend — Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repository
4. Root directory: `backend`
5. Build command: `npm install && npm run build`
6. Start command: `npm start`
7. Set all environment variables from the table above
8. The `render.yaml` in the repo root can also be used for automatic configuration

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your repository
3. Framework: **Vite**
4. Root directory: `frontend`
5. Set environment variables:
   - `VITE_API_URL=https://pccoe-rag-backend.onrender.com/api`
   - `VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com`

---

## 🔒 Security Notes

- **Never commit `.env` files** — they are in `.gitignore`
- The **Google Client Secret** is backend-only — it is never exposed to the browser
- **JWT Secret** is backend-only — tokens are verified server-side, not trusted from frontend
- **MongoDB URI** is backend-only
- **All API keys** (Pinecone, OpenAI, Gemini) are backend-only
- Admin role assignment is always **server-side** based on `ADMIN_EMAILS`
- Users can only access their own conversations — `userId` is derived from the verified JWT

---

## 📁 Project Structure

```
pccoe-rag-chatbot/
├── backend/
│   ├── src/
│   │   ├── app.ts              # Express app setup
│   │   ├── server.ts           # Server entry point
│   │   ├── config/             # env, database, constants
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # auth.ts, errorHandler, upload, validation
│   │   ├── models/             # User, Conversation, Message, Document, ...
│   │   ├── routes/             # authRoutes, chatRoutes, documentRoutes, adminRoutes, ...
│   │   ├── services/           # authService, ragService, documentService, ...
│   │   ├── embeddings/         # embeddingService.ts
│   │   ├── vector/             # vectorStore.ts (Pinecone + in-memory)
│   │   ├── llm/                # llmService.ts, prompts.ts
│   │   └── utils/              # logger, seedAdmin, autoIndex, ...
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Router + providers
│   │   ├── context/            # AuthContext.tsx, ToastContext.tsx
│   │   ├── components/
│   │   │   ├── auth/           # GoogleOAuthButton.tsx
│   │   │   ├── chat/           # MessageBubble, SourceReferences, ...
│   │   │   ├── admin/          # DocumentTable, UploadModal, StatsCards, ...
│   │   │   └── common/         # Navbar, Sidebar, ProtectedRoute, Modal
│   │   ├── pages/              # LoginPage, SignupPage, ChatPage, AdminPages, ...
│   │   ├── services/           # api.ts, authApi.ts, chatApi.ts, documentApi.ts, ...
│   │   └── types/              # index.ts
│   ├── .env.example
│   └── package.json
├── render.yaml                 # Render deployment config
├── .env.example                # Combined env reference
├── .gitignore
└── README.md
```

---

## 🔗 Live Demo

- **Frontend**: https://pccoe-rag-based-chat-bot.vercel.app
- **Backend API**: https://pccoe-rag-backend.onrender.com
- **Health Check**: https://pccoe-rag-backend.onrender.com/health

---

## 📋 Sample Questions

- *"What are the MHT-CET 2026 cutoffs for Computer Engineering at PCCOE?"*
- *"Explain the autonomous exam attendance rules (75% rule) at PCCOE Pune."*
- *"What scholarships are available for EBC students at PCCOE?"*
- *"What is the highest placement package at PCCOE in 2025-26?"*
- *"How do I apply for PCCOE hostel accommodation?"*
- *"What clubs are active in the IT department at PCCOE?"*

---

## 🏫 About PCCOE

Pimpri Chinchwad College of Engineering (PCCOE), Pune is an autonomous engineering college (DTE Code: 6175) affiliated with Savitribai Phule Pune University. It holds NAAC 'A' Grade accreditation and consistently ranks among Maharashtra's top private engineering colleges.

---

*Built with ❤️ for PCCOE students — powered by RAG, Pinecone, and Google AI*
