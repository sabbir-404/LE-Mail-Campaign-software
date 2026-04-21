import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, XCircle, Users, PenTool, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { PageView } from '../App';

interface DashboardProps {
  setCurrentPage: (page: PageView) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: string; sub?: string }> = ({ icon, label, value, color, sub }) => (
  <div className={clsx('rounded-xl border p-5 flex items-start gap-4 shadow-sm bg-white border-stone-200')}>
    <div className={clsx('p-3 rounded-lg', `bg-${color}-500/10 text-${color}-600`)}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-stone-900">{value.toLocaleString()}</div>
      <div className="text-sm text-stone-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-stone-400 mt-1">{sub}</div>}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
  const [stats, setStats] = useState<any>(null);

  const loadStats = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.getDashboardStats()
        .then((res: any) => setStats(res))
        .catch((err: any) => {
          console.error('Failed to load dashboard:', err);
          setStats({ totalSent:0, totalFailed:0, totalCampaigns:0, totalContacts:0, totalContactLists:0, totalDesigns:0, recentCampaigns:[] });
        });
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full text-stone-400">
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
        <h2 className="text-3xl font-bold text-stone-900">Dashboard</h2>
        <p className="text-stone-500 mt-1">Overview of your email campaign performance</p>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<Mail size={22} />} label="Total Emails Sent" value={stats.totalSent} color="orange" />
        <StatCard icon={<CheckCircle2 size={22} />} label="Successful Deliveries" value={stats.totalSent} color="emerald" sub={`${successRate}% success rate`} />
        <StatCard icon={<XCircle size={22} />} label="Failed Deliveries" value={stats.totalFailed} color="red" />
        <StatCard icon={<TrendingUp size={22} />} label="Total Campaigns Run" value={stats.totalCampaigns} color="violet" />
        <StatCard icon={<Users size={22} />} label="Total Contacts Stored" value={stats.totalContacts} color="cyan" sub={`across ${stats.totalContactLists} lists`} />
        <StatCard icon={<PenTool size={22} />} label="Mail Designs Created" value={stats.totalDesigns} color="amber" />
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white border border-stone-200 shadow-sm rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-semibold text-stone-800 flex items-center gap-2">
            <Clock size={16} className="text-stone-400" />
            Recent Campaigns
          </h3>
          <button
            onClick={() => setCurrentPage('history')}
            className="text-sm text-orange-600 hover:text-orange-500 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>

        {stats.recentCampaigns.length === 0 ? (
          <div className="p-10 text-center text-stone-400">
            <Mail size={32} className="mx-auto mb-3 opacity-30" />
            No campaigns run yet. <button onClick={() => setCurrentPage('campaign')} className="text-orange-500 hover:underline ml-1">Start one now →</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-stone-50/50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Campaign</th>
                <th className="px-6 py-3 text-left font-medium">Design</th>
                <th className="px-6 py-3 text-center font-medium">Total</th>
                <th className="px-6 py-3 text-center font-medium">Sent</th>
                <th className="px-6 py-3 text-center font-medium">Failed</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {stats.recentCampaigns.map((c: any) => (
                <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-stone-800 max-w-[180px] truncate">{c.campaign_name}</td>
                  <td className="px-6 py-4 text-stone-500 text-xs">{c.design_name || '—'}</td>
                  <td className="px-6 py-4 text-center text-stone-600">{c.total_recipients}</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-mono">{c.sent_count}</td>
                  <td className="px-6 py-4 text-center text-red-500 font-mono">{c.failed_count}</td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      'text-xs px-2 py-0.5 rounded-full border font-medium',
                      c.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      c.status === 'running' ? 'bg-orange-50 text-orange-600 border-orange-200 animate-pulse' :
                      'bg-amber-50 text-amber-600 border-amber-200'
                    )}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-400 text-xs">{new Date(c.started_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Start New Campaign', page: 'campaign' as PageView, icon: <Mail size={18} />, color: 'orange' },
          { label: 'Manage Contacts', page: 'contacts' as PageView, icon: <Users size={18} />, color: 'cyan' },
          { label: 'Create Design', page: 'design' as PageView, icon: <PenTool size={18} />, color: 'amber' },
        ].map(action => (
          <button
            key={action.page}
            onClick={() => setCurrentPage(action.page)}
            className={clsx(
              'flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all hover:scale-[1.02] active:scale-100 shadow-sm bg-white',
              `border-${action.color}-200 text-${action.color}-600 hover:bg-${action.color}-50`
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
