import React, { useState } from 'react';
import {
  FileText,
  RotateCw,
  Trash2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { DocumentItem } from '../../types';

interface DocumentTableProps {
  documents: DocumentItem[];
  isLoading: boolean;
  onReprocess: (id: string) => void;
  onDelete: (id: string) => void;
  onSummarize: (id: string) => void;
  onGenerateFaqs: (id: string) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  isLoading,
  onReprocess,
  onDelete,
  onSummarize,
  onGenerateFaqs,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs text-slate-400">Loading knowledge documents...</span>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-12 text-center glass-card rounded-2xl border border-slate-800">
        <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-300">No documents found</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Upload college notices, academic calendars, fee structures, or examination guidelines to train the chatbot.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 glass-card">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
          <tr>
            <th className="py-3 px-4">Document Title</th>
            <th className="py-3 px-4">Department</th>
            <th className="py-3 px-4">Collection</th>
            <th className="py-3 px-4">Version</th>
            <th className="py-3 px-4">Chunks</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
          {documents.map((doc) => {
            const isProcessed = doc.status === 'processed';
            const isProcessing = doc.status === 'processing';
            const isFailed = doc.status === 'failed';

            return (
              <tr key={doc._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-800 text-brand-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white max-w-xs truncate">{doc.title}</div>
                      <div className="text-[10px] text-slate-500">{doc.filename}</div>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="text-slate-300">{doc.department}</span>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-semibold">
                    {doc.collectionName}
                  </span>
                </td>

                <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400">
                  v{doc.version || 1}.0
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-mono text-slate-200">{doc.chunkCount || 0} chunks</span>
                  <div className="text-[10px] text-slate-500">{doc.pageCount || 1} pages</div>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  {isProcessed && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Indexed
                    </span>
                  )}
                  {isProcessing && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full animate-pulse">
                      <Clock className="w-3 h-3 animate-spin" /> {doc.processingStage || 'Processing'}
                    </span>
                  )}
                  {isFailed && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3" /> Failed
                    </span>
                  )}
                </td>

                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {isProcessed && (
                      <>
                        <button
                          onClick={() => onSummarize(doc._id)}
                          title="Generate Document Summary"
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onGenerateFaqs(doc._id)}
                          title="Generate FAQs"
                          className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => onReprocess(doc._id)}
                      title="Reprocess Document & Embeddings"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(doc._id)}
                      title="Delete document"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl max-w-sm w-full border border-rose-500/30 shadow-2xl">
            <h4 className="text-sm font-bold text-white">Delete Document?</h4>
            <p className="text-xs text-slate-400 mt-1">
              This will remove the document file, delete all stored text chunks, and purge its embeddings from the vector database.
            </p>
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-md shadow-rose-600/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
