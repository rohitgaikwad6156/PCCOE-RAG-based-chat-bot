import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Database,
  Search,
  ArrowRight,
  FileText,
  Award,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Badges Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official RAG AI Assistant</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold shadow-sm">
              <Award className="w-3.5 h-3.5" />
              <span>Autonomous • NAAC 'A++' Grade</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Nigdi, Pune (DTE: 6175)</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Instant, Verified Answers for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-400 to-teal-300">
              PCCOE Pune
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Get instant grounded information for <strong>Pimpri Chinchwad College of Engineering</strong>. In-Sem & End-Sem exam dates, DTE Code 6175 CAP cutoff details, T&P placement stats, MahaDBT scholarships, and hostel regulations with verified official citations.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={user ? '/chat' : '/signup'}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-600/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>{user ? 'Open Student Assistant' : 'Get Started as PCCOE Student'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm transition-all"
            >
              Administrator Portal
            </Link>
          </div>

          {/* Key PCCOE Highlights Banner */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">DTE Choice Code</div>
              <div className="text-xl font-bold text-brand-400 mt-0.5">6175</div>
              <div className="text-[11px] text-slate-500">Autonomous CAP Admissions</div>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Highest Placement</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">Rs. 61.0 LPA</div>
              <div className="text-[11px] text-slate-500">650+ Recruiters Visiting</div>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Average Package</div>
              <div className="text-xl font-bold text-indigo-400 mt-0.5">Rs. 8.4 LPA</div>
              <div className="text-[11px] text-slate-500">Across Engineering Branches</div>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Accreditation</div>
              <div className="text-xl font-bold text-amber-400 mt-0.5">NAAC 'A++'</div>
              <div className="text-[11px] text-slate-500">Affiliated to SPPU Pune</div>
            </div>
          </div>

          {/* Interactive RAG Pipeline Visualization */}
          <div className="mt-8 p-6 glass-panel rounded-3xl border border-slate-800 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-xs text-white">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Verified PCCOE RAG Retrieval Execution Flow</span>
              </div>
              <span className="text-[11px] font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">
                Zero-Hallucination Policy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-brand-400 text-xs font-bold mb-1">
                  <FileText className="w-4 h-4" /> 1. Official Ingestion
                </div>
                <p className="text-[11px] text-slate-400">
                  PCCOE notices, academic handbooks, exam circulars, and fee charts parsed with page preservation.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
                  <Database className="w-4 h-4" /> 2. Vector Indexing
                </div>
                <p className="text-[11px] text-slate-400">
                  Document chunks converted into dense vectors with departmental tags.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-teal-400 text-xs font-bold mb-1">
                  <Search className="w-4 h-4" /> 3. Semantic Retrieval
                </div>
                <p className="text-[11px] text-slate-400">
                  Cosine similarity search matches questions to official Autonomous circulars.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" /> 4. Grounded Output
                </div>
                <p className="text-[11px] text-slate-400">
                  Generates accurate, citation-backed answers with exact page numbers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800/80">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Campus Intelligence for Students & Staff
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Everything you need for transparent, verified information at PCCOE Pune.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-brand-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Autonomous Exam Rules</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                In-Sem (ISE) and End-Sem (ESE) schedules, 75% attendance criteria, grading scales, and re-examination rules grounded in official PCCOE circulars.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-indigo-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">T&P Placement Insights</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Branch-wise statistics for Computer, IT, AI&ML, E&TC, Mechanical, and Civil with hiring criteria for Microsoft, Barclays, ZF, and Veritas.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-teal-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">MahaDBT & Hostel Portal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Step-by-step guidance for EBC 50% tuition waiver, TFWS, SC/ST/OBC freeships, and Nigdi campus hostel room allotment procedures.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500">
        <p>© 2026 Pimpri Chinchwad College of Engineering (PCCOE), Nigdi, Pune. RAG Digital Information Assistant.</p>
      </footer>
    </div>
  );
};
