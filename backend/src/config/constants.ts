export const RAG_CONFIG = {
  CHUNK_SIZE_CHAR: 1400,
  CHUNK_OVERLAP_CHAR: 150,
  TOP_K: 5,
  RELEVANCE_THRESHOLD: 0.38,
  MAX_CONTEXT_LENGTH: 4500,
  SIMILARITY_CUTOFF: 0.30,
};

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export const DEFAULT_COLLECTIONS = [
  'CAP Admissions & Cutoffs',
  'Autonomous Academic Regulations',
  'In-Sem & End-Sem Examinations',
  'T&P Placements & Internships',
  'MahaDBT & College Scholarships',
  'Nigdi Campus Hostels & Mess',
  'Central Library & IEEE Resources',
  'Student Clubs & Team Kratos Racing',
  'General College Circulars',
];

export const DEFAULT_DEPARTMENTS = [
  'All Departments',
  'Computer Engineering',
  'Information Technology',
  'Artificial Intelligence & Machine Learning',
  'Electronics & Telecommunication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Applied Sciences & Humanities (First Year)',
  'Master of Computer Applications (MCA)',
  'MBA & Management Studies',
];
