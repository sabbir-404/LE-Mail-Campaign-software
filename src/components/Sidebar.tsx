import React from 'react';
import { Mail, Settings as SettingsIcon } from 'lucide-react';
import { PageView } from '../App';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SidebarProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <div className="w-64 bg-slate-950 flex flex-col border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center gap-2">
          <Mail className="text-blue-500" size={28} />
          LE Mail
        </h1>
        <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-semibold">Campaign Manager</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <button
          onClick={() => setCurrentPage('campaign')}
          className={twMerge(
            clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
              currentPage === 'campaign' 
                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"
            )
          )}
        >
          <Mail size={18} />
          Campaign
        </button>

        <button
          onClick={() => setCurrentPage('settings')}
          className={twMerge(
            clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
              currentPage === 'settings' 
                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"
            )
          )}
        >
          <SettingsIcon size={18} />
          SMTP Settings
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-600 text-center">Version 1.0.0</div>
      </div>
    </div>
  );
};

export default Sidebar;
