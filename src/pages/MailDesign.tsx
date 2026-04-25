import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Eye, Code, Sun, Moon, Palette } from 'lucide-react';
import clsx from 'clsx';

const LOGO_BLACK_URL = 'https://leadingedge.com.bd/wp-content/uploads/2025/10/logo-black-scaled.png';
const LOGO_WHITE_URL = 'https://leadingedge.com.bd/wp-content/uploads/2025/10/logo-white-scaled.png';

// Social icon SVGs (inline, 22px, email-safe)
const FB_SVG  = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`;
const IG_SVG  = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>`;
const X_SVG   = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
const LI_SVG  = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`;
const SOCIAL_BTN = `display:inline-block;margin:0 5px;width:38px;height:38px;line-height:38px;border-radius:50%;background:rgba(255,255,255,0.13);color:#e2e8f0;text-align:center;text-decoration:none;vertical-align:middle;`;

// Mirror backend buildEmailHtml for accurate in-app preview
function buildPreviewHtml(bodyHtml: string, useHeader: boolean, useFooter: boolean, theme: string, footerBg: string = '#0f172a'): string {
  const isDark  = theme === 'dark';
  const isAdapt = theme === 'adaptive';

  const bg        = isDark ? '#0f172a' : '#f1f5f9';
  const cardBg    = isDark ? '#1e293b' : '#ffffff';
  const bodyColor = isDark ? '#cbd5e1' : '#334155';
  const logoSrc   = isDark ? LOGO_WHITE_URL : LOGO_BLACK_URL;
  const headerBg  = isDark ? '#0f172a' : '#ffffff';
  const headerBorder = isDark ? '#334155' : '#e2e8f0';

  const header = useHeader ? `
    <div style="background-color:${headerBg}; padding:16px 20px; text-align:center; border-bottom:2px solid ${headerBorder};">
      ${ isAdapt
        ? `<img src="${LOGO_BLACK_URL}" alt="Leading Edge" style="max-height:48px; max-width:200px; display:block; margin:0 auto;" />
           <small style="display:block;text-align:center;color:#94a3b8;font-size:10px;margin-top:4px;">[Adaptive: white logo shown in dark mode]</small>`
        : `<img src="${logoSrc}" alt="Leading Edge" style="max-height:48px; max-width:200px; display:block; margin:0 auto;" />`
      }
    </div>` : '';

  const footer = useFooter ? `
    <div style="background-color:${footerBg}; padding:32px 20px 24px; text-align:center; color:#94a3b8; font-family:'Segoe UI',Arial,sans-serif; font-size:13px;">
      <p style="margin:0 0 4px; font-size:16px; font-weight:700; color:#e2e8f0; letter-spacing:0.5px;">Leading Edge</p>
      <p style="margin:0 0 3px; font-size:12px;">H-78/1, Bir Uttom Ziaur Rahman Shorok, Moakhali, Dhaka-1212</p>
      <p style="margin:0 0 3px; font-size:12px;">&#128222; 01759-993888</p>
      <p style="margin:0 0 16px; font-size:12px;">
        <a href="https://leadingedge.com.bd" style="color:#93c5fd; text-decoration:none;">leadingedge.com.bd</a>
        &nbsp;|&nbsp;
        <a href="mailto:sales@leadingedge.com.bd" style="color:#93c5fd; text-decoration:none;">sales@leadingedge.com.bd</a>
      </p>
      <div style="margin:0 0 20px;">
        <a href="https://www.facebook.com/leadingedge.bd" style="${SOCIAL_BTN}" title="Facebook">${FB_SVG}</a>
        <a href="https://www.instagram.com/leadingedgebd/" style="${SOCIAL_BTN}" title="Instagram">${IG_SVG}</a>
        <a href="https://x.com/Leadingedge_bd" style="${SOCIAL_BTN}" title="X">${X_SVG}</a>
        <a href="https://www.linkedin.com/company/107868953/" style="${SOCIAL_BTN}" title="LinkedIn">${LI_SVG}</a>
      </div>
      <div style="font-size:11px; color:#475569; border-top:1px solid rgba(255,255,255,0.08); padding-top:12px; margin-top:4px;">
        &copy; ${new Date().getFullYear()} Leading Edge. All rights reserved.
      </div>
    </div>` : '';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <style>
    body{margin:0;padding:0;background:${bg};font-family:'Segoe UI',Arial,sans-serif;}
  </style></head>
  <body>
  <div style="background-color:${bg};padding:20px 10px;">
    <div style="max-width:620px;margin:0 auto;background-color:${cardBg};border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      ${header}
      <div style="padding:28px 32px;color:${bodyColor};font-size:15px;line-height:1.7;">${bodyHtml}</div>
      ${footer}
    </div>
  </div></body></html>`;
}

const THEME_OPTIONS = [
  { value: 'light',    label: 'Light',    icon: <Sun size={14} />,     hint: 'White background ∙ Black logo ∙ Overrides device dark mode' },
  { value: 'dark',     label: 'Dark',     icon: <Moon size={14} />,    hint: 'Dark background ∙ White logo ∙ Always renders dark' },
  { value: 'adaptive', label: 'Adaptive', icon: <Palette size={14} />, hint: 'Matches device setting ∙ Correct logo auto-selected ∙ Recommended for mobile' },
];

const MailDesign: React.FC = () => {
  const [designs, setDesigns] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const [formData, setFormData] = useState({
    name: 'New Design',
    subject: '',
    body_html: '<h2 style="color:#1e293b">Hello valued customer!</h2>\n<p style="color:#475569; line-height:1.7;">Thank you for being with us.</p>',
    use_header: true,
    use_footer: true,
    email_theme: 'light',
    footer_bg: '#0f172a',
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
      email_theme: formData.email_theme,
      footer_bg: formData.footer_bg || '#0f172a',
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
      email_theme: d.email_theme || 'light',
      footer_bg: d.footer_bg || '#0f172a',
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
    setFormData({ name: 'New Design', subject: '', body_html: '', use_header: true, use_footer: true, email_theme: 'light', footer_bg: '#0f172a' });
    setShowPreview(false);
  };

  const buildPreviewHtmlLocal = () => buildPreviewHtml(formData.body_html, formData.use_header, formData.use_footer, formData.email_theme, formData.footer_bg || '#0f172a');

  return (
    <div className="p-8 max-w-7xl mx-auto flex gap-6 h-full animate-in fade-in duration-500">

      {/* Sidebar: Saved Designs */}
      <div className="w-60 flex flex-col shrink-0 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
          <span className="text-sm font-semibold text-stone-800">Designs</span>
          <button onClick={handleNew} className="p-1.5 bg-orange-100 text-orange-600 rounded hover:bg-orange-200 transition-colors">
            <Plus size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-[#f8f5f2]/30">
          {designs.length === 0 && (
            <div className="text-center text-xs text-stone-400 p-4">No designs yet.</div>
          )}
          {designs.map(d => (
            <div
              key={d.id}
              onClick={() => handleEdit(d)}
              className={clsx(
                'px-3 py-2.5 rounded-lg border cursor-pointer group flex justify-between items-start transition-colors',
                editingId === d.id ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-stone-200 hover:border-orange-300'
              )}
            >
              <div>
                <div className="text-sm font-medium text-stone-800 truncate max-w-[130px]">{d.name}</div>
                <div className="text-xs text-stone-500 truncate max-w-[130px]">{d.subject || 'No subject'}</div>
              </div>
              <button onClick={e => { e.stopPropagation(); handleDelete(d.id); }} className="text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-stone-100 bg-stone-50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold text-stone-900">{editingId ? 'Edit Design' : 'New Design'}</h2>
          </div>
          <div className="flex items-center gap-2">
            {showPreview && (
              <div className="flex items-center bg-stone-100 p-1 rounded-lg border border-stone-200 mr-2">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={clsx('px-2.5 py-1 text-xs rounded font-medium transition-colors', previewMode === 'desktop' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700')}
                >
                  Desktop
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={clsx('px-2.5 py-1 text-xs rounded font-medium transition-colors', previewMode === 'mobile' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700')}
                >
                  Mobile
                </button>
              </div>
            )}
            <button
              onClick={() => setShowPreview(p => !p)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-all font-medium',
                showPreview
                  ? 'bg-orange-100 text-orange-700 border-orange-300 shadow-sm'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              )}
            >
              {showPreview ? <><Code size={14} /> Edit HTML</> : <><Eye size={14} /> Preview</>}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-all shadow-sm shadow-orange-500/20"
            >
              <Save size={14} />
              {editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </div>

        {/* Meta Fields */}
        <div className="px-6 py-4 border-b border-stone-100 shrink-0 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Design Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Default Email Subject</label>
            <input type="text" name="subject" placeholder="Your Exclusive Offer Awaits!" value={formData.subject} onChange={handleChange}
              className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 placeholder:text-stone-400" />
          </div>
        </div>

        {/* Toggle Wrappers */}
        <div className="px-6 py-3 border-b border-stone-100 bg-[#f8f5f2]/50 shrink-0 flex flex-wrap gap-x-6 gap-y-3 items-center">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-stone-700">
            <input type="checkbox" name="use_header" checked={formData.use_header} onChange={handleChange}
              className="w-4 h-4 rounded border-stone-300 accent-orange-500" />
            Branded Header (Logo)
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-stone-700">
            <input type="checkbox" name="use_footer" checked={formData.use_footer} onChange={handleChange}
              className="w-4 h-4 rounded border-stone-300 accent-orange-500" />
            Branded Footer (Address / Socials)
          </label>

          {/* Footer Color Palette */}
          {formData.use_footer && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-500">Footer Color:</span>
              <div className="flex gap-1.5">
                {[
                  { color: '#0f172a', label: 'Navy Dark' },
                  { color: '#1e3a5f', label: 'Deep Blue' },
                  { color: '#1a1a2e', label: 'Midnight' },
                  { color: '#1c1c1c', label: 'Charcoal' },
                  { color: '#1d3557', label: 'Royal Blue' },
                  { color: '#2d3436', label: 'Slate' },
                  { color: '#4a1942', label: 'Deep Purple' },
                  { color: '#2d6a4f', label: 'Forest' },
                  { color: '#7f1d1d', label: 'Dark Red' },
                  { color: '#ea580c', label: 'Orange' },
                  { color: '#ffffff', label: 'White' },
                  { color: '#f8f5f2', label: 'Cream' },
                ].map(({ color, label }) => (
                  <button
                    key={color}
                    title={label}
                    onClick={() => setFormData(prev => ({ ...prev, footer_bg: color }))}
                    className="w-6 h-6 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: color,
                      borderColor: formData.footer_bg === color ? '#ea580c' : '#d1d5db',
                      boxShadow: formData.footer_bg === color ? '0 0 0 2px #fed7aa' : 'none',
                      outline: color === '#ffffff' || color === '#f8f5f2' ? '1px solid #e2e8f0' : 'none',
                    }}
                  />
                ))}
                {/* Custom color picker */}
                <label title="Custom color" className="w-6 h-6 rounded-full border-2 border-dashed border-stone-300 cursor-pointer flex items-center justify-center text-stone-400 text-xs overflow-hidden relative" style={{ backgroundColor: formData.footer_bg }}>
                  <input
                    type="color"
                    value={formData.footer_bg || '#0f172a'}
                    onChange={e => setFormData(prev => ({ ...prev, footer_bg: e.target.value }))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  ✎
                </label>
              </div>
            </div>
          )}

          {/* Theme Selector */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-medium text-stone-500">Email Theme:</span>
            {THEME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFormData(prev => ({ ...prev, email_theme: opt.value }))}
                title={opt.hint}
                className={clsx(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all font-medium',
                  formData.email_theme === opt.value
                    ? 'bg-orange-100 text-orange-700 border-orange-300 shadow-sm'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                )}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editor / Preview */}
        <div className="flex-1 min-h-0 relative bg-stone-100 flex items-center justify-center p-0">
          {showPreview ? (
            <div className={clsx(
              "h-full w-full transition-all duration-300 ease-in-out bg-white overflow-hidden shadow-xl", 
              previewMode === 'mobile' ? 'max-w-[375px] max-h-[812px] rounded-[36px] my-6 border-[12px] border-stone-800 ring-1 ring-stone-200/50 relative before:content-[""] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-32 before:h-6 before:bg-stone-800 before:rounded-b-xl' : 'w-full h-full border-0'
            )}>
              <iframe
                srcDoc={buildPreviewHtmlLocal()}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-same-origin"
                title="Email Preview"
              />
            </div>
          ) : (
            <textarea
              name="body_html"
              value={formData.body_html}
              onChange={handleChange}
              className="w-full h-full bg-stone-50 font-mono text-sm text-stone-800 p-5 resize-none focus:outline-none leading-relaxed border-none"
              placeholder="<div>Write your HTML email body here...</div>"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MailDesign;
