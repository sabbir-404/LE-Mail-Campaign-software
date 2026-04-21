import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit } from 'lucide-react';
import clsx from 'clsx';

const MailDesign: React.FC = () => {
  const [designs, setDesigns] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: 'New Design',
    subject: '',
    body_html: '<h1>Hello World</h1>',
    use_header: true,
    use_footer: true,
  });

  const loadDesigns = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.getDesigns().then((res: any) => {
        setDesigns(res);
      });
    }
  };

  useEffect(() => {
    loadDesigns();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    if ((window as any).electronAPI) {
      const payload = {
        name: formData.name,
        subject: formData.subject,
        body_html: formData.body_html,
        use_header: formData.use_header ? 1 : 0,
        use_footer: formData.use_footer ? 1 : 0
      };

      if (editingId) {
        (window as any).electronAPI.updateDesign(editingId, payload);
      } else {
        (window as any).electronAPI.saveDesign(payload);
      }

      setTimeout(() => {
        loadDesigns();
        handleNew();
      }, 300);
    }
  };

  const handleEdit = (design: any) => {
    setEditingId(design.id);
    setFormData({
      name: design.name,
      subject: design.subject,
      body_html: design.body_html,
      use_header: design.use_header === 1,
      use_footer: design.use_footer === 1,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this design?")) {
      if ((window as any).electronAPI) {
        (window as any).electronAPI.deleteDesign(id);
        setTimeout(() => loadDesigns(), 300);
        if (editingId === id) handleNew();
      }
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      name: 'New Design',
      subject: '',
      body_html: '',
      use_header: true,
      use_footer: true,
    });
  };

  return (
    <div className="p-10 max-w-6xl mx-auto flex gap-8 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Sidebar List of Designs */}
      <div className="w-1/3 flex flex-col h-full bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800">
          <h3 className="font-semibold text-slate-200">Saved Designs</h3>
          <button 
            onClick={handleNew}
            className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-md hover:bg-indigo-500/40 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {designs.length === 0 ? (
            <div className="text-center text-sm text-slate-500 p-4">No designs saved yet.</div>
          ) : (
            designs.map(d => (
              <div 
                key={d.id} 
                className={clsx(
                  "p-3 rounded-lg border cursor-pointer transition-colors group flex justify-between items-start",
                  editingId === d.id ? "bg-indigo-900/30 border-indigo-500/50" : "bg-slate-900/50 border-slate-800 hover:border-slate-600"
                )}
                onClick={() => handleEdit(d)}
              >
                <div>
                  <div className="font-medium text-slate-200 text-sm mb-1">{d.name}</div>
                  <div className="text-xs text-slate-500 truncate">{d.subject || 'No Subject'}</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }}
                  className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor Main Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
        <div className="mb-6 flex justify-between items-end border-b border-slate-700/50 pb-4 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">{editingId ? 'Edit Design' : 'Create New Design'}</h2>
            <p className="text-sm text-slate-400 mt-1">Design your robust HTML layout with dynamic wrappers.</p>
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Save size={16} />
            {editingId ? 'Update' : 'Save'} Design
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 shrink-0">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Internal Identifier Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Default Email Subject</label>
            <input 
              type="text" 
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Exclusive Offer Inside!"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex gap-6 mb-4 p-3 bg-slate-900/50 border border-slate-700 rounded-lg shrink-0">
          <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-300">
            <input 
              type="checkbox" 
              name="use_header"
              checked={formData.use_header}
              onChange={handleChange}
              className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500 bg-slate-800 border-slate-600"
            />
            Include Universal Branded Header (Logo)
          </label>
          <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-300">
            <input 
              type="checkbox" 
              name="use_footer"
              checked={formData.use_footer}
              onChange={handleChange}
              className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500 bg-slate-800 border-slate-600"
            />
            Include Universal Footer (Showroom / Socials)
          </label>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <label className="text-sm font-medium text-slate-300 mb-1.5">HTML Layout Source</label>
          <textarea 
            name="body_html"
            value={formData.body_html}
            onChange={handleChange}
            className="flex-1 w-full bg-[#0a0f1c] font-mono text-sm border border-slate-700 rounded-lg p-4 text-emerald-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            placeholder="<div>Write your HTML here...</div>"
          ></textarea>
        </div>
      </div>

    </div>
  );
};

export default MailDesign;
