import React, { useState, useEffect, useRef } from 'react';
import { Play, StopCircle, FileSpreadsheet, FileCode2, Loader2, Users } from 'lucide-react';
import clsx from 'clsx';

interface CampaignStatus {
  isRunning: boolean;
  total: number;
  sent: number;
  failed: number;
  currentEmail: string;
}

const Campaign: React.FC = () => {
  const [designs, setDesigns] = useState<any[]>([]);
  const [contactLists, setContactLists] = useState<any[]>([]);

  const [selectedDesignId, setSelectedDesignId] = useState<string>('');
  const [recipientMode, setRecipientMode] = useState<'list' | 'csv'>('list');
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const [delay, setDelay] = useState<number>(3);
  const [logs, setLogs] = useState<{ time: string; msg: string; type: 'info' | 'success' | 'error' }[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<CampaignStatus>({
    isRunning: false, total: 0, sent: 0, failed: 0, currentEmail: ''
  });

  const api = () => (window as any).electronAPI;

  const load = () => {
    api()?.getDesigns().then((res: any[]) => {
      setDesigns(res);
      if (res.length > 0) setSelectedDesignId(res[0].id.toString());
    });
    api()?.getContactLists().then((res: any[]) => {
      setContactLists(res);
      if (res.length > 0) setSelectedListId(res[0].id.toString());
    });
  };

  useEffect(() => {
    load();
    if (api()) {
      api().onCampaignInit(({ total }: any) => setStatus(prev => ({ ...prev, total })));
      api().onCampaignLog(({ type, msg }: any) => addLog(msg, type));
      api().onCampaignProgress(({ sent, failed, currentEmail }: any) =>
        setStatus(prev => ({ ...prev, sent, failed, currentEmail })));
      api().onCampaignStopped(() =>
        setStatus(prev => ({ ...prev, isRunning: false, currentEmail: 'Finished' })));
    }
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }]);
  };

  const selectedDesign = designs.find(d => d.id.toString() === selectedDesignId);

  const handleStart = () => {
    if (!selectedDesign) { addLog('Select a Mail Design first.', 'error'); return; }
    if (recipientMode === 'list' && !selectedListId) { addLog('Select a Contact List first.', 'error'); return; }
    if (recipientMode === 'csv' && !csvFile) { addLog('Upload a CSV file first.', 'error'); return; }

    setStatus({ isRunning: true, total: 0, sent: 0, failed: 0, currentEmail: 'Initializing...' });
    setLogs([]);
    addLog('Starting campaign...', 'info');

    api()?.startCampaign({
      designId: selectedDesign.id,
      designData: selectedDesign,
      contactListId: recipientMode === 'list' ? parseInt(selectedListId) : null,
      csvPath: recipientMode === 'csv' ? (csvFile as any).path : null,
      delay,
      subject: selectedDesign.subject,
    });
  };

  const handleStop = () => {
    api()?.stopCampaign();
    setStatus(prev => ({ ...prev, isRunning: false, currentEmail: 'Stopping...' }));
    addLog('Stop signal sent.', 'info');
  };

  const progressPercent = status.total > 0
    ? Math.round(((status.sent + status.failed) / status.total) * 100)
    : 0;

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col h-full animate-in fade-in duration-500">

      {/* Header Row */}
      <div className="mb-6 border-b border-slate-800 pb-4 shrink-0 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Campaign Engine</h2>
          <p className="text-slate-400 mt-1">Configure and launch your email campaigns.</p>
        </div>
        <div className="flex items-end gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Delay between emails (sec)</label>
            <input type="number" value={delay} min={1} onChange={e => setDelay(Number(e.target.value))}
              className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-center text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          {!status.isRunning ? (
            <button onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
              <Play size={16} fill="currentColor" /> Start Campaign
            </button>
          ) : (
            <button onClick={handleStop}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg shadow-lg shadow-red-600/20 transition-all animate-pulse">
              <StopCircle size={16} /> Stop Engine
            </button>
          )}
        </div>
      </div>

      {/* Config Row */}
      <div className="grid grid-cols-2 gap-5 mb-5 shrink-0">

        {/* Design Selector */}
        <div className={clsx('border rounded-xl p-5 transition-colors', selectedDesign ? 'border-indigo-500/30 bg-indigo-900/10' : 'border-slate-700 bg-slate-800/50')}>
          <div className="flex items-center gap-2 mb-3 text-slate-200 font-medium">
            <FileCode2 size={18} className="text-indigo-400" />
            Mail Design
          </div>
          {designs.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No designs saved. Create one in Mail Design tab.</p>
          ) : (
            <>
              <select value={selectedDesignId} onChange={e => setSelectedDesignId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm mb-2">
                {designs.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {selectedDesign && (
                <div className="text-xs text-slate-500 space-y-0.5">
                  <div>Subject: <span className="text-slate-300">{selectedDesign.subject || '(using design default)'}</span></div>
                  <div>Header: <span className={selectedDesign.use_header ? 'text-emerald-400' : 'text-slate-600'}>{selectedDesign.use_header ? 'Included' : 'Off'}</span>
                    &nbsp;· Footer: <span className={selectedDesign.use_footer ? 'text-emerald-400' : 'text-slate-600'}>{selectedDesign.use_footer ? 'Included' : 'Off'}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Recipient Selector */}
        <div className="border border-slate-700 rounded-xl p-5 bg-slate-800/50">
          <div className="flex items-center gap-2 mb-3 text-slate-200 font-medium">
            <Users size={18} className="text-cyan-400" />
            Recipients
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-slate-700 mb-3 text-xs font-medium">
            <button onClick={() => setRecipientMode('list')}
              className={clsx('flex-1 py-1.5 transition-colors', recipientMode === 'list' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200')}>
              Saved List
            </button>
            <button onClick={() => setRecipientMode('csv')}
              className={clsx('flex-1 py-1.5 transition-colors', recipientMode === 'csv' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200')}>
              Upload CSV
            </button>
          </div>

          {recipientMode === 'list' ? (
            contactLists.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No contact lists saved. Import one in the Contacts tab.</p>
            ) : (
              <>
                <select value={selectedListId} onChange={e => setSelectedListId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm mb-1">
                  {contactLists.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.contact_count} contacts)</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">Using previously stored contact list.</p>
              </>
            )
          ) : (
            <>
              <label className={clsx(
                'flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-colors',
                csvFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-slate-500'
              )}>
                <FileSpreadsheet size={20} className={csvFile ? 'text-emerald-400' : 'text-slate-500'} />
                <span className="text-sm text-slate-400">{csvFile ? csvFile.name : 'Browse CSV file…'}</span>
                <input type="file" accept=".csv" className="hidden" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
              </label>
              <p className="text-xs text-slate-500 mt-1.5">CSV must have an "email" column. This won't be saved to your contacts.</p>
            </>
          )}
        </div>
      </div>

      {/* Progress Panel */}
      <div className="bg-slate-950 flex flex-col border border-slate-800 rounded-xl overflow-hidden flex-1 min-h-0 shadow-xl shadow-black/50">

        {/* Status Bar */}
        <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {status.isRunning
              ? <Loader2 className="text-indigo-400 animate-spin" size={18} />
              : <div className="w-2 h-2 rounded-full bg-slate-600" />}
            <span className="text-sm font-medium text-slate-300">Live Telemetry</span>
            {status.isRunning && status.total > 0 && (
              <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800/50">
                {progressPercent}%
              </span>
            )}
          </div>
          <div className="flex gap-5 text-sm">
            <span className="text-slate-400">Total: <span className="text-white font-mono font-bold">{status.total}</span></span>
            <span className="text-emerald-400">✓ Sent: <span className="font-mono font-bold">{status.sent}</span></span>
            <span className="text-red-400">✗ Failed: <span className="font-mono font-bold">{status.failed}</span></span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-slate-800 shrink-0">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Current Email Strip */}
        {status.isRunning && (
          <div className="px-4 py-2 bg-indigo-900/20 border-b border-indigo-900/40 text-xs flex justify-between items-center shrink-0">
            <span className="text-indigo-300">Processing:</span>
            <span className="font-mono text-indigo-200 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-800/50 truncate max-w-sm">
              {status.currentEmail}
            </span>
          </div>
        )}

        {/* Log Terminal */}
        <div className="flex-1 overflow-y-auto p-4 space-y-0.5 font-mono text-xs bg-[#060b14]">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic text-center mt-8">Waiting for campaign to start…</div>
          ) : logs.map((log, i) => (
            <div key={i} className="flex gap-3 py-0.5 hover:bg-white/5 rounded px-1 transition-colors">
              <span className="text-slate-600 shrink-0 select-none">[{log.time}]</span>
              <span className={clsx(
                'break-all',
                log.type === 'error' ? 'text-red-400' :
                log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
              )}>{log.msg}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default Campaign;
