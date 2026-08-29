# RAG-Based College Chatbot — Complete Project Specification

## 1. PROJECT OVERVIEW

Build a production-ready, advanced AI-powered **RAG-Based College Chatbot** that acts as a centralized information assistant for college students.

The system must answer student questions using **Retrieval-Augmented Generation (RAG)**. It must NOT behave like a normal chatbot that simply sends questions to an LLM.

Every college-related answer must first attempt to retrieve relevant information from the college's uploaded knowledge base, including:

* PDF documents
* DOC/DOCX documents
* Notices
* FAQs
* Admission information
* Department information
* Course information
* Fee structures
* Examination information
* Academic calendars
* Hostel information
* Library information
* Clubs
* Placements
* Scholarships
* College policies
* Events
* Circulars
* Regulations
* Rules
* Other approved college resources

The application must have a complete working:

**Frontend → Backend API → Authentication → Database → Document Processing → Text Extraction → Chunking → Embeddings → Vector Database → Semantic Search → Context Retrieval → LLM → Grounded Answer → Source References**

architecture.

The final project must be deployable and accessible online.

---

# 2. PRIMARY OBJECTIVE

Create a complete full-stack college information assistant with:

1. Responsive frontend
2. Authentication
3. Student chatbot
4. Admin dashboard
5. Document upload
6. Document processing
7. Text extraction
8. Text chunking
9. Embedding generation
10. Vector database
11. Semantic similarity search
12. RAG pipeline
13. LLM answer generation
14. Source/reference display
15. Unknown-question handling
16. Conversation history
17. Database integration
18. Admin document management
19. CRUD operations
20. Input validation
21. Error handling
22. Loading states
23. Protected routes
24. Production-ready environment variables
25. Deployment-ready architecture

Do not create a fake/demo RAG implementation.

The retrieval pipeline must actually work.

---

# 3. REQUIRED RAG PIPELINE

Implement this exact conceptual pipeline:

College Documents
↓
Document Upload
↓
Text Extraction
↓
Text Cleaning
↓
Document Metadata Creation
↓
Chunking
↓
Embedding Generation
↓
Vector Database Storage
↓
User Question
↓
Question Embedding
↓
Similarity Search
↓
Relevant Chunks
↓
Optional Re-ranking
↓
Context Construction
↓
LLM
↓
Grounded Answer
↓
Source References
↓
Chat History Storage

The application must never claim that a question is answered from college documents unless relevant retrieved context exists.

---

# 4. TECHNOLOGY STACK

Use a modern, maintainable stack.

## Frontend

Use:

* React
* Vite
* TypeScript
* Tailwind CSS
* Modern component architecture
* Responsive design
* React Router
* API client using fetch or Axios
* Proper state management where useful
* Toast/notification system
* Loading skeletons
* Error states
* Empty states

The frontend must be clean, professional, modern and human-designed.

Avoid a generic AI-generated-looking UI.

The UI should look like a real modern college technology product.

---

# 5. BACKEND

Use:

* Node.js
* Express.js
* TypeScript

Create a properly structured REST API.

Suggested structure:

backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── rag/
│   ├── embeddings/
│   ├── vector/
│   ├── document/
│   ├── utils/
│   ├── validators/
│   ├── app.ts
│   └── server.ts
├── uploads/
├── package.json
├── tsconfig.json
└── .env.example

Do not put business logic directly inside route files.

Separate:

* Routes
* Controllers
* Services
* Database models
* RAG logic
* Authentication
* Validation
* Document processing
* Error handling

---

# 6. DATABASE

Use **MongoDB Atlas** as the primary application database.

Use Mongoose or an equivalent MongoDB ODM.

The database must support:

* Users
* Documents
* Document metadata
* Document versions
* Chunks
* Chat sessions
* Messages
* Feedback
* Departments
* Collections
* Analytics where implemented

Design proper relationships/references.

---

# 7. VECTOR DATABASE

The application MUST use a real vector database or vector-search implementation.

Preferred option:

**Pinecone**

Alternative if technically more suitable:

* Qdrant
* Supabase pgvector
* MongoDB Atlas Vector Search

Do not implement fake similarity search using plain string matching.

The vector database must store:

* Chunk ID
* Document ID
* Embedding
* Department
* Collection
* Document version
* Metadata
* Source information

Use metadata filtering where appropriate.

---

# 8. EMBEDDINGS

Implement real embedding generation.

Create a dedicated embedding service.

The service must:

1. Receive text
2. Generate an embedding
3. Return the vector
4. Store the vector in the vector database

Make the embedding provider configurable using environment variables.

Do not hard-code API keys.

---

# 9. LLM

Use a configurable LLM provider.

The system should support an environment-configured provider such as:

* OpenAI
* Google Gemini
* NVIDIA API
* OpenRouter
* another compatible provider

The LLM provider must be isolated inside a service.

Example conceptual interface:

generateAnswer(context, question, conversationHistory)

The application must not directly call the LLM from frontend code.

All LLM requests must happen through the backend.

---

# 10. RAG ANSWERING RULE

The chatbot must be grounded in the retrieved college knowledge.

System behavior:

If relevant context is found:

* Answer the question
* Use the retrieved context
* Give concise but useful information
* Display sources
* Never invent unsupported college information

If relevant context is NOT found:

Clearly say that the requested information could not be found in the available college knowledge base.

Do not hallucinate.

Example:

"I couldn't find reliable information about this in the college knowledge base. Please contact the administration or upload the relevant document."

Never generate fake:

* Fees
* Dates
* Rules
* Exam schedules
* Scholarship details
* Admission requirements
* Hostel rules
* College policies

---

# 11. CHAT INTERFACE

Create a complete student chat interface.

The interface must include:

* New conversation
* Conversation list
* Message bubbles
* User messages
* AI messages
* Typing/loading indicator
* Streaming response if possible
* Source references
* Timestamp
* Copy answer
* Feedback buttons
* Suggested questions
* Error messages
* Retry button
* Clear conversation
* Responsive mobile layout

Example suggested questions:

* "What is the admission process?"
* "What are the hostel fees?"
* "When are the semester exams?"
* "Tell me about the scholarship options."
* "What documents are required for admission?"
* "What is the library timing?"
* "Tell me about placement statistics."

---

# 12. SOURCE DISPLAY

Every RAG-generated answer should display its source documents.

For each source show:

* Document name
* Document type
* Page number if available
* Relevant section if available
* Relevance score if implemented
* Short extracted snippet

Example:

Sources:
📄 Academic_Calendar_2026.pdf
Page 4
Relevance: 92%

Clicking a source should show additional document information.

Do not show fake sources.

Only show sources actually retrieved by the RAG system.

---

# 13. DOCUMENT UPLOAD

Admin users must be able to upload documents.

Support at minimum:

* PDF
* DOC
* DOCX
* TXT

Validate:

* File type
* File size
* Filename
* Duplicate documents where appropriate

Show:

* Upload progress
* Processing status
* Success state
* Failure state
* Processing errors

---

# 14. DOCUMENT PROCESSING

After upload:

1. Save document metadata
2. Store the document
3. Extract text
4. Clean text
5. Detect pages where possible
6. Split into chunks
7. Generate embeddings
8. Store embeddings in vector database
9. Store chunk metadata
10. Mark document as processed

Document states:

* uploaded
* processing
* processed
* failed
* archived

Do not block the entire server unnecessarily during large document processing.

Use asynchronous/background processing where practical.

---

# 15. TEXT EXTRACTION

Implement real text extraction.

For PDFs:

* Extract page-level text
* Preserve page numbers

For DOC/DOCX:

* Extract readable text

For TXT:

* Read plain text

Handle:

* Empty documents
* Corrupted documents
* Unsupported formats
* Scanned PDFs

If OCR is implemented as a bonus feature, automatically detect when a PDF has little/no extractable text and provide OCR processing.

---

# 16. CHUNKING

Implement meaningful text chunking.

Do not simply split randomly.

Chunk metadata should contain:

* documentId
* chunkId
* pageNumber
* chunkIndex
* text
* department
* collection
* documentVersion

Use configurable:

* Chunk size
* Chunk overlap

Make these values configurable through code/constants.

---

# 17. SEMANTIC SEARCH

When a student asks a question:

1. Generate question embedding
2. Search vector database
3. Retrieve top relevant chunks
4. Apply metadata filtering where applicable
5. Optionally re-rank
6. Remove low-quality results
7. Build context
8. Send context to LLM

Use a configurable top-K value.

Example:

TOP_K=5

Do not return unrelated chunks.

---

# 18. HYBRID SEARCH BONUS

If possible, implement hybrid retrieval:

Semantic/vector search
+
Keyword search

Then combine/rank the results.

This should improve retrieval for:

* Course codes
* Department names
* Specific dates
* Notice numbers
* Policy names
* Scholarship names

---

# 19. RE-RANKING BONUS

Implement optional re-ranking.

Pipeline:

Vector Search
↓
Candidate Chunks
↓
Re-ranking
↓
Top Relevant Chunks
↓
LLM

Make the re-ranking system configurable.

---

# 20. CONVERSATION CONTEXT

The chatbot must remember the current conversation.

Example:

User:
"What is the hostel fee?"

AI:
"The hostel fee is..."

User:
"What about first-year students?"

The system should understand that "first-year students" refers to the hostel fee discussion.

Store conversations in the database.

Each conversation should have:

* userId
* title
* createdAt
* updatedAt

Each message should have:

* conversationId
* role
* content
* sources
* timestamp

---

# 21. USER AUTHENTICATION

Implement complete authentication.

Required:

* Signup
* Login
* Logout
* Protected routes
* Authentication persistence
* Password hashing
* Input validation
* Authentication error handling

Use secure password hashing such as bcrypt.

Never store plaintext passwords.

Use secure authentication tokens/cookies.

Do not expose authentication secrets.

---

# 22. USER ROLES

Implement role-based access control.

Roles:

* student
* admin

Students:

* Ask questions
* View chat history
* Give feedback
* View available sources

Admins:

* Upload documents
* Update documents
* Delete documents
* View documents
* Manage collections
* View processing status
* View analytics if implemented

Admin APIs must be protected.

A normal student must never be able to access admin APIs.

---

# 23. ADMIN DASHBOARD

Create a professional admin dashboard.

Include:

* Total documents
* Processed documents
* Processing documents
* Failed documents
* Total users
* Total questions
* Most asked topics
* Recent uploads
* Document management
* Collection management
* Department filtering

Dashboard sections:

Overview
Documents
Collections
Users
Analytics
Settings

---

# 24. DOCUMENT MANAGEMENT

Admin must be able to:

* Upload
* View
* Search
* Filter
* Update metadata
* Replace document
* Create new version
* Delete
* Archive
* Reprocess

Document table should display:

* Name
* Type
* Department
* Collection
* Version
* Status
* Uploaded date
* Updated date
* Actions

Add confirmation before destructive actions.

---

# 25. DOCUMENT VERSION MANAGEMENT BONUS

Support document versions.

Example:

Academic Calendar
v1
v2
v3

When a new version is uploaded:

* Keep version history
* Mark latest version
* Prevent outdated content from being used if configured
* Preserve previous metadata

---

# 26. MULTIPLE COLLECTIONS BONUS

Allow documents to belong to collections.

Examples:

* Admissions
* Academics
* Exams
* Hostel
* Library
* Placements
* Scholarships
* Events
* Policies

The user interface should make collections easy to filter.

---

# 27. DEPARTMENT KNOWLEDGE BASE

Support department-wise knowledge bases.

Example:

* Computer Engineering
* Information Technology
* Electronics
* Mechanical
* Civil

A document can contain:

* Department
* Collection
* Category

Allow filtering during retrieval.

---

# 28. MULTILINGUAL SUPPORT BONUS

Support multiple languages if practical.

At minimum consider:

* English
* Hindi
* Marathi

The system should preserve the meaning of the user's question and return the answer in the selected language.

Do not translate college-specific names incorrectly.

---

# 29. VOICE INPUT BONUS

Add optional microphone input.

Flow:

Microphone
↓
Speech-to-text
↓
Chat question
↓
RAG
↓
Answer

If voice services are unavailable, hide/disable the feature gracefully rather than breaking the application.

---

# 30. VOICE RESPONSE BONUS

Optional:

Text answer
↓
Text-to-speech
↓
Audio response

Provide play/pause controls.

---

# 31. OCR BONUS

For scanned PDFs:

Detect low text extraction.

If OCR is enabled:

* Process document pages
* Extract text using OCR
* Preserve page numbers
* Continue through normal chunking/embedding pipeline

OCR should fail gracefully if unavailable.

---

# 32. ANSWER CONFIDENCE / RELEVANCE

Display an optional confidence/relevance indicator based on retrieval quality.

Example:

High relevance
Medium relevance
Low relevance

Do not pretend this is mathematical certainty.

Use labels such as:

"Source relevance: High"

instead of misleading users with fake probabilities.

---

# 33. FEEDBACK

After every AI answer:

👍 Helpful
👎 Not helpful

Store:

* userId
* messageId
* feedback
* optional comment
* timestamp

Admins can view feedback analytics.

---

# 34. SUGGESTED QUESTIONS

Show useful suggested questions.

Suggestions can depend on:

* Department
* Collection
* Popular questions
* Recent topics

Examples:

"What are the exam dates?"
"How can I apply for a scholarship?"
"What are the hostel rules?"

---

# 35. CONVERSATION EXPORT BONUS

Allow users to export a conversation.

Formats:

* PDF
* TXT
* JSON

Only allow users to export their own conversations.

---

# 36. AI-GENERATED FAQ BONUS

Admin can trigger FAQ generation from documents.

Flow:

Document collection
↓
LLM analysis
↓
Frequently asked questions
↓
Suggested answers
↓
Admin review
↓
Publish

Never automatically publish dangerous/incorrect information without admin review.

---

# 37. AUTOMATIC DOCUMENT SUMMARIZATION BONUS

Admin can request a document summary.

Show:

* Short summary
* Key points
* Important dates
* Important rules
* Topics

The summary must be based on the document.

---

# 38. STREAMING RESPONSES BONUS

If supported by the selected LLM provider:

Stream AI responses token-by-token.

Frontend should show:

"Thinking..."
then progressively display the answer.

If streaming fails, automatically fall back to normal response generation.

---

# 39. API DESIGN

Create clean REST APIs.

Example:

## Authentication

POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me

## Chat

POST /api/chat
GET /api/chat/conversations
GET /api/chat/conversations/:id
DELETE /api/chat/conversations/:id

## Documents

POST /api/documents
GET /api/documents
GET /api/documents/:id
PUT /api/documents/:id
DELETE /api/documents/:id
POST /api/documents/:id/reprocess

## Collections

POST /api/collections
GET /api/collections
PUT /api/collections/:id
DELETE /api/collections/:id

## Feedback

POST /api/feedback

## Admin

GET /api/admin/analytics
GET /api/admin/users
GET /api/admin/stats

Implement only endpoints that are actually required, but keep the architecture extensible.

---

# 40. INPUT VALIDATION

Validate all user input.

Validate:

* Email
* Password
* User names
* Chat messages
* Document metadata
* File type
* File size
* IDs
* Pagination
* Filters

Reject malformed requests.

Never trust frontend validation alone.

Backend validation is mandatory.

---

# 41. ERROR HANDLING

Implement centralized backend error handling.

Errors must return structured responses.

Example:

{
"success": false,
"message": "Unable to process document"
}

Do not expose:

* Stack traces
* Database credentials
* API keys
* Internal secrets

Frontend must display friendly error messages.

---

# 42. LOADING STATES

Implement loading states for:

* Login
* Signup
* Chat
* Document upload
* Document processing
* Dashboard loading
* Document deletion
* Conversation loading
* Source loading

Never leave the user wondering whether something is working.

---

# 43. FRONTEND DESIGN

The design must be:

* Modern
* Professional
* Responsive
* Clean
* Human-centered
* Accessible
* Fast

Avoid:

* Excessive gradients
* Excessive glassmorphism
* Random animations
* Cartoon-style design
* Generic AI dashboard appearance
* Huge unnecessary headings
* Excessive rounded cards
* Fake statistics

Use a consistent visual system.

Create:

* Sidebar
* Top navigation
* Chat workspace
* Source panel
* Admin dashboard
* Tables
* Forms
* Modals
* Toast notifications
* Empty states

---

# 44. RESPONSIVE DESIGN

The application must work on:

* Desktop
* Laptop
* Tablet
* Mobile

Chat interface should adapt properly.

On mobile:

* Sidebar becomes drawer
* Sources become expandable
* Admin tables become responsive
* Buttons remain usable
* No horizontal overflow

---

# 45. ACCESSIBILITY

Implement:

* Proper semantic HTML
* Keyboard navigation
* Accessible buttons
* Labels for forms
* Focus states
* Readable contrast
* ARIA attributes where required

---

# 46. SECURITY

Implement basic production security.

Use:

* Password hashing
* Authentication middleware
* Role-based authorization
* CORS configuration
* Helmet
* Rate limiting where appropriate
* Request validation
* Secure cookies/tokens
* File upload restrictions
* File size limits
* Sanitization
* Environment variables

Never expose secrets in frontend code.

---

# 47. ENVIRONMENT VARIABLES

Create:

.env.example

Never commit:

.env

Possible environment variables:

NODE_ENV=
PORT=
MONGODB_URI=
JWT_SECRET=
FRONTEND_URL=
LLM_API_KEY=
LLM_MODEL=
EMBEDDING_API_KEY=
EMBEDDING_MODEL=
PINECONE_API_KEY=
PINECONE_INDEX=
PINECONE_ENVIRONMENT=
STORAGE_BUCKET=
OCR_API_KEY=

Only include variables actually used by the implementation.

Never put actual credentials in GitHub.

---

# 48. FILE STORAGE

Uploaded documents must not depend on temporary local server storage in production.

Use a production-compatible storage service where necessary.

Possible options:

* Cloudinary
* Supabase Storage
* AWS S3
* Cloud storage supported by the selected architecture

For local development, temporary local storage may be supported.

Production configuration must use persistent storage.

---

# 49. DATABASE MODELS

Create appropriate models.

## User

Fields:

* name
* email
* passwordHash
* role
* department
* createdAt
* updatedAt

## Document

Fields:

* title
* filename
* fileUrl
* fileType
* fileSize
* department
* collection
* version
* status
* uploadedBy
* uploadedAt
* updatedAt

## DocumentChunk

Fields:

* documentId
* chunkIndex
* text
* pageNumber
* vectorId
* metadata

## Conversation

Fields:

* userId
* title
* createdAt
* updatedAt

## Message

Fields:

* conversationId
* role
* content
* sources
* createdAt

## Feedback

Fields:

* userId
* messageId
* type
* comment
* createdAt

Add timestamps and indexes where useful.

---

# 50. RAG SERVICE ARCHITECTURE

Create a dedicated RAG service.

Conceptually:

ragService.answerQuestion(question, user, conversationId)

Steps:

1. Validate question
2. Load conversation context
3. Generate question embedding
4. Query vector database
5. Apply filters
6. Retrieve relevant chunks
7. Re-rank if enabled
8. Check relevance threshold
9. Build context
10. Construct grounded prompt
11. Call LLM
12. Parse response
13. Attach real source metadata
14. Save message
15. Return response

---

# 51. RAG SYSTEM PROMPT

The LLM must receive instructions similar to:

"You are a college information assistant. Answer only using the provided retrieved college context and relevant conversation context. Do not invent facts. If the retrieved context does not contain enough information to answer the question, clearly state that the information is unavailable in the college knowledge base. Do not assume college-specific policies, fees, dates, rules, or requirements. When answering, use the provided sources as the primary evidence."

Implement this as a backend prompt, not frontend text.

---

# 52. SOURCE GROUNDING

The backend must maintain a mapping between:

LLM context
→ Retrieved chunk
→ Document
→ Page
→ Source

Do not ask the LLM to invent citations.

Sources must be generated by the backend from retrieval results.

---

# 53. UNKNOWN QUESTION HANDLING

Examples of questions outside the knowledge base:

"Who will win tomorrow's cricket match?"

Expected response:

"I couldn't find information about that in the college knowledge base."

For college questions without relevant documents:

"I couldn't find reliable information about this in the available college documents."

Never hallucinate.

---

# 54. CHAT HISTORY

Sidebar should show:

* Recent conversations
* Conversation titles
* Dates

Allow:

* New chat
* Open chat
* Delete chat
* Rename chat if implemented

Persist conversations in MongoDB.

---

# 55. ADMIN ANALYTICS BONUS

Show:

* Total questions
* Questions per day
* Most common questions
* Most used collections
* Most active departments
* Positive feedback
* Negative feedback
* Retrieval quality indicators

Do not fabricate analytics.

Use actual database data.

---

# 56. PERFORMANCE

Optimize:

* Database queries
* Vector search
* Embedding generation
* Document processing
* Frontend bundle
* API calls

Avoid generating embeddings repeatedly for unchanged chunks.

When reprocessing a document, clean up obsolete vector entries.

---

# 57. CACHING BONUS

Optionally cache:

* Frequently asked questions
* Embeddings
* Retrieval results

Do not cache personalized/private information incorrectly.

---

# 58. LOGGING

Implement useful backend logging.

Log:

* Server startup
* API errors
* Document processing status
* RAG failures
* Vector database errors

Do not log:

* Passwords
* API keys
* JWT secrets
* Sensitive user data

---

# 59. HEALTH CHECK

Create:

GET /api/health

Response:

{
"success": true,
"status": "healthy"
}

Use this for deployment/testing.

---

# 60. PROJECT STRUCTURE

Repository MUST follow:

project/
│
├── frontend/
│
├── backend/
│
├── README.md
│
└── .gitignore

Frontend should have a clean structure.

Backend should have a clean modular structure.

Do not create one massive file containing the entire application.

---

# 61. GITHUB REQUIREMENTS

The GitHub repository must NOT contain:

* Database passwords
* API keys
* Secret keys
* .env files
* Authentication secrets
* Private credentials
* Production tokens

Include:

.env.example

with variable names only.

---

# 62. GITIGNORE

Create a proper .gitignore.

Include at minimum:

.env
.env.*
node_modules/
dist/
build/
uploads/
logs/
*.log

Do not accidentally ignore important source files.

---

# 63. README.md

Create a professional README with exactly these major sections:

# Project Name

Give the project name.

# Problem Statement

Explain:

* The problem
* Why students struggle to find information
* Why scattered college documents create confusion
* How the RAG chatbot solves the problem

# Features

List all implemented core and bonus features.

Clearly distinguish implemented features from future features if necessary.

# Technology Stack

Mention:

* Frontend
* Backend
* Database
* Vector database
* Embedding provider
* LLM provider
* Storage
* Authentication
* Deployment

# Screenshots

Add placeholders or actual screenshots for:

* Login
* Signup
* Chat
* Sources
* Chat history
* Admin dashboard
* Document management
* Document upload

# Live Demo

Include the deployed Vercel URL after deployment.

# Backend

Include the deployed backend/API URL after deployment.

# Setup Instructions

Explain complete local setup.

Example:

1. Clone repository
2. Install frontend dependencies
3. Install backend dependencies
4. Create environment files
5. Configure MongoDB
6. Configure vector database
7. Configure embedding provider
8. Configure LLM provider
9. Start backend
10. Start frontend

# Environment Variables

List variable names only.

Never expose actual secrets.

---

# 64. DEPLOYMENT ARCHITECTURE

Use:

GitHub
│
├──────────────► Vercel
│                    │
│                    └── Frontend
│
└──────────────► Render
│
└── Backend API
│
├── MongoDB Atlas
│
├── Vector Database
│
├── LLM Provider
│
└── Embedding Provider

Frontend must communicate with the deployed backend through environment-configured API URL.

Do not hard-code localhost URLs in production.

---

# 65. VERCEL REQUIREMENTS

Frontend must be deployable on Vercel.

Use an environment variable such as:

VITE_API_URL

The production frontend must use the deployed Render backend.

Do not assume localhost.

---

# 66. RENDER REQUIREMENTS

Backend must be deployable on Render.

Configure:

* Build command
* Start command
* Environment variables
* CORS
* PORT handling

The backend must listen on the environment-provided port.

---

# 67. DATABASE DEPLOYMENT

Use MongoDB Atlas.

Configure:

MONGODB_URI

Do not commit it.

Ensure the deployed backend can access MongoDB Atlas.

---

# 68. DEPLOYMENT VALIDATION

Before considering the project complete, verify:

1. Frontend builds
2. Backend builds
3. Backend starts
4. Database connects
5. Authentication works
6. Student can signup
7. Student can login
8. Student can logout
9. Admin login works
10. Admin can upload document
11. Document processing works
12. Text extraction works
13. Chunking works
14. Embeddings are generated
15. Vectors are stored
16. Semantic search works
17. RAG retrieves context
18. LLM generates grounded answer
19. Sources are displayed
20. Unknown questions are handled
21. Chat history works
22. Admin can update documents
23. Admin can delete documents
24. Protected routes work
25. Error handling works
26. Loading states work
27. Production environment variables work
28. Vercel frontend works
29. Render backend works
30. MongoDB Atlas works
31. No secrets are committed
32. No broken API calls remain

---

# 69. TESTING

Implement meaningful tests where practical.

Test:

### Authentication

* Signup
* Login
* Invalid password
* Duplicate email
* Protected route

### Documents

* Upload
* Invalid file
* Processing
* Delete
* Update

### RAG

* Relevant question
* Irrelevant question
* Unknown question
* Source retrieval
* Context generation

### Authorization

* Student accessing admin endpoint
* Admin accessing admin endpoint

### API

* Validation
* Error handling
* Health endpoint

---

# 70. UI ERROR STATES

Create useful messages.

Examples:

Document upload failed:
"Unable to upload the document. Please check the file type and try again."

RAG failure:
"I couldn't process your question right now. Please try again."

No sources:
"I couldn't find relevant information in the college knowledge base."

Authentication failure:
"Invalid email or password."

Network failure:
"Unable to connect to the server. Please try again."

---

# 71. EMPTY STATES

Implement useful empty states.

Chat:

"No conversations yet. Start by asking a question."

Documents:

"No documents found."

Search:

"No matching documents found."

Sources:

"No sources were retrieved."

---

# 72. ADMIN DOCUMENT PROCESSING UI

Show a visual processing state:

Uploaded
↓
Extracting text
↓
Creating chunks
↓
Generating embeddings
↓
Indexing
↓
Ready

If processing fails:

Show the failed stage and an option to retry.

---

# 73. SOURCE HIGHLIGHTING BONUS

When possible, allow users to inspect the exact retrieved chunk.

Show:

Document
Page
Relevant passage

Highlight the relevant text.

---

# 74. ROLE-BASED UI

Student UI:

* Chat
* Conversations
* Sources
* Profile

Admin UI:

* Dashboard
* Chat
* Documents
* Collections
* Analytics
* Users
* Settings

Do not display admin controls to students.

Frontend restrictions are NOT enough; backend authorization is mandatory.

---

# 75. API RESPONSE FORMAT

Use consistent responses.

Success:

{
"success": true,
"data": {}
}

Failure:

{
"success": false,
"message": "Error message"
}

Use appropriate HTTP status codes.

---

# 76. CODE QUALITY

Write:

* Clean
* Modular
* Readable
* Maintainable
* Typed
* Documented where necessary

Avoid:

* Duplicate logic
* Giant components
* Hard-coded secrets
* Hard-coded API URLs
* Unused dependencies
* Dead code
* Fake data in production screens
* Placeholder API calls
* Fake vector search
* Fake RAG

---

# 77. NO FAKE FUNCTIONALITY

This is extremely important.

Do not create UI buttons that appear functional but do nothing.

Do not create:

* Fake document processing
* Fake vector search
* Fake AI responses
* Fake source citations
* Fake analytics
* Fake authentication
* Fake database operations

If a feature cannot be implemented because an external API is not configured, provide:

* Clear configuration instructions
* Graceful error state
* Proper feature detection

Do not fake the result.

---

# 78. DEVELOPMENT EXPERIENCE

Provide:

* README
* .env.example
* Clear scripts
* Seed/admin creation mechanism if appropriate
* Database setup instructions
* API documentation where useful

package.json scripts should include appropriate commands such as:

npm run dev
npm run build
npm run start

Use equivalent scripts for frontend/backend.

---

# 79. ADMIN SEED

Provide a safe way to create the first admin account.

Do not hard-code an admin password in source code.

Possible approach:

Environment-configured admin setup command.

Example conceptual command:

npm run create-admin

The command should request credentials securely or use environment variables.

---

# 80. DEMO DATA

Provide optional safe sample college documents for local development only.

Clearly mark them as demo data.

Do not present fake college information as real information.

The production application must use actual uploaded college documents.

---

# 81. FINAL PRODUCT EXPERIENCE

The final application should feel like a real college digital assistant.

Student flow:

Landing/Login
↓
Student Dashboard
↓
Ask Question
↓
Question Processing
↓
RAG Retrieval
↓
AI Answer
↓
Sources
↓
Follow-up Question
↓
Conversation History

Admin flow:

Login
↓
Admin Dashboard
↓
Upload College Document
↓
Processing
↓
Embedding
↓
Vector Index
↓
Document Ready
↓
Student Query
↓
Retrieved Information

---

# 82. REQUIRED CORE FEATURES CHECKLIST

The following MUST be implemented:

* [ ] Chat interface
* [ ] User authentication
* [ ] Signup
* [ ] Login
* [ ] Logout
* [ ] Protected routes
* [ ] Document upload
* [ ] PDF/document processing
* [ ] Text extraction
* [ ] Text chunking
* [ ] Embedding generation
* [ ] Vector database
* [ ] Semantic search
* [ ] RAG pipeline
* [ ] AI-generated answers
* [ ] Source/reference display
* [ ] Unknown question handling
* [ ] Chat history
* [ ] Conversation context
* [ ] Admin document management
* [ ] Upload documents
* [ ] Update documents
* [ ] Delete documents
* [ ] Database integration
* [ ] CRUD operations
* [ ] Frontend/backend integration
* [ ] Input validation
* [ ] Error handling
* [ ] Loading states
* [ ] Environment variables
* [ ] GitHub-ready structure
* [ ] Deployment-ready application
* [ ] Vercel frontend
* [ ] Render backend
* [ ] MongoDB Atlas or Supabase
* [ ] README
* [ ] Screenshots section
* [ ] Live demo section
* [ ] Backend URL section
* [ ] Setup instructions
* [ ] Environment variable documentation
* [ ] No exposed secrets

---

# 83. BONUS FEATURES

Implement as many as realistically possible after all core features work:

* [ ] Multiple document collections
* [ ] Department-wise knowledge bases
* [ ] Admin dashboard
* [ ] Document version management
* [ ] Source highlighting
* [ ] Confidence/relevance score
* [ ] Multilingual chatbot
* [ ] Voice input
* [ ] Voice responses
* [ ] Conversation export
* [ ] Suggested questions
* [ ] Answer feedback
* [ ] Admin analytics
* [ ] Automatic document summarization
* [ ] OCR for scanned documents
* [ ] Hybrid keyword + semantic search
* [ ] Document re-ranking
* [ ] Role-based access
* [ ] AI-generated FAQs
* [ ] Streaming AI responses

IMPORTANT:

Do not sacrifice core functionality to implement bonuses.

Priority:

1. Core RAG
2. Authentication
3. Database
4. Document management
5. Working frontend/backend
6. Deployment
7. Bonus features

---

# 84. ANTIGRAVITY IMPLEMENTATION INSTRUCTIONS

You are the primary software engineering agent responsible for implementing this project.

Do not merely explain how to build it.

Actually create and modify the project files.

First inspect the existing project structure.

If files already exist:

* Understand them
* Preserve useful code
* Refactor where necessary
* Do not blindly overwrite working functionality

If the project is empty:

Create the complete project from scratch.

Work incrementally.

Recommended implementation order:

PHASE 1:
Project architecture

PHASE 2:
Frontend foundation

PHASE 3:
Backend foundation

PHASE 4:
MongoDB integration

PHASE 5:
Authentication

PHASE 6:
Document upload

PHASE 7:
Text extraction

PHASE 8:
Chunking

PHASE 9:
Embedding service

PHASE 10:
Vector database

PHASE 11:
RAG retrieval

PHASE 12:
LLM integration

PHASE 13:
Source references

PHASE 14:
Chat history

PHASE 15:
Admin dashboard

PHASE 16:
Document management

PHASE 17:
Validation and security

PHASE 18:
Responsive UI

PHASE 19:
Testing

PHASE 20:
Deployment preparation

PHASE 21:
Final verification

---

# 85. AUTONOMOUS DEBUGGING

After implementing each major feature:

1. Run the application
2. Check for errors
3. Fix TypeScript errors
4. Fix build errors
5. Fix API errors
6. Fix database errors
7. Fix frontend rendering errors
8. Verify the feature again

Do not stop after writing code.

Actually verify functionality.

If an error occurs, diagnose and fix the root cause rather than hiding the error.

---

# 86. API CONFIGURATION

Never hard-code API credentials.

Use environment variables.

If an API key is missing:

Return a clear configuration error.

Example:

"LLM provider is not configured. Add LLM_API_KEY to the backend environment."

Do not crash the entire application.

---

# 87. LOCAL DEVELOPMENT

The project must work locally before deployment.

Expected flow:

Terminal 1:

cd backend
npm install
npm run dev

Terminal 2:

cd frontend
npm install
npm run dev

Frontend should connect to backend using:

VITE_API_URL

Backend should connect to:

MongoDB Atlas
Vector database
Embedding provider
LLM provider

---

# 88. PRODUCTION CONFIGURATION

Production frontend:

Vercel

Production backend:

Render

Production database:

MongoDB Atlas

Production vector database:

Configured vector provider

Production AI:

Configured LLM provider

Production embeddings:

Configured embedding provider

Never rely on local machine files for production document persistence.

---

# 89. FINAL SECURITY CHECK

Before completion, search the entire repository for:

* API keys
* passwords
* tokens
* secret strings
* .env files
* private credentials

Remove anything sensitive.

Verify .gitignore.

Verify .env.example contains names only.

---

# 90. FINAL BUILD CHECK

Run:

Frontend build

Backend build

Tests

Lint if configured

Verify there are no blocking errors.

---

# 91. FINAL RAG TEST

Create at least one test document.

Example:

"Semester examinations will be conducted from 10 December 2026 to 20 December 2026."

Upload the document.

Verify:

Document
↓
Text extraction
↓
Chunk
↓
Embedding
↓
Vector database
↓
Question:
"When are semester examinations?"
↓
Retrieval
↓
Relevant chunk
↓
LLM
↓
Answer
↓
Source document

Then ask:

"What is the hostel fee?"

If the test document does not contain hostel fee information, the chatbot MUST say the information is unavailable.

This test is mandatory because it proves the system is genuinely RAG-based.

---

# 92. ACCEPTANCE CRITERIA

The project is complete ONLY when:

A student can:

1. Create an account
2. Login
3. Open chatbot
4. Ask a question
5. Backend receives question
6. Question embedding is generated
7. Vector search occurs
8. Relevant college chunks are retrieved
9. Context is passed to LLM
10. Grounded answer is generated
11. Real sources are displayed
12. Conversation is saved
13. Follow-up questions use conversation context
14. Unknown information is handled correctly
15. Logout works

An admin can:

1. Login
2. Open dashboard
3. Upload a document
4. See processing status
5. Extract text
6. Create chunks
7. Generate embeddings
8. Store vectors
9. View document
10. Update document
11. Reprocess document
12. Delete/archive document
13. Manage collections
14. View analytics if implemented

The application must:

* Have a working database
* Have a real vector database
* Have real semantic retrieval
* Have a real RAG pipeline
* Have working frontend/backend communication
* Have authentication
* Have validation
* Have error handling
* Have responsive UI
* Have environment configuration
* Build successfully
* Deploy successfully
* Not expose secrets
* Be understandable by the developer who submits it

---

# 93. IMPORTANT DEVELOPMENT RULE

Do NOT claim a feature is implemented unless it actually works.

Do NOT use fake data to simulate required backend functionality.

Do NOT replace the vector database with simple keyword matching.

Do NOT replace RAG with a normal LLM chatbot.

Do NOT expose API keys.

Do NOT put secrets in GitHub.

Do NOT leave broken buttons.

Do NOT leave TODO placeholders for core functionality.

Do NOT stop at UI implementation.

Do NOT create only a static frontend.

The final project must be a genuinely working full-stack RAG application.

---

# 94. PRIORITY RULE

If implementation complexity becomes high, follow this priority:

CRITICAL:

1. Working frontend
2. Working backend
3. Authentication
4. MongoDB
5. Document upload
6. Text extraction
7. Chunking
8. Embeddings
9. Vector database
10. Semantic search
11. RAG
12. LLM
13. Sources
14. Chat history
15. Admin document CRUD
16. Validation
17. Error handling
18. Deployment

THEN:

19. Collections
20. Departments
21. Version management
22. Feedback
23. Suggested questions
24. Analytics
25. Hybrid search
26. Re-ranking
27. OCR
28. Multilingual
29. Voice
30. Export
31. Streaming
32. AI FAQs
33. Summarization

---

# 95. FINAL INSTRUCTION TO ANTIGRAVITY

Build this project completely.

Do not respond with only instructions.

Inspect the repository.

Create the required architecture.

Implement the frontend.

Implement the backend.

Implement authentication.

Implement the database.

Implement document upload.

Implement document processing.

Implement text extraction.

Implement chunking.

Implement embeddings.

Implement the vector database.

Implement semantic search.

Implement the RAG pipeline.

Implement LLM integration.

Implement source references.

Implement unknown-question handling.

Implement chat history.

Implement conversation context.

Implement admin dashboard.

Implement document CRUD.

Implement validation.

Implement error handling.

Implement responsive design.

Implement security.

Implement environment configuration.

Implement deployment configuration.

Implement README.

Run and test the application.

Fix errors.

Verify the complete RAG flow.

Do not fake functionality.

Do not skip required features.

Do not expose secrets.

Do not stop at a prototype UI.

The final result must be a **working, advanced, production-ready RAG-Based College Chatbot** that can be deployed through:

GitHub → Vercel → Render → MongoDB Atlas + Vector Database + LLM/Embedding Providers.

After implementation, provide a concise final report containing:

* What was implemented
* Technology stack
* Folder structure
* Environment variables required
* How to run locally
* How to test RAG
* How to deploy
* Which bonus features were implemented
* Any remaining configuration required

Only mark the project complete after verifying the actual implementation.
