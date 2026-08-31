import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { DocumentTable } from '../components/admin/DocumentTable';
import { UploadModal } from '../components/admin/UploadModal';
import { SummarizerModal } from '../components/admin/SummarizerModal';
import { FaqGeneratorModal } from '../components/admin/FaqGeneratorModal';
import { documentApi } from '../services/documentApi';
import { collectionApi } from '../services/collectionApi';
import { DocumentItem } from '../types';
import { useToast } from '../context/ToastContext';

export const AdminDocumentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCollectionParam = searchParams.get('collection') || 'All Collections';

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [collections, setCollections] = useState<Array<{ name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedCollection, setSelectedCollection] = useState(initialCollectionParam);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeSummaryDocId, setActiveSummaryDocId] = useState<string | null>(null);
  const [activeFaqDocId, setActiveFaqDocId] = useState<string | null>(null);

  const { showToast } = useToast();

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await documentApi.getDocuments({
        search: searchTerm || undefined,
        department: selectedDept !== 'All Departments' ? selectedDept : undefined,
        collectionName: selectedCollection !== 'All Collections' ? selectedCollection : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        page: currentPage,
        limit: 15,
      });

      setDocuments(res.documents);
      setTotalPages(res.pagination.pages);
    } catch (err) {
      showToast('Failed to load documents', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    collectionApi.getCollections().then((data) => {
      setDepartments(data.departments);
      setCollections(data.collections);
    });
  }, []);

  useEffect(() => {
    const colParam = searchParams.get('collection');
    if (colParam) {
      setSelectedCollection(colParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchDocuments();
  }, [searchTerm, selectedDept, selectedCollection, selectedStatus, currentPage]);

  const handleReprocess = async (id: string) => {
    try {
      await documentApi.reprocessDocument(id);
      showToast('Reprocessing started', 'info');
      fetchDocuments();
    } catch (err) {
      showToast('Reprocessing failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await documentApi.deleteDocument(id);
      showToast('Document deleted', 'success');
      fetchDocuments();
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Link to="/admin" className="text-slate-400 hover:text-white text-xs font-semibold">
                Admin
              </Link>
              <span className="text-slate-600">/</span>
              <h1 className="text-xl font-bold text-white tracking-tight">Document Repository</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Upload, inspect text chunks, trigger semantic re-indexing, and manage version history.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-600/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Document</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search documents by title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="All Departments">All Departments</option>
              {departments.map((d, i) => (
                <option key={i} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedCollection}
              onChange={(e) => {
                setSelectedCollection(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="All Collections">All Collections</option>
              {collections.map((c, i) => (
                <option key={i} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="processed">Indexed (Ready)</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Documents Table */}
        <DocumentTable
          documents={documents}
          isLoading={isLoading}
          onReprocess={handleReprocess}
          onDelete={handleDelete}
          onSummarize={(id) => setActiveSummaryDocId(id)}
          onGenerateFaqs={(id) => setActiveFaqDocId(id)}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-2 text-xs text-slate-400">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchDocuments}
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
