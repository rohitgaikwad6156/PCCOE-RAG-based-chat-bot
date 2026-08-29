import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MessageSquarePlus,
  MessageSquare,
  Trash2,
  FolderKanban,
  FileText,
  BarChart3,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { ConversationItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  conversations: ConversationItem[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside
      className={`border-r border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col transition-all duration-300 relative ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center shadow-md z-30"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* New Chat Button */}
      <div className="p-3 border-b border-slate-800">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-brand-600/15 transition-all"
        >
          <MessageSquarePlus className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>New Conversation</span>}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-3 border-b border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {!isCollapsed && (
          <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Recent Inquiries
          </div>
        )}

        {filtered.length === 0 && !isCollapsed && (
          <div className="px-3 py-6 text-center text-xs text-slate-500">
            No previous chats found.
          </div>
        )}

        {filtered.map((conv) => {
          const isActive = conv._id === activeConversationId;
          return (
            <div
              key={conv._id}
              onClick={() => onSelectConversation(conv._id)}
              className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                isActive
                  ? 'bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
                {!isCollapsed && <span className="truncate">{conv.title}</span>}
              </div>

              {!isCollapsed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv._id);
                  }}
                  title="Delete chat"
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation Links */}
      <div className="p-2 border-t border-slate-800 space-y-1">
        <Link
          to="/chat"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            location.pathname === '/chat'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-brand-400 shrink-0" />
          {!isCollapsed && <span>Chat Assistant</span>}
        </Link>

        {isAdmin && (
          <>
            <Link
              to="/admin"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                location.pathname === '/admin'
                  ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
              {!isCollapsed && <span>Admin Dashboard</span>}
            </Link>

            <Link
              to="/admin/documents"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                location.pathname === '/admin/documents'
                  ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
              {!isCollapsed && <span>Documents</span>}
            </Link>

            <Link
              to="/admin/analytics"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                location.pathname === '/admin/analytics'
                  ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0" />
              {!isCollapsed && <span>Analytics</span>}
            </Link>
          </>
        )}
      </div>
    </aside>
  );
};
