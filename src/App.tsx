import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 mb-4">
          LE Mail Campaign
        </h1>
        <p className="text-slate-400">Application scaffolding complete.</p>
        <button 
          onClick={async () => {
            const response = await (window as any).electronAPI?.ping();
            alert(`Electron IPC response: ${response}`);
          }}
          className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
        >
          Test IPC Ping
        </button>
      </div>
    </div>
  );
};

export default App;
