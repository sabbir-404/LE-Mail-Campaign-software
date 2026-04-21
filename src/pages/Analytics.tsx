import React, { useState, useEffect } from 'react';
import { LineChart, BarChart, ArrowUpRight, Clock, Users, Mail, RefreshCw, Eye } from 'lucide-react';
import clsx from 'clsx';

const Analytics: React.FC = () => {
  const [data, setData] = useState<{ campaigns: any[], logs: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    setLoading(true);
    try {
      const api = () => (window as any).electronAPI;
      const res = await api().fetchAnalytics();
      if (res?.success) {
        setData({ campaigns: res.campaigns, logs: res.logs });
        setError('');
      } else {
        setError(res?.error || 'Failed to fetch analytics from your server.');
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const totalCampaignsTracked = data?.campaigns.length || 0;
  const totalGlobalOpens = data?.campaigns.reduce((sum, c) => sum + parseInt(c.total_opens), 0) || 0;
  const uniqueGlobalOpens = data?.campaigns.reduce((sum, c) => sum + parseInt(c.unique_opens), 0) || 0;

  return (
    <div className="p-10 max-w-6xl mx-auto flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 border-b border-stone-200 pb-5 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-stone-900 flex items-center gap-3">
            <LineChart className="text-orange-500" size={32} />
            Analytics Overview
          </h2>
          <p className="text-stone-500 mt-2">Live open-rate tracking powered by your remote pixel server.</p>
        </div>
        <button 
          onClick={loadStats} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg shadow-sm text-stone-600 hover:text-orange-600 hover:border-orange-300 transition-all font-medium text-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={clsx(loading && 'animate-spin')} />
          Refresh Stats
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          Connection Error: {error} <br/>
          <span className="font-normal opacity-80">Ensure `tracker.php` is uploaded to your leadingedge.com.bd server and the internet is connected.</span>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8 shrink-0">
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-semibold text-stone-500 mb-1">Total Opens</div>
          <div className="text-3xl font-bold text-stone-900 flex items-baseline gap-2">
            {totalGlobalOpens} <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><ArrowUpRight size={12} className="inline mr-1"/>Live</span>
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-semibold text-stone-500 mb-1">Unique Check-ins</div>
          <div className="text-3xl font-bold text-stone-900">{uniqueGlobalOpens}</div>
          <div className="text-xs text-stone-400 mt-1">Distinct recipient devices/emails</div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-semibold text-stone-500 mb-1">Tracked Campaigns</div>
          <div className="text-3xl font-bold text-stone-900">{totalCampaignsTracked}</div>
        </div>
      </div>

      {/* Campaign Breakdowns */}
      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Left: Summary per campaign */}
        <div className="w-1/3 flex flex-col bg-white border border-stone-200 rounded-xl shadow-sm shrink-0 overflow-hidden">
          <div className="p-4 border-b border-stone-100 bg-stone-50 text-sm font-semibold text-stone-800 flex items-center gap-2">
            <BarChart size={16} className="text-orange-500" />
            Campaign Performance
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f8f5f2]/30">
            {!data?.campaigns.length && !loading && (
              <div className="text-center text-stone-400 p-8 text-sm">No campaigns tracked yet.</div>
            )}
            {data?.campaigns.map((c, i) => (
              <div key={i} className="bg-white border border-stone-200 p-4 rounded-lg shadow-sm">
                <div className="font-semibold text-stone-800 text-sm mb-3 flex items-center gap-2">
                  <Mail size={14} className="text-stone-400" /> Campaign #{c.campaign_id}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xl font-bold text-stone-700">{c.total_opens}</div>
                    <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mt-0.5">Total Opens</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-orange-600">{c.unique_opens}</div>
                    <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mt-0.5">Unique Opens</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Event Log */}
        <div className="flex-1 flex flex-col bg-white border border-stone-200 shadow-sm rounded-xl overflow-hidden min-h-0">
          <div className="p-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-stone-800 flex items-center gap-2">
              <Eye size={16} className="text-orange-500" />
              Recipient Interaction Log
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            <table className="w-full text-left text-sm text-stone-700">
              <thead className="bg-[#f8f5f2] border-b border-stone-200 text-xs uppercase text-stone-500 sticky top-0 backdrop-blur-sm z-10">
                <tr>
                  <th className="px-5 py-3 font-semibold">Recipient Email</th>
                  <th className="px-5 py-3 font-semibold">Campaign</th>
                  <th className="px-5 py-3 font-semibold text-center">Opens</th>
                  <th className="px-5 py-3 font-semibold">Last Checked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(!data?.logs || data.logs.length === 0) && !loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-stone-400">
                      No read receipts recorded yet.
                    </td>
                  </tr>
                ) : (
                  data?.logs.map((log, i) => (
                    <tr key={i} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-stone-800">{log.email}</td>
                      <td className="px-5 py-3.5 text-stone-500">#{log.campaign_id}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={clsx(
                          "px-2 py-0.5 rounded text-xs font-bold",
                          log.open_count > 1 ? "bg-orange-100 text-orange-700" : "bg-stone-100 text-stone-600"
                        )}>
                          {log.open_count}x
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-stone-500 text-xs flex items-center gap-1.5 pt-4">
                        <Clock size={12} className="text-stone-400" />
                        {new Date(log.last_opened).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
