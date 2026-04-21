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
      
      <div className="mb-6 border-b border-stone-200 pb-4 shrink-0 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-stone-900 flex items-center gap-3">
            <Database className="text-orange-500" />
            Campaign History
          </h2>
          <p className="text-stone-500 mt-2">Immutable logs of past successful and failed delivery attempts.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Side: Campaign List */}
        <div className="w-1/3 flex flex-col min-h-0 bg-white border border-stone-200 rounded-xl overflow-hidden shrink-0 shadow-sm">
          <div className="p-3 border-b border-stone-100 bg-stone-50 text-sm font-semibold text-stone-700">
            Past Campaigns
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-[#f8f5f2]/30">
            {campaigns.length === 0 ? (
              <div className="text-center text-sm text-stone-400 p-4">No campaigns run yet.</div>
            ) : (
              campaigns.map(c => (
                <div 
                  key={c.id} 
                  className={clsx(
                    "p-3 rounded-lg border cursor-pointer transition-colors shadow-sm",
                    selectedCampaignId === c.id ? "bg-orange-50 border-orange-200" : "bg-white border-stone-200 hover:border-orange-300"
                  )}
                  onClick={() => setSelectedCampaignId(c.id)}
                >
                  <div className="font-semibold text-stone-800 text-sm mb-1">{c.campaign_name}</div>
                  <div className="text-xs text-stone-500 flex justify-between font-medium">
                    <span>{new Date(c.started_at).toLocaleTimeString()}</span>
                    <span className={clsx(c.status === 'completed' ? 'text-emerald-600' : 'text-amber-600')}>
                      {c.status}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-3 text-xs font-medium">
                    <span className="text-stone-500">Total: {c.total_recipients}</span>
                    <span className="text-emerald-600">Sent: {c.sent_count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Detailed Records */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-stone-200 shadow-sm rounded-xl overflow-hidden">
          {!selectedCampaignId ? (
            <div className="flex-1 flex items-center justify-center text-stone-400">
              Select a campaign to view details
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center shrink-0">
                <h3 className="font-semibold text-stone-800">Delivery Records</h3>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-stone-200 text-sm focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-colors shadow-sm">
                  <Search size={14} className="text-stone-400" />
                  <input 
                    type="text" 
                    placeholder="Search emails..." 
                    className="bg-transparent border-none focus:outline-none w-32 text-stone-800 placeholder:text-stone-400" 
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-white">
                <table className="w-full text-left text-sm text-stone-700">
                  <thead className="bg-[#f8f5f2] border-b border-stone-200 text-xs uppercase text-stone-500 sticky top-0 backdrop-blur-sm z-10">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Recipient</th>
                      <th className="px-4 py-3 font-semibold">Sent At</th>
                      <th className="px-4 py-3 font-semibold">Diagnostic</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-stone-400">
                          No delivery records found.
                        </td>
                      </tr>
                    ) : (
                      records.map(r => (
                        <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-4 py-3">
                            {r.status === 'sent' ? (
                              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 w-max px-2 py-0.5 rounded text-xs font-semibold border border-emerald-200">
                                <CheckCircle2 size={12} /> Sent
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-red-700 bg-red-50 w-max px-2 py-0.5 rounded text-xs font-semibold border border-red-200">
                                <XCircle size={12} /> Failed
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs font-medium text-stone-800">{r.recipient_email}</td>
                          <td className="px-4 py-3 text-stone-500 flex items-center gap-2 font-medium">
                            <Clock size={12} /> {new Date(r.sent_at).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-3 text-xs max-w-[200px] truncate font-medium" title={r.error_message || 'OK'}>
                            {r.error_message ? <span className="text-red-500">{r.error_message}</span> : <span className="text-stone-400">OK</span>}
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
