import React, { useState, useEffect } from 'react';
import { Users, Upload, Trash2, Plus, Eye, Mail, X } from 'lucide-react';
import clsx from 'clsx';

const Contacts: React.FC = () => {
  const [lists, setLists] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [importName, setImportName] = useState('');
  const [importDesc, setImportDesc] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const api = () => (window as any).electronAPI;

  const loadLists = () => {
    api()?.getContactLists().then((res: any[]) => setLists(res));
  };

  useEffect(() => { loadLists(); }, []);

  const handleViewList = (list: any) => {
    setSelectedList(list);
    api()?.getContacts(list.id).then((res: any[]) => setContacts(res));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this contact list and all its contacts?')) return;
    await api()?.deleteContactList(id);
    if (selectedList?.id === id) { setSelectedList(null); setContacts([]); }
    loadLists();
  };

  const handleImport = async () => {
    if (!importName.trim() || !importFile) { setImportStatus('Please provide a name and file.'); return; }
    setImportStatus('Importing...');
    const result = await api()?.importContactList({
      name: importName,
      description: importDesc,
      csvPath: (importFile as any).path
    });
    if (result?.success) {
      setImportStatus(`✓ Imported ${result.count} contacts successfully!`);
      loadLists();
      setTimeout(() => { setShowImport(false); setImportStatus(''); setImportName(''); setImportDesc(''); setImportFile(null); }, 1500);
    } else {
      setImportStatus(`Error: ${result?.error}`);
    }
  };

  const filtered = contacts.filter(c =>
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-10 max-w-6xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="mb-6 border-b border-slate-800 pb-4 shrink-0 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Users className="text-cyan-500" size={28} />
            Contact Lists
          </h2>
          <p className="text-slate-400 mt-1">Manage reusable mailing lists imported from CSV files.</p>
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg shadow-lg shadow-cyan-600/20 transition-all"
        >
          <Plus size={18} />
          Import New List
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">

        {/* Left: Lists Panel */}
        <div className="w-80 shrink-0 flex flex-col bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800 text-sm font-medium text-slate-300">
            Saved Lists ({lists.length})
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {lists.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Users size={28} className="mx-auto mb-2 opacity-30" />
                No lists imported yet.
              </div>
            ) : lists.map(list => (
              <div
                key={list.id}
                onClick={() => handleViewList(list)}
                className={clsx(
                  'p-3 rounded-lg border cursor-pointer transition-all group',
                  selectedList?.id === list.id
                    ? 'bg-cyan-900/30 border-cyan-500/50'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium text-slate-200 text-sm truncate">{list.name}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(list.id); }}
                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {list.description && <div className="text-xs text-slate-500 mt-0.5 truncate">{list.description}</div>}
                <div className="flex items-center gap-1 mt-2 text-xs text-cyan-400">
                  <Mail size={11} />
                  {list.contact_count} contacts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Contacts Table */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          {!selectedList ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <Eye size={32} className="mb-3 opacity-30" />
              Select a list to view contacts
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800 flex justify-between items-center shrink-0">
                <div>
                  <span className="font-semibold text-slate-200">{selectedList.name}</span>
                  <span className="ml-2 text-xs text-slate-500">{selectedList.contact_count} contacts</span>
                </div>
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-48"
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#0a0f1c]/50 text-xs uppercase text-slate-500 sticky top-0">
                    <tr>
                      <th className="px-5 py-3">#</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filtered.slice(0, 200).map((c, i) => (
                      <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-2.5 text-slate-600 text-xs">{i + 1}</td>
                        <td className="px-5 py-2.5 font-mono text-xs text-slate-300">{c.email}</td>
                        <td className="px-5 py-2.5 text-slate-400">{c.name || '—'}</td>
                      </tr>
                    ))}
                    {filtered.length > 200 && (
                      <tr>
                        <td colSpan={3} className="px-5 py-3 text-center text-xs text-slate-600">
                          Showing 200 of {filtered.length} results. Use search to narrow down.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-[480px] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Upload size={20} className="text-cyan-400" />
                Import Contact List
              </h3>
              <button onClick={() => setShowImport(false)} className="text-slate-500 hover:text-slate-300"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">List Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Newsletter Q2 2025"
                  value={importName}
                  onChange={e => setImportName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Description (optional)</label>
                <input
                  type="text"
                  placeholder="Brief note about this list"
                  value={importDesc}
                  onChange={e => setImportDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">CSV File * <span className="text-slate-600">(must have an "email" column)</span></label>
                <label className={clsx(
                  'flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors',
                  importFile ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-700 hover:border-slate-500'
                )}>
                  <Upload size={24} className={importFile ? 'text-cyan-400' : 'text-slate-500'} />
                  <span className="mt-2 text-sm text-slate-400">{importFile ? importFile.name : 'Click to browse CSV file'}</span>
                  <input type="file" accept=".csv" className="hidden" onChange={e => setImportFile(e.target.files?.[0] || null)} />
                </label>
              </div>

              {importStatus && (
                <div className={clsx('text-sm px-4 py-2 rounded-lg', importStatus.startsWith('✓') ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10')}>
                  {importStatus}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowImport(false)} className="flex-1 py-2.5 border border-slate-700 text-slate-400 rounded-lg hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button onClick={handleImport} className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors">
                  Import List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
