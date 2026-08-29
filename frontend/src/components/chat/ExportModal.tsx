import React from 'react';
import { FileText, Download, Code, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Modal } from '../common/Modal';
import { MessageItem, ConversationItem } from '../../types';
import { useToast } from '../../context/ToastContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: ConversationItem | null;
  messages: MessageItem[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  conversation,
  messages,
}) => {
  const { showToast } = useToast();

  const exportAsTxt = () => {
    if (!conversation) return;
    let txt = `====================================================\n`;
    txt += `Apex College Digital Assistant — Chat Transcript\n`;
    txt += `Session: ${conversation.title}\n`;
    txt += `Exported At: ${new Date().toLocaleString()}\n`;
    txt += `====================================================\n\n`;

    messages.forEach((m) => {
      txt += `[${new Date(m.createdAt).toLocaleTimeString()}] ${m.role === 'user' ? 'Student' : 'Apex AI Assistant'}:\n`;
      txt += `${m.content}\n\n`;
      if (m.sources && m.sources.length > 0) {
        txt += `Cited Sources:\n`;
        m.sources.forEach((s) => {
          txt += `  - ${s.documentTitle} (Page ${s.pageNumber}) [${s.relevanceScore}% match]\n`;
        });
        txt += `\n`;
      }
      txt += `----------------------------------------------------\n\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `college-chat-${conversation._id.slice(-6)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded conversation as TXT', 'success');
    onClose();
  };

  const exportAsJson = () => {
    if (!conversation) return;
    const data = {
      conversation,
      messages,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `college-chat-${conversation._id.slice(-6)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded conversation as JSON', 'success');
    onClose();
  };

  const exportAsPdf = () => {
    if (!conversation) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.setTextColor(14, 140, 233);
      doc.text('Apex College Digital Assistant', 14, 18);

      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Topic: ${conversation.title}`, 14, 25);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 31);
      doc.line(14, 35, 196, 35);

      let yPos = 42;
      doc.setFontSize(10);

      messages.forEach((m) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        const isUser = m.role === 'user';
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(isUser ? 30 : 14, isUser ? 100 : 140, isUser ? 200 : 233);
        doc.text(isUser ? 'Student:' : 'Apex Information Assistant:', 14, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 40);
        const splitText = doc.splitTextToSize(m.content, 180);
        doc.text(splitText, 14, yPos);
        yPos += splitText.length * 5 + 6;
      });

      doc.save(`college-chat-${conversation._id.slice(-6)}.pdf`);
      showToast('Generated and downloaded PDF transcript', 'success');
      onClose();
    } catch (err: any) {
      showToast(`PDF generation failed: ${err.message}`, 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Conversation Transcript">
      <div className="space-y-3 py-2">
        <p className="text-xs text-slate-400">
          Export your complete conversation with source citations and verified college document references.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={exportAsPdf}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 hover:bg-brand-500/10 text-white transition-all group"
          >
            <FileDown className="w-8 h-8 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">PDF Document</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Formatted PDF file</span>
          </button>

          <button
            onClick={exportAsTxt}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 hover:bg-brand-500/10 text-white transition-all group"
          >
            <FileText className="w-8 h-8 text-brand-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Plain Text (.txt)</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Simple text transcript</span>
          </button>

          <button
            onClick={exportAsJson}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 hover:bg-brand-500/10 text-white transition-all group"
          >
            <Code className="w-8 h-8 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Structured JSON</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Machine-readable data</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
