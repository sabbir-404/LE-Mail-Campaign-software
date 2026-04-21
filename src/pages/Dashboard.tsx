import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, XCircle, Users, Layers, PenTool, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { PageView } from '../App';

interface DashboardProps {
  setCurrentPage: (page: PageView) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: string; sub?: string }> = ({ icon, label, value, color, sub }) => (
  <div className={clsx('rounded-xl border p-5 flex items-start gap-4', `bg-${color}-500/5 border-${color}-500/20`)}>
    <div className={clsx('p-3 rounded-lg', `bg-${color}-500/15 text-${color}-400`)}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-100">{value.toLocaleString()}</div>
      <div className="text-sm text-slate-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
  const [stats, setStats] = useState<any>(null);

  const loadStats = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.getDashboardStats().then((res: any) => setStats(res));
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  const successRate = stats.totalSent + stats.totalFailed > 0
    ? Math.round((stats.totalSent / (stats.totalSent + stats.totalFailed)) * 100)
    : 0;

  return (
    <div className="p-10 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-100">Dashboard</h2>
        <p className="text-slate-400 mt-1">Overview of your email campaign performance</p>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<Mail size={22} />} label="Total Emails Sent" value={stats.totalSent} color="indigo" />
        <StatCard icon={<CheckCircle2 size={22} />} label="Successful Deliveries" value={stats.totalSent} color="emerald" sub={`${successRate}% success rate`} />
        <StatCard icon={<XCircle size={22} />} label="Failed Deliveries" value={stats.totalFailed} color="red" />
        <StatCard icon={<TrendingUp size={22} />} label="Total Campaigns Run" value={stats.totalCampaigns} color="violet" />
        <StatCard icon={<Users size={22} />} label="Total Contacts Stored" value={stats.totalContacts} color="cyan" sub={`across ${stats.totalContactLists} lists`} />
        <StatCard icon={<PenTool size={22} />} label="Mail Designs Created" value={stats.totalDesigns} color="amber" />
      </div>

      {/* Recent Campaigns */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            Recent Campaigns
          </h3>
          <button
            onClick={() => setCurrentPage('history')}
            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>

        {stats.recentCampaigns.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <Mail size={32} className="mx-auto mb-3 opacity-30" />
            No campaigns run yet. <button onClick={() => setCurrentPage('campaign')} className="text-indigo-400 hover:underline ml-1">Start one now →</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left">Campaign</th>
                <th className="px-6 py-3 text-left">Design</th>
                <th className="px-6 py-3 text-center">Total</th>
                <th className="px-6 py-3 text-center">Sent</th>
                <th className="px-6 py-3 text-center">Failed</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {stats.recentCampaigns.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200 max-w-[180px] truncate">{c.campaign_name}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{c.design_name || '—'}</td>
                  <td className="px-6 py-4 text-center text-slate-300">{c.total_recipients}</td>
                  <td className="px-6 py-4 text-center text-emerald-400 font-mono">{c.sent_count}</td>
                  <td className="px-6 py-4 text-center text-red-400 font-mono">{c.failed_count}</td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      'text-xs px-2 py-0.5 rounded-full border font-medium',
                      c.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      c.status === 'running' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    )}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{new Date(c.started_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Start New Campaign', page: 'campaign' as PageView, icon: <Mail size={18} />, color: 'indigo' },
          { label: 'Manage Contacts', page: 'contacts' as PageView, icon: <Users size={18} />, color: 'cyan' },
          { label: 'Create Design', page: 'design' as PageView, icon: <PenTool size={18} />, color: 'amber' },
        ].map(action => (
          <button
            key={action.page}
            onClick={() => setCurrentPage(action.page)}
            className={clsx(
              'flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all hover:scale-[1.02] active:scale-100',
              `bg-${action.color}-500/5 border-${action.color}-500/20 text-${action.color}-400 hover:bg-${action.color}-500/10`
            )}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
