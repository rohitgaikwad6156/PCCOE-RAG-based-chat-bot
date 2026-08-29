import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, RotateCw, PieChart } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { adminApi } from '../services/adminApi';
import { AdminAnalytics, TopicAnalytic } from '../types';
import { useToast } from '../context/ToastContext';

export const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      showToast('Failed to load analytics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Link to="/admin" className="text-slate-400 hover:text-white text-xs font-semibold">
                Admin
              </Link>
              <span className="text-slate-600">/</span>
              <h1 className="text-xl font-bold text-white tracking-tight">Query Intelligence & Analytics</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Analyze frequent student inquiry topics, sentiment metrics, and knowledge gaps.
            </p>
          </div>

          <button
            onClick={loadAnalytics}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Analytics Topic Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-400" />
              <span>Inquiry Topics Distribution</span>
            </h2>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-500">Loading topic analytics...</div>
            ) : analytics && analytics.topics.length > 0 ? (
              <div className="space-y-3 pt-2">
                {analytics.topics.map((t: TopicAnalytic, idx: number) => {
                  const percent = analytics.totalAnalyzed > 0
                    ? Math.round((t.count / analytics.totalAnalyzed) * 100)
                    : 0;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">{t.topic}</span>
                        <span className="font-mono text-slate-400">{t.count} queries ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percent, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">No question data recorded yet.</div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" />
                <span>Knowledge Base Insights</span>
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                RAG queries with highest grounding rates correspond to official circulars in Admissions, Examinations, and Hostel fee schedules.
              </p>

              <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                <div className="font-semibold text-slate-200">Recommended Next Steps:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>Upload the Spring 2027 Academic Schedule before semester registrations begin.</li>
                  <li>Verify that Bus/Transport circulars are added under General Policies.</li>
                  <li>Review low-confidence queries to identify missing circulars.</li>
                </ul>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800">
              Total Queries Analyzed: <strong className="text-slate-300">{analytics?.totalAnalyzed || 0}</strong>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
