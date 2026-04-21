import React, { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';
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
    host: '',
    port: '465',
    user: '',
    pass: '',
    fromName: '',
    fromEmail: ''
  });
  
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.getSettings().then((dbSettings: any) => {
        if (dbSettings) {
          setSettings({
            host: dbSettings.host || '',
            port: dbSettings.port || '465',
            user: dbSettings.username || '',
            pass: dbSettings.password || '',
            fromName: dbSettings.from_name || '',
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

  return (
    <div className="p-10 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 border-b border-slate-800 pb-5">
        <h2 className="text-3xl font-bold text-slate-100">SMTP Settings</h2>
        <p className="text-slate-400 mt-2">Configure the mail server credentials used to dispatch the campaigns.</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">SMTP Host</label>
            <input 
              type="text" 
              name="host"
              value={settings.host}
              onChange={handleChange}
              placeholder="e.g. smtp.gmail.com" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Port</label>
            <input 
              type="text" 
              name="port"
              value={settings.port}
              onChange={handleChange}
              placeholder="e.g. 465 or 587" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2 mt-4 pt-4 border-t border-slate-700/50">
            <h3 className="text-lg font-medium text-slate-200">Authentication</h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Username / Email</label>
            <input 
              type="text" 
              name="user"
              value={settings.user}
              onChange={handleChange}
              placeholder="user@domain.com" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password / App Password</label>
            <input 
              type="password" 
              name="pass"
              value={settings.pass}
              onChange={handleChange}
              placeholder="••••••••" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2 md:col-span-2 mt-4 pt-4 border-t border-slate-700/50">
            <h3 className="text-lg font-medium text-slate-200">Sender Details</h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">From Name</label>
            <input 
              type="text" 
              name="fromName"
              value={settings.fromName}
              onChange={handleChange}
              placeholder="e.g. Leading Edge Deals" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">From Email Address</label>
            <input 
              type="email" 
              name="fromEmail"
              value={settings.fromEmail}
              onChange={handleChange}
              placeholder="no-reply@domain.com" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="mt-10 flex justify-end items-center gap-4">
          <span className={clsx("text-emerald-400 flex items-center gap-2 transition-opacity duration-300 text-sm", saved ? "opacity-100" : "opacity-0")}>
            <CheckCircle size={16} />
            Settings saved locally
          </span>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
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
