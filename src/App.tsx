import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Campaign from './pages/Campaign';
import Settings from './pages/Settings';
import MailDesign from './pages/MailDesign';
import MailHistory from './pages/MailHistory';
import Contacts from './pages/Contacts';
import Analytics from './pages/Analytics';

export type PageView = 'dashboard' | 'campaign' | 'design' | 'contacts' | 'history' | 'settings' | 'analytics';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#f8f5f2] text-stone-800 font-sans overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />
      <main className="flex-1 overflow-y-auto bg-[#f8f5f2]">
        {currentPage === 'dashboard' && <Dashboard setCurrentPage={setCurrentPage} />}
        {currentPage === 'campaign'  && <Campaign />}
        {currentPage === 'design'    && <MailDesign />}
        {currentPage === 'contacts'  && <Contacts />}
        {currentPage === 'history'   && <MailHistory />}
        {currentPage === 'analytics' && <Analytics />}
        {currentPage === 'settings'  && <Settings />}
      </main>
    </div>
  );
};

export default App;
