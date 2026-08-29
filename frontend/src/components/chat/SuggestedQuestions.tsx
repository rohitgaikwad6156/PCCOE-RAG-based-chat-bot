import React from 'react';
import { Sparkles } from 'lucide-react';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  department?: string;
}

const PCCOE_SUGGESTIONS = [
  'What is the PCCOE DTE Choice Code and CAP admission process?',
  'When are the Autonomous Winter End-Semester (ESE) examinations?',
  'What are the highest and average placement statistics at PCCOE?',
  'How can students apply for the MahaDBT EBC scholarship at PCCOE?',
  'What are the hostel and mess fees at the Nigdi campus?',
  'Tell me about Team Kratos Racing and student technical chapters.',
];

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ onSelect }) => {
  return (
    <div className="py-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2 px-1">
        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
        <span>Popular PCCOE Pune Student Inquiries:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {PCCOE_SUGGESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(q)}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 hover:border-brand-500/50 hover:bg-brand-500/10 text-slate-300 hover:text-white transition-all text-left"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};
