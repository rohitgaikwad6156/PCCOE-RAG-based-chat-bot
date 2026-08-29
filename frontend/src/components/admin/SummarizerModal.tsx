import React, { useState, useEffect } from 'react';
import { BookOpen, Copy, Check, Loader2, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { documentApi } from '../../services/documentApi';
import { useToast } from '../../context/ToastContext';

interface SummarizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string | null;
}

export const SummarizerModal: React.FC<SummarizerModalProps> = ({
  isOpen,
  onClose,
  documentId,
}) => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && documentId) {
      const fetchSummary = async () => {
        try {
          setIsLoading(true);
          setSummary('');
          const res = await documentApi.getSummary(documentId);
          setSummary(res.summary);
        } catch (err: any) {
          showToast(err.response?.data?.message || 'Failed to generate document summary', 'error');
        } finally {
          setIsLoading(false);
        }
      };

      fetchSummary();
    }
  }, [isOpen, documentId, showToast]);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied summary to clipboard', 'info');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Document Summary & Insights" maxWidth="max-w-2xl">
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-300">Analyzing document structure & extracting insights...</div>
            <div className="text-[11px] text-slate-500 mt-1">This uses grounded LLM analysis over document chunks.</div>
          </div>
        ) : summary ? (
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Structured Summary
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto font-sans">
              {summary}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            No summary generated for this document.
          </div>
        )}
      </div>
    </Modal>
  );
};
