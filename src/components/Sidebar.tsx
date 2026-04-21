import React from 'react';
import {
  LayoutDashboard, Mail, PenTool, Users, Database, Settings as SettingsIcon
} from 'lucide-react';
import { PageView } from '../App';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SidebarProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
}

type NavItem = {
  id: PageView;
  label: string;
  icon: React.ReactNode;
  color?: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard',     icon: <LayoutDashboard size={18} /> },
  { id: 'campaign',  label: 'Campaign',      icon: <Mail size={18} /> },
  { id: 'design',    label: 'Mail Design',   icon: <PenTool size={18} /> },
  { id: 'contacts',  label: 'Contacts',      icon: <Users size={18} /> },
  { id: 'history',   label: 'History',       icon: <Database size={18} /> },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <div className="w-56 bg-slate-950 flex flex-col border-r border-slate-800/70 shrink-0">

      {/* Logo */}
      <div className="px-5 pt-7 pb-5 border-b border-slate-800/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-900/50">
            <Mail size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 leading-none">LE Mail</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Campaign</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={twMerge(clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-900/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border border-transparent'
              ))}
            >
              <span className={active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}>
                {item.icon}
              </span>
              {item.label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
            </button>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="px-3 pb-4 border-t border-slate-800/50 pt-3">
        <button
          onClick={() => setCurrentPage('settings')}
          className={twMerge(clsx(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            currentPage === 'settings'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/70 border border-transparent'
          ))}
        >
          <SettingsIcon size={18} />
          Settings
        </button>
        <div className="text-center text-[10px] text-slate-700 mt-3">v1.0.0</div>
      </div>
    </div>
  );
};

export default Sidebar;
