import React from 'react';
import {
  LayoutDashboard, Mail, PenTool, Users, Database, Settings as SettingsIcon, LineChart, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { PageView } from '../App';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SidebarProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
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
  { id: 'analytics', label: 'Analytics',     icon: <LineChart size={18} /> },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, collapsed, onToggleCollapse }) => {
  return (
    <div className={twMerge(clsx('bg-[#f3f0ec] flex flex-col border-r border-stone-200 shrink-0 transition-all duration-200', collapsed ? 'w-20' : 'w-56'))}>

      {/* Logo */}
      <div className="px-4 pt-5 pb-4 border-b border-stone-200">
        <div className={twMerge(clsx('flex items-center', collapsed ? 'justify-center' : 'justify-between'))}>
          <div className={twMerge(clsx('flex items-center gap-2.5', collapsed && 'justify-center'))}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/20">
            <Mail size={16} className="text-white" />
          </div>
            {!collapsed && (
              <div>
                <div className="text-sm font-bold text-stone-900 leading-none">LE Mail</div>
                <div className="text-[10px] text-stone-500 uppercase tracking-widest mt-0.5">Campaign</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={onToggleCollapse} className="p-1.5 rounded-md text-stone-500 hover:bg-stone-200/60 hover:text-stone-700" title="Collapse sidebar">
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>
        {collapsed && (
          <div className="mt-3 flex justify-center">
            <button onClick={onToggleCollapse} className="p-1.5 rounded-md text-stone-500 hover:bg-stone-200/60 hover:text-stone-700" title="Expand sidebar">
              <PanelLeftOpen size={16} />
            </button>
          </div>
        )}
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
                  ? 'bg-orange-100 text-orange-700 border border-orange-500/30 shadow-sm shadow-orange-900/5'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50 border border-transparent'
              ))}
            >
              <span className={active ? 'text-orange-600' : 'text-stone-400 group-hover:text-stone-600'}>
                {item.icon}
              </span>
              {!collapsed && item.label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
            </button>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="px-3 pb-4 border-t border-stone-200 pt-3">
        <button
          onClick={() => setCurrentPage('settings')}
          className={twMerge(clsx(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            currentPage === 'settings'
              ? 'bg-orange-100 text-orange-700 border border-orange-500/30'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50 border border-transparent'
          ))}
        >
          <SettingsIcon size={18} className={currentPage === 'settings' ? 'text-orange-600' : 'text-stone-400'} />
          {!collapsed && 'Settings'}
        </button>
        {!collapsed && <div className="text-center text-[10px] text-stone-400 mt-3">v1.0.0</div>}
      </div>
    </div>
  );
};

export default Sidebar;
