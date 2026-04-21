import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Campaign from './pages/Campaign';
import Settings from './pages/Settings';
import MailDesign from './pages/MailDesign';
import MailHistory from './pages/MailHistory';

export type PageView = 'campaign' | 'settings' | 'design' | 'history';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('campaign');

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="flex-1 overflow-y-auto bg-slate-900 shadow-inner">
        {currentPage === 'campaign' && <Campaign />}
        {currentPage === 'settings' && <Settings />}
        {currentPage === 'design' && <MailDesign />}
        {currentPage === 'history' && <MailHistory />}
      </main>
    </div>
  );
};

export default App;
