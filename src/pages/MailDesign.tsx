import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Eye, EyeOff, Code } from 'lucide-react';
import clsx from 'clsx';

// Mirror of what the backend injects — kept in sync for accurate preview
const PREVIEW_HEADER = `
<div style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom: 2px solid #e2e8f0;">
  <img src="https://leadingedge.com.bd/wp-content/uploads/2023/05/logo.png" alt="Leading Edge" style="max-height: 60px;" />
</div>
<div style="padding: 24px; font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b;">
`;

const PREVIEW_FOOTER = `
</div>
<div style="background-color: #0f172a; padding: 30px 20px; text-align: center; color: #94a3b8; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px;">
  <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: bold; color: #e2e8f0;">Leading Edge</p>
  <p style="margin: 0 0 4px 0;">House# 45, Road# 12, Sector# 10, Uttara, Dhaka-1230</p>
  <p style="margin: 0 0 14px 0;">
    <a href="https://leadingedge.com.bd" style="color: #60a5fa; text-decoration: none;">leadingedge.com.bd</a>
    &nbsp;|&nbsp;
    <a href="mailto:info@leadingedge.com.bd" style="color: #60a5fa; text-decoration: none;">info@leadingedge.com.bd</a>
  </p>
  <div style="display: flex; justify-content: center; gap: 14px; margin-bottom: 16px;">
    <a href="https://www.facebook.com/leadingedgebd" style="color: #60a5fa; text-decoration: none; font-size: 13px;">Facebook</a>
    <a href="#" style="color: #60a5fa; text-decoration: none; font-size: 13px;">LinkedIn</a>
    <a href="#" style="color: #60a5fa; text-decoration: none; font-size: 13px;">YouTube</a>
  </div>
  <div style="font-size: 11px; color: #475569; border-top: 1px solid #1e293b; padding-top: 14px;">
    © ${new Date().getFullYear()} Leading Edge. All rights reserved. You received this email because you are our valued customer.
  </div>
</div>
`;

const MailDesign: React.FC = () => {
  const [designs, setDesigns] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    name: 'New Design',
    subject: '',
    body_html: '<h2 style="color:#1e293b">Hello valued customer!</h2>\n<p style="color:#475569; line-height:1.7;">Thank you for being with us.</p>',
    use_header: true,
    use_footer: true,
  });

  const loadDesigns = () => {
    (window as any).electronAPI?.getDesigns().then((res: any) => setDesigns(res));
  };

  useEffect(() => { loadDesigns(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    const payload = {
      name: formData.name,
      subject: formData.subject,
      body_html: formData.body_html,
      use_header: formData.use_header ? 1 : 0,
      use_footer: formData.use_footer ? 1 : 0,
    };
    if (editingId) {
      (window as any).electronAPI?.updateDesign(editingId, payload);
    } else {
      (window as any).electronAPI?.saveDesign(payload);
    }
    setTimeout(() => { loadDesigns(); handleNew(); }, 300);
  };

  const handleEdit = (d: any) => {
    setEditingId(d.id);
    setFormData({
      name: d.name,
      subject: d.subject,
      body_html: d.body_html,
      use_header: d.use_header === 1,
      use_footer: d.use_footer === 1,
    });
    setShowPreview(false);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Delete this design?')) return;
    (window as any).electronAPI?.deleteDesign(id);
    setTimeout(() => { loadDesigns(); if (editingId === id) handleNew(); }, 300);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({ name: 'New Design', subject: '', body_html: '', use_header: true, use_footer: true });
    setShowPreview(false);
  };

  const buildPreviewHtml = () => {
    let html = formData.body_html;
    if (formData.use_header) html = PREVIEW_HEADER + html;
    if (formData.use_footer) html = html + PREVIEW_FOOTER;
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{margin:0;padding:0;background:#f1f5f9;}</style></head><body>${html}</body></html>`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex gap-6 h-full animate-in fade-in duration-500">

      {/* Sidebar: Saved Designs */}
      <div className="w-60 flex flex-col shrink-0 bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-slate-700/50 bg-slate-800 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-200">Designs</span>
          <button onClick={handleNew} className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded hover:bg-indigo-500/30 transition-colors">
            <Plus size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {designs.length === 0 && (
            <div className="text-center text-xs text-slate-500 p-4">No designs yet.</div>
          )}
          {designs.map(d => (
            <div
              key={d.id}
              onClick={() => handleEdit(d)}
              className={clsx(
                'px-3 py-2.5 rounded-lg border cursor-pointer group flex justify-between items-start transition-colors',
                editingId === d.id ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
              )}
            >
              <div>
                <div className="text-sm font-medium text-slate-200 truncate max-w-[130px]">{d.name}</div>
                <div className="text-xs text-slate-500 truncate max-w-[130px]">{d.subject || 'No subject'}</div>
              </div>
              <button onClick={e => { e.stopPropagation(); handleDelete(d.id); }} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-slate-700/50 bg-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-100">{editingId ? 'Edit Design' : 'New Design'}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(p => !p)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-all font-medium',
                showPreview
                  ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                  : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
              )}
            >
              {showPreview ? <><Code size={14} /> Edit HTML</> : <><Eye size={14} /> Preview</>}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all"
            >
              <Save size={14} />
              {editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </div>

        {/* Meta Fields */}
        <div className="px-6 py-4 border-b border-slate-700/30 shrink-0 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Design Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Default Email Subject</label>
            <input type="text" name="subject" placeholder="Your Exclusive Offer Awaits!" value={formData.subject} onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
        </div>

        {/* Toggle Wrappers */}
        <div className="px-6 py-3 border-b border-slate-700/30 bg-slate-900/30 shrink-0 flex gap-8">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-300">
            <input type="checkbox" name="use_header" checked={formData.use_header} onChange={handleChange}
              className="w-4 h-4 rounded accent-indigo-500" />
            <span className="flex items-center gap-1.5">
              Include Branded Header <span className="text-xs text-slate-500">(Logo)</span>
            </span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-300">
            <input type="checkbox" name="use_footer" checked={formData.use_footer} onChange={handleChange}
              className="w-4 h-4 rounded accent-indigo-500" />
            <span className="flex items-center gap-1.5">
              Include Branded Footer <span className="text-xs text-slate-500">(Address / Socials)</span>
            </span>
          </label>
        </div>

        {/* Editor / Preview */}
        <div className="flex-1 min-h-0 relative">
          {showPreview ? (
            <iframe
              srcDoc={buildPreviewHtml()}
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
              title="Email Preview"
            />
          ) : (
            <textarea
              name="body_html"
              value={formData.body_html}
              onChange={handleChange}
              className="w-full h-full bg-[#0a0f1c] font-mono text-sm text-emerald-400 p-5 resize-none focus:outline-none leading-relaxed"
              placeholder="<div>Write your HTML email body here...</div>"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MailDesign;
