import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import clsx from 'clsx';

const MailHistory: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.getHistory().then((res: any) => {
        setCampaigns(res);
      });
    }
  }, []);

  useEffect(() => {
    if (selectedCampaignId && (window as any).electronAPI) {
      (window as any).electronAPI.getHistoryRecords(selectedCampaignId).then((res: any) => {
        setRecords(res);
      });
    }
  }, [selectedCampaignId]);

  return (
    <div className="p-10 max-w-6xl mx-auto flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-6 border-b border-slate-800 pb-4 shrink-0 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Database className="text-indigo-500" />
            Campaign History
          </h2>
          <p className="text-slate-400 mt-2">Immutable logs of past successful and failed delivery attempts.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Side: Campaign List */}
        <div className="w-1/3 flex flex-col min-h-0 bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden shrink-0">
          <div className="p-3 border-b border-slate-700/50 bg-slate-800 text-sm font-medium text-slate-300">
            Past Campaigns
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {campaigns.length === 0 ? (
              <div className="text-center text-sm text-slate-500 p-4">No campaigns run yet.</div>
            ) : (
              campaigns.map(c => (
                <div 
                  key={c.id} 
                  className={clsx(
                    "p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedCampaignId === c.id ? "bg-indigo-900/30 border-indigo-500/50" : "bg-slate-900/50 border-slate-800 hover:border-slate-600"
                  )}
                  onClick={() => setSelectedCampaignId(c.id)}
                >
                  <div className="font-medium text-slate-200 text-sm mb-1">{c.campaign_name}</div>
                  <div className="text-xs text-slate-400 flex justify-between">
                    <span>{new Date(c.started_at).toLocaleTimeString()}</span>
                    <span className={clsx(c.status === 'completed' ? 'text-emerald-400' : 'text-amber-400')}>
                      {c.status}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-3 text-xs">
                    <span className="text-slate-500">Total: {c.total_recipients}</span>
                    <span className="text-emerald-500">Sent: {c.sent_count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Detailed Records */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          {!selectedCampaignId ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Select a campaign to view details
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-700/50 bg-slate-800 flex justify-between items-center shrink-0">
                <h3 className="font-semibold text-slate-200">Delivery Records</h3>
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-sm focus-within:border-indigo-500 transition-colors">
                  <Search size={14} className="text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search emails..." 
                    className="bg-transparent border-none focus:outline-none w-32 text-slate-200" 
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-[#0a0f1c]/50 text-xs uppercase text-slate-500 sticky top-0 backdrop-blur-sm">
                    <tr>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Recipient</th>
                      <th className="px-4 py-3 font-medium">Sent At</th>
                      <th className="px-4 py-3 font-medium">Diagnostic</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                          No delivery records found.
                        </td>
                      </tr>
                    ) : (
                      records.map(r => (
                        <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3">
                            {r.status === 'sent' ? (
                              <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 w-max px-2 py-0.5 rounded text-xs font-medium border border-emerald-400/20">
                                <CheckCircle2 size={12} /> Sent
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-red-400 bg-red-400/10 w-max px-2 py-0.5 rounded text-xs font-medium border border-red-400/20">
                                <XCircle size={12} /> Failed
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs">{r.recipient_email}</td>
                          <td className="px-4 py-3 text-slate-500 flex items-center gap-2">
                            <Clock size={12} /> {new Date(r.sent_at).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-3 text-xs max-w-[200px] truncate" title={r.error_message || 'OK'}>
                            {r.error_message ? <span className="text-red-300">{r.error_message}</span> : <span className="text-slate-500">OK</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default MailHistory;
