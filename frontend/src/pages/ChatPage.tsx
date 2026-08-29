import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  GraduationCap,
  Download,
  Trash2,
  Sparkles,
  Loader2,
  HelpCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { MessageBubble } from '../components/chat/MessageBubble';
import { SuggestedQuestions } from '../components/chat/SuggestedQuestions';
import { VoiceInput } from '../components/chat/VoiceInput';
import { ExportModal } from '../components/chat/ExportModal';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { chatApi } from '../services/chatApi';
import { ConversationItem, MessageItem } from '../types';
import { useToast } from '../context/ToastContext';

export const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [activeConversation, setActiveConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [isExportOpen, setIsExportOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const list = await chatApi.getConversations();
      setConversations(list);
    } catch (err) {
      console.warn('Could not load conversations:', err);
    }
  };

  useEffect(() => {
    if (activeConversationId) {
      const loadMessages = async () => {
        try {
          setIsLoadingMessages(true);
          const data = await chatApi.getConversationMessages(activeConversationId);
          setActiveConversation(data.conversation);
          setMessages(data.messages);
        } catch (err) {
          showToast('Failed to load conversation history', 'error');
        } finally {
          setIsLoadingMessages(false);
        }
      };
      loadMessages();
    } else {
      setActiveConversation(null);
      setMessages([]);
    }
  }, [activeConversationId, showToast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isSending) return;

    const userMessage: MessageItem = {
      conversationId: activeConversationId || '',
      role: 'user',
      content: textToSend.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsSending(true);

    try {
      const response = await chatApi.askQuestion({
        question: textToSend.trim(),
        conversationId: activeConversationId,
        departmentFilter,
      });

      const assistantMessage: MessageItem = {
        _id: response.messageId,
        conversationId: response.conversationId,
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        isGrounded: response.isGrounded,
        confidenceScore: response.confidenceScore,
        confidenceLabel: response.confidenceLabel,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (!activeConversationId) {
        setActiveConversationId(response.conversationId);
        fetchConversations();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Unable to process question right now.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(undefined);
    setActiveConversation(null);
    setMessages([]);
    stop();
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await chatApi.deleteConversation(id);
      showToast('Conversation deleted', 'info');
      if (activeConversationId === id) {
        handleNewChat();
      }
      fetchConversations();
    } catch (err) {
      showToast('Failed to delete conversation', 'error');
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar selectedDepartment={departmentFilter} onDepartmentChange={setDepartmentFilter} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => setActiveConversationId(id)}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
        />

        {/* Center Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-950/40 relative">
          {/* Top Bar of Active Conversation */}
          <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between glass-panel shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-white truncate">
              <GraduationCap className="w-4 h-4 text-brand-400 shrink-0" />
              <span className="truncate">
                {activeConversation?.title || 'PCCOE Pune Information Session'}
              </span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {departmentFilter}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {isSpeaking && (
                <button
                  onClick={stop}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop Speech</span>
                </button>
              )}

              {messages.length > 0 && (
                <button
                  onClick={() => setIsExportOpen(true)}
                  title="Export Transcript"
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              )}

              {activeConversationId && (
                <button
                  onClick={() => handleDeleteConversation(activeConversationId)}
                  title="Clear & Delete Conversation"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {isLoadingMessages ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
                  <span className="text-xs text-slate-400">Loading conversation messages...</span>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="max-w-2xl mx-auto my-auto text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-600/20">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  PCCOE Pune Digital Information Assistant
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                  Ask any questions regarding Autonomous End-Sem & In-Sem examinations, DTE Code 6175 CAP cutoffs, T&P placement packages, MahaDBT EBC scholarships, or Nigdi campus hostels.
                </p>

                <div className="mt-8">
                  <SuggestedQuestions onSelect={(q) => handleSendMessage(q)} department={departmentFilter} />
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <MessageBubble key={index} message={msg} onSpeak={speak} />
                ))}

                {isSending && (
                  <div className="flex gap-3 max-w-4xl w-full mx-auto justify-start">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-brand-600/20 mt-1">
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <div className="glass-panel rounded-2xl p-4 text-slate-300 text-xs shadow-xl border border-slate-700/50 flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
                      <span className="font-semibold text-slate-200">
                        Searching PCCOE vector store & grounding response...
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-800 glass-panel shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="max-w-4xl mx-auto flex items-center gap-2"
            >
              <div className="flex-1 relative flex items-center bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3 py-1.5 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 shadow-inner transition-all">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a question about PCCOE exams, placements, admissions, MahaDBT..."
                  disabled={isSending}
                  className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none py-1.5"
                />

                <VoiceInput onTranscript={handleVoiceTranscript} />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="p-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        conversation={activeConversation}
        messages={messages}
      />
    </div>
  );
};
