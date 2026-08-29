import React, { useState } from 'react';
import { Bot, User as UserIcon, Copy, Check, Volume2, ThumbsUp, ThumbsDown, ShieldAlert, Sparkles, GraduationCap } from 'lucide-react';
import { MessageItem } from '../../types';
import { SourceReferences } from './SourceReferences';
import { feedbackApi } from '../../services/feedbackApi';
import { useToast } from '../../context/ToastContext';

interface MessageBubbleProps {
  message: MessageItem;
  onSpeak: (text: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSpeak }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);
  const { showToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to clipboard', 'info');
  };

  const handleFeedback = async (type: 'positive' | 'negative') => {
    if (!message._id || feedbackGiven) return;
    try {
      await feedbackApi.submitFeedback({
        messageId: message._id,
        type,
      });
      setFeedbackGiven(type);
      showToast(type === 'positive' ? 'Thanks for the positive feedback!' : 'Feedback recorded', 'success');
    } catch (err) {
      showToast('Could not record feedback', 'error');
    }
  };

  return (
    <div className={`flex gap-3 max-w-4xl w-full mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for AI */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-brand-600/20 mt-1">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Message Content Container */}
      <div
        className={`relative rounded-2xl p-4 transition-all max-w-[85%] md:max-w-[75%] ${
          isUser
            ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-600/15 rounded-tr-sm'
            : 'glass-panel text-slate-100 shadow-xl rounded-tl-sm border border-slate-700/50'
        }`}
      >
        {/* Header/Confidence Indicator */}
        {!isUser && (
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <span>PCCOE Information Assistant</span>
              {message.isGrounded ? (
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" /> Grounded
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded-full">
                  <ShieldAlert className="w-2.5 h-2.5" /> General Notice
                </span>
              )}
            </div>

            {message.confidenceLabel && (
              <span className="text-[10px] text-slate-400">
                Confidence: <strong className="text-slate-200">{message.confidenceLabel}</strong>
              </span>
            )}
          </div>
        )}

        {/* Text Body */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap font-normal">
          {message.content}
        </div>

        {/* Source References */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceReferences sources={message.sources} />
        )}

        {/* Footer Actions */}
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 pt-1">
          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

          {!isUser && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onSpeak(message.content)}
                title="Read aloud"
                className="p-1 rounded-md hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleCopy}
                title="Copy answer"
                className="p-1 rounded-md hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => handleFeedback('positive')}
                disabled={feedbackGiven !== null}
                title="Helpful"
                className={`p-1 rounded-md transition-colors ${
                  feedbackGiven === 'positive'
                    ? 'text-emerald-400 bg-emerald-500/20'
                    : 'hover:text-emerald-400 hover:bg-slate-800/80'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleFeedback('negative')}
                disabled={feedbackGiven !== null}
                title="Not helpful"
                className={`p-1 rounded-md transition-colors ${
                  feedbackGiven === 'negative'
                    ? 'text-rose-400 bg-rose-500/20'
                    : 'hover:text-rose-400 hover:bg-slate-800/80'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Avatar for User */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
          <UserIcon className="w-4 h-4 text-slate-300" />
        </div>
      )}
    </div>
  );
};
