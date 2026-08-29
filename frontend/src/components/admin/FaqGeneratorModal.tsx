import React, { useState, useEffect } from 'react';
import { Sparkles, HelpCircle, Loader2, Copy, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { documentApi } from '../../services/documentApi';
import { useToast } from '../../context/ToastContext';

interface FaqGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string | null;
}

export const FaqGeneratorModal: React.FC<FaqGeneratorModalProps> = ({
  isOpen,
  onClose,
  documentId,
}) => {
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string; category: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && documentId) {
      const fetchFaqs = async () => {
        try {
          setIsLoading(true);
          setFaqs([]);
          const res = await documentApi.getFAQs(documentId);
          setFaqs(res.faqs);
        } catch (err: any) {
          showToast(err.response?.data?.message || 'Failed to generate FAQs', 'error');
        } finally {
          setIsLoading(false);
        }
      };

      fetchFaqs();
    }
  }, [isOpen, documentId, showToast]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Generated Student FAQs" maxWidth="max-w-2xl">
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-300">Extracting frequent student questions & answers...</div>
            <div className="text-[11px] text-slate-500 mt-1">Grounding questions in document contents.</div>
          </div>
        ) : faqs.length > 0 ? (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                    <span>{faq.question}</span>
                  </div>
                  {faq.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium shrink-0">
                      {faq.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-5 font-normal">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            No FAQs generated for this document.
          </div>
        )}
      </div>
    </Modal>
  );
};
