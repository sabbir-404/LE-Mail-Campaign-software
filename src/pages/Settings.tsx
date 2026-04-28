import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, Download, BookOpen, X } from 'lucide-react';
import clsx from 'clsx';

export interface SMTPSettings {
  host: string;
  port: string;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SMTPSettings>({
    host: 'smtp.hostinger.com',
    port: '465',
    user: '',
    pass: '',
    fromName: 'Leading Edge',
    fromEmail: ''
  });
  
  const [saved, setSaved] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.getSettings().then((dbSettings: any) => {
        if (dbSettings && dbSettings.host) {
          // Only override defaults if user has already saved settings
          setSettings({
            host: dbSettings.host || 'smtp.hostinger.com',
            port: dbSettings.port || '465',
            user: dbSettings.username || '',
            pass: dbSettings.password || '',
            fromName: dbSettings.from_name || 'Leading Edge',
            fromEmail: dbSettings.from_email || ''
          });
        }
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.saveSettings({
        host: settings.host,
        port: settings.port,
        username: settings.user,
        password: settings.pass,
        fromName: settings.fromName,
        fromEmail: settings.fromEmail
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCheckUpdates = async () => {
    setCheckingUpdate(true);
    setUpdateMessage(null);
    try {
      const result = await (window as any).electronAPI?.checkForUpdates?.();
      setUpdateMessage(result?.message || 'Update check completed.');
    } catch (error: any) {
      setUpdateMessage(error?.message || 'Failed to check for updates.');
    } finally {
      setCheckingUpdate(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 border-b border-stone-200 pb-5">
        <h2 className="text-3xl font-bold text-stone-900">SMTP Settings</h2>
        <p className="text-stone-500 mt-2">Configure the mail server credentials used to dispatch the campaigns.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setShowTutorial(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-700 text-sm hover:bg-stone-50"
          >
            <BookOpen size={15} />
            Mail Design Tutorial
          </button>
          <button
            onClick={handleCheckUpdates}
            disabled={checkingUpdate}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 text-sm hover:bg-orange-100 disabled:opacity-60"
          >
            <Download size={15} />
            {checkingUpdate ? 'Checking Updates...' : 'Check for App Update'}
          </button>
        </div>
        {updateMessage && (
          <div className="mt-3 text-sm text-stone-600 bg-stone-100 border border-stone-200 rounded-lg px-3 py-2">{updateMessage}</div>
        )}
      </div>

      {/* Hostinger Quick Reference */}
      <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-orange-800 mb-3">📡 Hostinger Email Server Reference</h3>
        <div className="grid grid-cols-3 gap-3 text-xs font-mono">
          <div className="bg-white rounded-lg p-3 border border-orange-100 shadow-sm">
            <div className="text-stone-500 mb-1">SMTP (Outgoing)</div>
            <div className="text-orange-600 font-bold">smtp.hostinger.com</div>
            <div className="text-stone-500 mt-1">Port: 465 · SSL</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-orange-100 shadow-sm">
            <div className="text-stone-500 mb-1">IMAP (Incoming)</div>
            <div className="text-stone-600 font-bold">imap.hostinger.com</div>
            <div className="text-stone-500 mt-1">Port: 993 · SSL</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-orange-100 shadow-sm">
            <div className="text-stone-500 mb-1">POP3 (Incoming)</div>
            <div className="text-stone-600 font-bold">pop.hostinger.com</div>
            <div className="text-stone-500 mt-1">Port: 995 · SSL</div>
          </div>
        </div>
        <p className="text-xs text-orange-700/70 mt-3 font-medium">This app only uses SMTP for sending. Enter your Hostinger email credentials below.</p>
      </div>

      <div className="mb-6 bg-sky-50 border border-sky-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-sky-800 mb-3">✉️ How to create a mail</h3>
        <ol className="list-decimal list-inside text-sm text-stone-700 space-y-2">
          <li>Open the Mail Design page and click <strong>New Design</strong> or pick a template from the Template Library.</li>
          <li>Use the <strong>Add blocks</strong> toolbar to insert hero, text, image, button, grid, or divider sections.</li>
          <li>Select a block on the Builder Canvas to edit its content immediately below that block.</li>
          <li>Preview the email in <strong>desktop/mobile</strong> and switch <strong>light/dark/auto phone mode</strong> before sending.</li>
          <li>When satisfied, click <strong>Save</strong> or <strong>Save as Template</strong> to reuse the layout later.</li>
        </ol>
        <p className="text-xs text-stone-500 mt-3">Tip: Switch to <strong>Code</strong> mode for manual HTML edits or to paste third-party templates.</p>
      </div>

      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowTutorial(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6 z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Mail Design Tutorial</h3>
                <p className="text-xs text-stone-500 mt-1">Quick guide to build and preview campaigns in the Mail Design page.</p>
              </div>
              <button onClick={() => setShowTutorial(false)} className="p-1 rounded text-stone-500 hover:bg-stone-100">
                <X size={18} />
              </button>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-sm text-stone-700">
              <li>Choose a template from the left library or click New Design.</li>
              <li>Use Add blocks to insert hero, text, image, buttons, and product grids.</li>
              <li>Click any block in Builder Canvas and edit it directly under that block card.</li>
              <li>Use Email Body Preview to switch desktop/mobile and Light/Dark/Auto phone mode.</li>
              <li>Use Test Email for a quick check, then Save or Save as Template.</li>
            </ol>

            <div className="mt-4 rounded-lg bg-stone-50 p-3 text-xs text-stone-600">
              Tip: Use Auto phone mode preview to mimic how recipients may see dark-mode adaptation on mobile.
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-stone-200 shadow-sm rounded-xl p-8 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">SMTP Host</label>
            <input 
              type="text" 
              name="host"
              value={settings.host}
              onChange={handleChange}
              placeholder="e.g. smtp.gmail.com" 
              className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-stone-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Port</label>
            <input 
              type="text" 
              name="port"
              value={settings.port}
              onChange={handleChange}
              placeholder="e.g. 465 or 587" 
              className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-stone-400"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2 mt-4 pt-4 border-t border-stone-100">
            <h3 className="text-lg font-semibold text-stone-800">Authentication</h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Username / Email</label>
            <input 
              type="text" 
              name="user"
              value={settings.user}
              onChange={handleChange}
              placeholder="user@domain.com" 
              className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-stone-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Password / App Password</label>
            <input 
              type="password" 
              name="pass"
              value={settings.pass}
              onChange={handleChange}
              placeholder="••••••••" 
              className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-stone-400"
            />
          </div>

          <div className="space-y-2 md:col-span-2 mt-4 pt-4 border-t border-stone-100">
            <h3 className="text-lg font-semibold text-stone-800">Sender Details</h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">From Name</label>
            <input 
              type="text" 
              name="fromName"
              value={settings.fromName}
              onChange={handleChange}
              placeholder="e.g. Leading Edge Deals" 
              className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-stone-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">From Email Address</label>
            <input 
              type="email" 
              name="fromEmail"
              value={settings.fromEmail}
              onChange={handleChange}
              placeholder="no-reply@domain.com" 
              className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-stone-400"
            />
          </div>
        </div>

        <div className="mt-10 flex justify-end items-center gap-4">
          <span className={clsx("text-emerald-600 font-medium flex items-center gap-2 transition-opacity duration-300 text-sm", saved ? "opacity-100" : "opacity-0")}>
            <CheckCircle size={16} />
            Settings saved locally
          </span>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm shadow-orange-500/20 transition-all active:scale-95"
          >
            <Save size={18} />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
