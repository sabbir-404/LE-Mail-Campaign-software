import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Play, FileCode2, FileSpreadsheet, Loader2, StopCircle } from 'lucide-react';
import clsx from 'clsx';

interface CampaignStatus {
  isRunning: boolean;
  total: number;
  sent: number;
  failed: number;
  currentEmail: string;
}

const Campaign: React.FC = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [delay, setDelay] = useState<number>(3); // seconds

  const [status, setStatus] = useState<CampaignStatus>({
    isRunning: false,
    total: 0,
    sent: 0,
    failed: 0,
    currentEmail: ''
  });

  const [logs, setLogs] = useState<{ time: string; msg: string; type: 'info' | 'success' | 'error' }[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((window as any).electronAPI) {
      const api = (window as any).electronAPI;
      api.onCampaignInit(({ total }: any) => {
        setStatus(prev => ({ ...prev, total }));
      });
      api.onCampaignLog(({ type, msg }: any) => {
        addLog(msg, type);
      });
      api.onCampaignProgress(({ sent, failed, currentEmail }: any) => {
        setStatus(prev => ({ ...prev, sent, failed, currentEmail }));
      });
      api.onCampaignStopped(() => {
        setStatus(prev => ({ ...prev, isRunning: false, currentEmail: 'Stopped' }));
      });
    }
  }, []);

  useEffect(() => {
    // Auto-scroll logs
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleStart = () => {
    if (!csvFile || !htmlFile) {
      addLog('Error: Please select both a CSV list and an HTML template.', 'error');
      return;
    }

    setStatus({ ...status, isRunning: true, sent: 0, failed: 0, currentEmail: 'Initializing...' });
    addLog('Starting campaign sequence...', 'info');

    // MOCK START FOR NOW until IPC is hooked up
    if ((window as any).electronAPI) {
      (window as any).electronAPI.startCampaign({
        csvPath: (csvFile as any).path,
        htmlPath: (htmlFile as any).path,
        delay
      });
    } else {
      addLog('Electron API not found, running mock.', 'error');
    }
  };

  const handleStop = () => {
    setStatus(prev => ({ ...prev, isRunning: false, currentEmail: 'Stopped' }));
    addLog('Campaign stopped by user.', 'info');
    if ((window as any).electronAPI) {
      (window as any).electronAPI.stopCampaign();
    }
  };

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }]);
  };

  const progressPercent = status.total > 0 ? Math.round(((status.sent + status.failed) / status.total) * 100) : 0;

  return (
    <div className="p-10 max-w-6xl mx-auto flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 border-b border-slate-800 pb-5 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Active Campaign</h2>
          <p className="text-slate-400 mt-2">Configure and dispatch your promotional emails.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">Delay bewteen emails (sec)</label>
            <input 
              type="number" 
              value={delay} 
              onChange={e => setDelay(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 w-24 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500" 
            />
          </div>
          {!status.isRunning ? (
            <button 
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Play size={18} fill="currentColor" />
              Start Sending
            </button>
          ) : (
            <button 
              onClick={handleStop}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg shadow-lg shadow-red-600/20 transition-all animate-pulse"
            >
              <StopCircle size={18} />
              Stop Engine
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 shrink-0">
        {/* CSV Upload */}
        <div className={clsx("border-2 border-dashed rounded-xl p-6 transition-colors flex flex-col items-center justify-center text-center", csvFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-700 bg-slate-800/50 hover:border-indigo-500/50 hover:bg-slate-800")}>
          <FileSpreadsheet className={clsx("mb-3", csvFile ? "text-emerald-400" : "text-slate-400")} size={40} />
          <h3 className="font-medium text-slate-200 mb-1">{csvFile ? csvFile.name : 'Target Mail List (CSV)'}</h3>
          <p className="text-sm text-slate-500 mb-4">{csvFile ? 'Ready to parse' : 'Upload your subscriber list'}</p>
          <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md text-sm transition-colors">
            Browse File
            <input type="file" accept=".csv" className="hidden" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        {/* HTML Upload */}
        <div className={clsx("border-2 border-dashed rounded-xl p-6 transition-colors flex flex-col items-center justify-center text-center", htmlFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-700 bg-slate-800/50 hover:border-indigo-500/50 hover:bg-slate-800")}>
          <FileCode2 className={clsx("mb-3", htmlFile ? "text-emerald-400" : "text-slate-400")} size={40} />
          <h3 className="font-medium text-slate-200 mb-1">{htmlFile ? htmlFile.name : 'Email Template (HTML)'}</h3>
          <p className="text-sm text-slate-500 mb-4">{htmlFile ? 'Design locked' : 'Upload your promotional layout'}</p>
          <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-md text-sm transition-colors">
            Browse File
            <input type="file" accept=".html,.htm" className="hidden" onChange={e => setHtmlFile(e.target.files?.[0] || null)} />
          </label>
        </div>
      </div>

      {/* Progress Dashboard */}
      <div className="bg-slate-950 flex flex-col border border-slate-800 rounded-xl overflow-hidden flex-1 min-h-0 shadow-xl shadow-black/50">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {status.isRunning ? (
              <Loader2 className="text-indigo-400 animate-spin" size={20} />
            ) : (
              <div className="w-2 h-2 rounded-full bg-slate-500"></div>
            )}
            <span className="font-medium text-slate-300">Live Telemetry</span>
          </div>
          <div className="flex gap-6 text-sm">
            <span className="text-slate-400">Total: <span className="text-white font-mono">{status.total}</span></span>
            <span className="text-emerald-400">Sent: <span className="font-mono">{status.sent}</span></span>
            <span className="text-red-400">Failed: <span className="font-mono">{status.failed}</span></span>
          </div>
        </div>

        {/* Progress Bar Component */}
        <div className="h-1.5 w-full bg-slate-800 shrink-0">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {status.isRunning && (
          <div className="px-4 py-2 bg-indigo-900/20 border-b border-indigo-900/50 text-indigo-200 text-sm flex justify-between items-center shrink-0">
            <span>Currently Processing:</span>
            <span className="font-mono bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-800/50 truncate max-w-md">
              {status.currentEmail}
            </span>
          </div>
        )}

        {/* Terminal / Logs Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-xs bg-[#0a0f1c]">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic mt-2 text-center">No logs recorded yet.</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-3 hover:bg-white/5 p-0.5 rounded transition-colors group">
                <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
                <span className={clsx(
                  "break-words",
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
                )}>
                  {log.msg}
                </span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default Campaign;
