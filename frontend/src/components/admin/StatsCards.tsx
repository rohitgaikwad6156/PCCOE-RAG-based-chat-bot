import React from 'react';
import { Files, Database, Users, HelpCircle, ThumbsUp, Activity, CheckCircle2, Clock } from 'lucide-react';
import { AdminStats } from '../../types';

interface StatsCardsProps {
  stats: AdminStats | null;
  isLoading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl glass-card animate-pulse" />
        ))}
      </div>
    );
  }

  const items = [
    {
      title: 'Knowledge Documents',
      value: stats.totalDocuments,
      subtitle: `${stats.processedDocuments} active / ${stats.processingDocuments} processing`,
      icon: Files,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10 border-brand-500/20',
    },
    {
      title: 'Indexed Vector Chunks',
      value: stats.totalChunks,
      subtitle: `${stats.vectorCount} embeddings in vector store`,
      icon: Database,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Student Questions Handled',
      value: stats.totalQuestions,
      subtitle: `${stats.totalUsers} registered users`,
      icon: HelpCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Feedback Satisfaction',
      value: `${stats.satisfactionRate}%`,
      subtitle: `${stats.positiveFeedback} 👍 / ${stats.negativeFeedback} 👎 ratings`,
      icon: ThumbsUp,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{item.title}</span>
              <div className={`p-2 rounded-xl border ${item.bg}`}>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold text-white tracking-tight">{item.value}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
