import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  UploadCloud,
  FileText,
  Database,
  Users,
  Activity,
  ArrowRight,
  Sparkles,
  Layers,
  RotateCw,
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { StatsCards } from '../components/admin/StatsCards';
import { DocumentTable } from '../components/admin/DocumentTable';
import { UploadModal } from '../components/admin/UploadModal';
import { SummarizerModal } from '../components/admin/SummarizerModal';
import { FaqGeneratorModal } from '../components/admin/FaqGeneratorModal';
import { adminApi } from '../services/adminApi';
import { documentApi } from '../services/documentApi';
import { collectionApi } from '../services/collectionApi';
import { AdminStats, DocumentItem } from '../types';
import { useToast } from '../context/ToastContext';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [collections, setCollections] = useState<Array<{ name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeSummaryDocId, setActiveSummaryDocId] = useState<string | null>(null);
  const [activeFaqDocId, setActiveFaqDocId] = useState<string | null>(null);

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsData, docsData, colData] = await Promise.all([
        adminApi.getStats(),
        documentApi.getDocuments({ limit: 10 }),
        collectionApi.getCollections(),
      ]);

      setStats(statsData);
      setDocuments(docsData.documents);
      setDepartments(colData.departments);
      setCollections(colData.collections);
    } catch (err) {
      showToast('Could not fetch administrator metrics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReprocess = async (id: string) => {
    try {
      await documentApi.reprocessDocument(id);
      showToast('Document re-indexing triggered', 'info');
      loadData();
    } catch (err) {
      showToast('Failed to reprocess document', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await documentApi.deleteDocument(id);
      showToast('Document and embeddings deleted', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to delete document', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Administrator Control Center
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                Live Knowledge Base
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Manage uploaded documents, vector store indexes, collections, and student query analytics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Refresh Stats"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-600/20 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <StatsCards stats={stats} isLoading={isLoading} />

        {/* Quick Links Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/documents"
            className="p-4 rounded-2xl glass-card border border-slate-800 hover:border-brand-500/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-brand-300">
                  Document Repository
                </div>
                <div className="text-[11px] text-slate-400">Search, filter & re-index files</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/admin/collections"
            className="p-4 rounded-2xl glass-card border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-indigo-300">
                  Collections & Depts
                </div>
                <div className="text-[11px] text-slate-400">Organize knowledge branches</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/admin/analytics"
            className="p-4 rounded-2xl glass-card border border-slate-800 hover:border-teal-500/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-teal-300">
                  Query Intelligence
                </div>
                <div className="text-[11px] text-slate-400">Topics & sentiment analysis</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Recent Uploads Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" />
              <span>Recent College Knowledge Documents</span>
            </h2>
            <Link
              to="/admin/documents"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300"
            >
              View All ({stats?.totalDocuments || 0})
            </Link>
          </div>

          <DocumentTable
            documents={documents}
            isLoading={isLoading}
            onReprocess={handleReprocess}
            onDelete={handleDelete}
            onSummarize={(id) => setActiveSummaryDocId(id)}
            onGenerateFaqs={(id) => setActiveFaqDocId(id)}
          />
        </div>
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={loadData}
        departments={departments}
        collections={collections}
      />

      {/* Summarizer Modal */}
      <SummarizerModal
        isOpen={activeSummaryDocId !== null}
        onClose={() => setActiveSummaryDocId(null)}
        documentId={activeSummaryDocId}
      />

      {/* FAQ Generator Modal */}
      <FaqGeneratorModal
        isOpen={activeFaqDocId !== null}
        onClose={() => setActiveFaqDocId(null)}
        documentId={activeFaqDocId}
      />
    </div>
  );
};
