import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, ExternalLink, Sparkles } from 'lucide-react';
import { SourceRef } from '../../types';

interface SourceReferencesProps {
  sources: SourceRef[];
}

export const SourceReferences: React.FC<SourceReferencesProps> = ({ sources }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState<SourceRef | null>(null);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-700/40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors w-full"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Retrieved Sources ({sources.length})</span>
        <span className="text-[10px] bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded font-mono">
          Verified Grounding
        </span>
        <div className="ml-auto text-slate-400">
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sources.map((source, index) => {
            const isHigh = source.relevanceScore >= 70;
            return (
              <div
                key={`${source.documentId}-${index}`}
                onClick={() => setSelectedSnippet(source)}
                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 cursor-pointer transition-all hover:shadow-lg group"
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileText className="w-4 h-4 text-brand-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-200 truncate group-hover:text-brand-300">
                      {source.documentTitle}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                      isHigh
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {source.relevanceScore}% match
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Page {source.pageNumber}</span>
                  <span className="text-brand-400 flex items-center gap-0.5 group-hover:underline">
                    View snippet <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Snippet Drawer/Modal */}
      {selectedSnippet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel rounded-2xl p-5 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-400" />
                  {selectedSnippet.documentTitle}
                </h4>
                <span className="text-[11px] text-slate-400">
                  Page {selectedSnippet.pageNumber} • Grounded Relevance: {selectedSnippet.relevanceScore}%
                </span>
              </div>
              <button
                onClick={() => setSelectedSnippet(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="mt-3 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Extracted Text Chunk</div>
              {selectedSnippet.snippet || 'No text snippet available.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
