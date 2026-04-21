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

  // Single contact state
  // Single contact state & Editing
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [addContactStatus, setAddContactStatus] = useState('');
  
  const [editingContact, setEditingContact] = useState<any>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editName, setEditName] = useState('');

  // Blank list state
  const [showNewList, setShowNewList] = useState(false);
  const [listName, setListName] = useState('');
  const [listDesc, setListDesc] = useState('');

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

  const [selectedDropdownListId, setSelectedDropdownListId] = useState<number | ''>('');

  const handleAddContact = async () => {
    const listIdToUse = selectedList ? selectedList.id : selectedDropdownListId;
    if (!newContactEmail.trim() || !listIdToUse) {
      setAddContactStatus('Email and a target List are required.');
      return;
    }
    setAddContactStatus('Adding...');
    await api()?.addContact({ listId: listIdToUse, email: newContactEmail.trim(), name: newContactName.trim() });
    setAddContactStatus('✓ Contact added');
    
    // Reload contacts if the target list is currently being viewed
    if (selectedList?.id === listIdToUse) {
      handleViewList(selectedList);
    }
    loadLists(); // Refresh counts on the left panel
    setTimeout(() => { setShowAddContact(false); setAddContactStatus(''); setNewContactEmail(''); setNewContactName(''); }, 1500);
  };

  const handleCreateList = async () => {
    if (!listName.trim()) return;
    const res = await api()?.createBlankList({ name: listName, description: listDesc });
    if (res?.success) {
      loadLists();
      setShowNewList(false);
      setListName('');
      setListDesc('');
    }
  };

  const startEditContact = (c: any) => {
    setEditingContact(c);
    setEditEmail(c.email);
    setEditName(c.name || '');
  };

  const handleSaveContactEdit = async () => {
    if (!editEmail.trim() || !editingContact) return;
    await api()?.updateContact({ id: editingContact.id, email: editEmail.trim(), name: editName.trim() });
    setEditingContact(null);
    if (selectedList) handleViewList(selectedList);
  };

  const handleDeleteContact = async (c: any) => {
    if (!confirm(`Delete ${c.email}?`)) return;
    await api()?.deleteContact({ id: c.id, listId: selectedList.id });
    if (selectedList) handleViewList(selectedList);
    loadLists();
  };

  const filtered = contacts.filter(c =>
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-10 max-w-6xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="mb-6 border-b border-stone-200 pb-4 shrink-0 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-stone-900 flex items-center gap-3">
            <Users className="text-orange-500" size={28} />
            Contact Lists
          </h2>
          <p className="text-stone-500 mt-1">Manage reusable mailing lists imported from CSV files.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNewList(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-medium rounded-lg shadow-sm transition-all"
          >
            <Users size={18} />
            Blank List
          </button>
          <button
            onClick={() => setShowAddContact(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 font-medium rounded-lg shadow-sm transition-all"
          >
            <Plus size={18} />
            Quick Add Contact
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm shadow-orange-500/20 transition-all"
          >
            <Upload size={18} />
            Import CSV
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">

        {/* Left: Lists Panel */}
        <div className="w-80 shrink-0 flex flex-col bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-stone-100 bg-stone-50 text-sm font-medium text-stone-700">
            Saved Lists ({lists.length})
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-[#f8f5f2]/30">
            {lists.length === 0 ? (
              <div className="p-6 text-center text-stone-400">
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
                    ? 'bg-orange-50 border-orange-200 shadow-sm'
                    : 'bg-white border-stone-200 hover:border-orange-300'
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium text-stone-800 text-sm truncate">{list.name}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(list.id); }}
                    className="text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {list.description && <div className="text-xs text-stone-500 mt-0.5 truncate">{list.description}</div>}
                <div className="flex items-center gap-1 mt-2 text-xs text-orange-600 font-medium">
                  <Mail size={11} />
                  {list.contact_count} contacts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Contacts Table */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
          {!selectedList ? (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-400">
              <Eye size={32} className="mb-3 opacity-30" />
              Select a list to view contacts
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-stone-100 bg-stone-50 flex justify-between items-center shrink-0">
                <div>
                  <span className="font-semibold text-stone-800">{selectedList.name}</span>
                  <span className="ml-2 text-xs text-stone-500">{selectedList.contact_count} contacts</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddContact(true)}
                    className="text-xs flex items-center gap-1 text-orange-600 font-medium hover:text-orange-700 bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-200"
                  >
                    <Plus size={14} /> Add Contact
                  </button>
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-orange-500 w-48 shadow-sm placeholder:text-stone-400"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-stone-100/50 text-xs uppercase text-stone-500 sticky top-0">
                    <tr>
                      <th className="px-5 py-3 font-medium">#</th>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filtered.slice(0, 200).map((c, i) => {
                      const isEditing = editingContact?.id === c.id;
                      return (
                        <tr key={c.id} className="hover:bg-stone-50 transition-colors group">
                          <td className="px-5 py-3 text-stone-500 text-xs w-12">{i + 1}</td>
                          <td className="px-5 py-2.5">
                            {isEditing ? (
                              <input 
                                type="email" 
                                value={editEmail} 
                                onChange={e=>setEditEmail(e.target.value)} 
                                className="w-full bg-white border border-stone-300 rounded px-2 py-1 text-xs" 
                                autoFocus
                              />
                            ) : (
                              <span className="font-mono text-xs text-stone-700">{c.email}</span>
                            )}
                          </td>
                          <td className="px-5 py-2.5">
                            {isEditing ? (
                              <input 
                                type="text" 
                                value={editName} 
                                onChange={e=>setEditName(e.target.value)} 
                                className="w-full bg-white border border-stone-300 rounded px-2 py-1 text-xs" 
                              />
                            ) : (
                              <span className="text-stone-500 text-sm">{c.name || '—'}</span>
                            )}
                          </td>
                          <td className="px-5 py-2.5 text-right w-28">
                            {isEditing ? (
                              <div className="flex justify-end gap-2">
                                <button onClick={()=>setEditingContact(null)} className="text-stone-400 hover:text-stone-600 text-xs font-medium">Cancel</button>
                                <button onClick={handleSaveContactEdit} className="text-emerald-600 hover:text-emerald-700 text-xs font-medium bg-emerald-50 px-2 py-1 rounded">Save</button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={()=>startEditContact(c)} className="text-stone-400 hover:text-orange-500">Edit</button>
                                <button onClick={()=>handleDeleteContact(c)} className="text-stone-400 hover:text-red-500"><Trash2 size={14}/></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length > 200 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-3 text-center text-xs text-stone-400">
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

      {/* Blank List Modal */}
      {showNewList && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-stone-200 rounded-2xl p-8 w-[400px] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-stone-900">Create Blank List</h3>
              <button onClick={() => setShowNewList(false)} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-stone-600 font-medium mb-1.5 block">List Name *</label>
                <input
                  type="text"
                  value={listName}
                  onChange={e => setListName(e.target.value)}
                  placeholder="e.g. Test Group"
                  className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-sm text-stone-600 font-medium mb-1.5 block">Description (Optional)</label>
                <input
                  type="text"
                  value={listDesc}
                  onChange={e => setListDesc(e.target.value)}
                  className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowNewList(false)} className="flex-1 py-2.5 border border-stone-300 text-stone-600 font-medium rounded-lg hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleCreateList} disabled={!listName.trim()} className="flex-1 py-2.5 bg-orange-500 disabled:bg-orange-300 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm transition-colors">
                  Create List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-stone-200 rounded-2xl p-8 w-[400px] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-stone-900">Add New Contact</h3>
              <button onClick={() => setShowAddContact(false)} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-stone-600 font-medium mb-1.5 block">Email Address *</label>
                <input
                  type="email"
                  value={newContactEmail}
                  onChange={e => setNewContactEmail(e.target.value)}
                  className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              {!selectedList && (
                <div>
                  <label className="text-sm text-stone-600 font-medium mb-1.5 block">Add to List *</label>
                  <select
                    value={selectedDropdownListId}
                    onChange={e => setSelectedDropdownListId(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="" disabled>Select a list...</option>
                    {lists.map(list => (
                      <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-sm text-stone-600 font-medium mb-1.5 block">Name (Optional)</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={e => setNewContactName(e.target.value)}
                  className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {addContactStatus && (
                <div className={clsx('text-sm px-4 py-2 rounded-lg border font-medium', addContactStatus.startsWith('✓') ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-stone-700 bg-stone-50 border-stone-200')}>
                  {addContactStatus}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowAddContact(false)} className="flex-1 py-2.5 border border-stone-300 text-stone-600 font-medium rounded-lg hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleAddContact} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm transition-colors">
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-stone-200 rounded-2xl p-8 w-[480px] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <Upload size={20} className="text-orange-500" />
                Import Contact List
              </h3>
              <button onClick={() => setShowImport(false)} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-stone-600 font-medium mb-1.5 block">List Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Newsletter Q2 2025"
                  value={importName}
                  onChange={e => setImportName(e.target.value)}
                  className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-4 py-2.5 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-sm text-stone-600 font-medium mb-1.5 block">Description (optional)</label>
                <input
                  type="text"
                  placeholder="Brief note about this list"
                  value={importDesc}
                  onChange={e => setImportDesc(e.target.value)}
                  className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-4 py-2.5 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-sm text-stone-600 font-medium mb-1.5 block">CSV File * <span className="text-stone-400 font-normal">(must have an "email" column)</span></label>
                <label className={clsx(
                  'flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors',
                  importFile ? 'border-orange-400 bg-orange-50/50' : 'border-stone-300 hover:border-orange-300 bg-stone-50 hover:bg-stone-100/50'
                )}>
                  <Upload size={24} className={importFile ? 'text-orange-500' : 'text-stone-400'} />
                  <span className="mt-2 text-sm font-medium text-stone-600">{importFile ? importFile.name : 'Click to browse CSV file'}</span>
                  <input type="file" accept=".csv" className="hidden" onChange={e => setImportFile(e.target.files?.[0] || null)} />
                </label>
              </div>

              {importStatus && (
                <div className={clsx('text-sm px-4 py-3 rounded-lg border font-medium', importStatus.startsWith('✓') ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-700 bg-red-50 border-red-200')}>
                  {importStatus}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowImport(false)} className="flex-1 py-2.5 border border-stone-300 text-stone-600 font-medium rounded-lg hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleImport} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm transition-colors">
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
