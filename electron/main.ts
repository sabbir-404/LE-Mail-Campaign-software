import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { autoUpdater } from 'electron-updater';
import csv from 'csv-parser';
import nodemailer from 'nodemailer';
import {
  initDatabase, getSmtpSettings, saveSmtpSettings,
  saveDesign, getAllDesigns, updateDesign, deleteDesign, getDesignById,
  createCampaign, updateCampaignProgress, finishCampaign, addSendRecord,
  getAllCampaigns, getCampaignRecords,
  getAllContactLists, getContactListById, createContactList, deleteContactList,
  getContactsByListId, insertContactsIntoList, getDashboardStats, addSingleContact,
  updateContact, deleteContact
} from './database';
import { LOGO_BLACK_B64, LOGO_WHITE_B64 } from './logoData';

let mainWindow: BrowserWindow | null = null;
let dbInitialized = false;
let isCampaignRunning = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    // Detect whichever port Vite is actually running on
    const port = process.env.VITE_PORT || '5173';
    mainWindow.loadURL(`http://localhost:${port}`).catch(() => {
      mainWindow?.loadURL('http://localhost:5174');
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  try {
    initDatabase();
    dbInitialized = true;
  } catch (err) {
    console.error('Failed to init DB:', err);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('ping', () => 'pong');

ipcMain.handle('get-settings', () => getSmtpSettings());
ipcMain.on('save-settings', (event, settings) => {
  saveSmtpSettings(settings);
});

ipcMain.handle('get-designs', () => getAllDesigns());
ipcMain.handle('get-design', (_, id) => getDesignById(id));
ipcMain.on('save-design', (event, design) => saveDesign(design));
ipcMain.on('update-design', (event, id, design) => updateDesign(id, design));
ipcMain.on('delete-design', (event, id) => deleteDesign(id));

ipcMain.handle('get-history', () => getAllCampaigns());
ipcMain.handle('get-history-records', (_, id) => getCampaignRecords(id));
ipcMain.handle('get-dashboard-stats', () => {
  try {
    return getDashboardStats()
  } catch (err) {
    console.error('get-dashboard-stats error', err);
    return { totalSent:0, totalFailed:0, totalCampaigns:0, totalContacts:0, totalContactLists:0, totalDesigns:0, recentCampaigns:[] };
  }
});

// ── CONTACT LISTS ─────────────────────────────────────────────
ipcMain.handle('get-contact-lists', () => getAllContactLists());
ipcMain.handle('get-contacts', (_, listId) => getContactsByListId(listId));
ipcMain.handle('delete-contact-list', (_, id) => { deleteContactList(id); return true; });
ipcMain.handle('add-contact', (_, data) => {
  addSingleContact(data.listId, data.email, data.name);
  return { success: true };
});
ipcMain.handle('update-contact', (_, data) => {
  updateContact(data.id, data.email, data.name);
  return { success: true };
});
ipcMain.handle('delete-contact', (_, data) => {
  deleteContact(data.id, data.listId);
  return { success: true };
});
ipcMain.handle('create-blank-list', (_, data) => {
  const id = createContactList(data.name, data.description);
  return { success: true, listId: id };
});

ipcMain.handle('import-contact-list', async (event, { name, description, csvPath }) => {
  const rows: any[] = [];
  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', d => rows.push(d))
        .on('end', () => resolve(true))
        .on('error', (e) => reject(e));
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  const emailKey = rows.length > 0
    ? Object.keys(rows[0]).find(k => k.toLowerCase() === 'email')
    : null;

  if (!emailKey) return { success: false, error: 'No "email" column found in CSV.' };

  const listId = createContactList(name, description);
  const contacts = rows.map(r => ({
    email: r[emailKey] || '',
    name: r['name'] || r['Name'] || r['full_name'] || '',
    extra_data: JSON.stringify(r)
  })).filter(c => c.email);

  insertContactsIntoList(listId, contacts);
  return { success: true, listId, count: contacts.length };
});

ipcMain.handle('start-campaign-from-list', async (event, { listId, designData, delay }) => {
  // Get contacts from DB instead of CSV file
  const contacts = getContactsByListId(listId);
  return contacts.map((c: any) => c.email);
});

ipcMain.on('stop-campaign', () => {
  isCampaignRunning = false;
});

ipcMain.handle('fetch-analytics', async () => {
  // Use dynamically imported node-fetch or native fetch to grab logs from tracker
  try {
    // If native fetch isn't available in this node version, use https module. Native fetch is available in Node 18+ (Electron v24+)
    const response = await fetch('https://leadingedge.com.bd/tracker.php?action=stats');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data;
  } catch (err: any) {
    console.error('fetch-analytics error:', err);
    return { success: false, error: err.message };
  }
});

// ── EMAIL TEMPLATE BUILDER ───────────────────────────────────────────────────
// theme: 'light' | 'dark' | 'adaptive'
function buildEmailHtml(bodyHtml: string, useHeader: boolean, useFooter: boolean, theme: string): string {

  const isLight  = theme === 'light';
  const isDark   = theme === 'dark';
  const isAdapt  = theme === 'adaptive';

  // Colour tokens per theme
  const bg        = isDark ? '#0f172a' : '#f1f5f9';
  const cardBg    = isDark ? '#1e293b' : '#ffffff';
  const bodyColor = isDark ? '#cbd5e1' : '#334155';
  const headerBg  = isDark ? '#0f172a' : '#ffffff';
  const headerBorder = isDark ? '#334155' : '#e2e8f0';

  const LOGO_BLACK_URL = 'https://leadingedge.com.bd/wp-content/uploads/2025/10/logo-black-scaled.png';
  const LOGO_WHITE_URL = 'https://leadingedge.com.bd/wp-content/uploads/2025/10/logo-white-scaled.png';
  const logoSrc   = isDark ? LOGO_WHITE_URL : LOGO_BLACK_URL;

  // Adaptive dark/light CSS overrides for email clients that respect prefers-color-scheme
  const adaptiveStyle = isAdapt ? `
    @media (prefers-color-scheme: dark) {
      .email-outer  { background-color: #0f172a !important; }
      .email-card   { background-color: #1e293b !important; }
      .email-header { background-color: #0f172a !important; border-bottom-color: #334155 !important; }
      .email-body   { color: #cbd5e1 !important; }
      .email-footer { background-color: #020617 !important; }
      .logo-dark    { display: none !important; }
      .logo-light   { display: inline !important; }
    }
    @media (prefers-color-scheme: light) {
      .logo-dark  { display: inline !important; }
      .logo-light { display: none !important; }
    }` : '';

  const forceColorScheme = isLight  ? 'light'
                         : isDark   ? 'dark'
                         : 'light dark';

  // Social SVG icons - 20x20 for cleaner fit in 38px circle
  const FB_SVG  = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#e2e8f0" style="display:block;"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`;
  const IG_SVG  = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="#e2e8f0" stroke="none"/></svg>`;
  const X_SVG   = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#e2e8f0" style="display:block;"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
  const LI_SVG  = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#e2e8f0" style="display:block;"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`;
  const MAP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#e2e8f0" style="display:block;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

  // Helper: renders a social icon in a perfectly centered circle (email-safe using padding)
  const socialIcon = (href: string, svg: string, label: string) =>
    `<a href="${href}" title="${label}" style="display:inline-block;margin:0 4px;text-decoration:none;">` +
      `<span style="display:inline-block;width:38px;height:38px;background:rgba(255,255,255,0.14);border-radius:50%;padding:10px;box-sizing:border-box;vertical-align:middle;">${svg}</span>` +
    `</a>`;

  const header = useHeader ? `
    <div class="email-header" style="background-color:${headerBg}; padding:16px 20px; text-align:center; border-bottom:2px solid ${headerBorder};">
      ${ isAdapt ? `
        <img class="logo-dark"  src="https://leadingedge.com.bd/wp-content/uploads/2025/10/logo-black-scaled.png" alt="Leading Edge" style="max-height:48px; max-width:200px; display:block; margin:0 auto;" />
        <img class="logo-light" src="https://leadingedge.com.bd/wp-content/uploads/2025/10/logo-white-scaled.png" alt="Leading Edge" style="max-height:48px; max-width:200px; display:none;  margin:0 auto;" />
      ` : `
        <img src="${logoSrc}" alt="Leading Edge" style="max-height:48px; max-width:200px; display:block; margin:0 auto;" />
      `}
    </div>` : '';

  const footer = useFooter ? `
    <div class="email-footer" style="background-color:#0f172a; padding:32px 24px 24px; text-align:center; color:#94a3b8; font-family:'Segoe UI',Arial,sans-serif; font-size:13px;">
      <p style="margin:0 0 5px; font-size:17px; font-weight:700; color:#f1f5f9; letter-spacing:0.5px;">Leading Edge</p>
      <p style="margin:0 0 3px; font-size:12px; color:#94a3b8;">
        <a href="https://maps.app.goo.gl/FaFjLs4K25RE3wip7" style="color:#93c5fd; text-decoration:none;">
          H-78/1, Bir Uttom Ziaur Rahman Shorok, Moakhali, Dhaka-1212
        </a>
      </p>
      <p style="margin:0 0 3px; font-size:12px; color:#94a3b8;">
        <a href="tel:01759993888" style="color:#94a3b8; text-decoration:none;">&#128222; 01759-993888</a>
      </p>
      <p style="margin:0 0 20px; font-size:12px;">
        <a href="https://leadingedge.com.bd" style="color:#93c5fd; text-decoration:none;">leadingedge.com.bd</a>
        &nbsp;&bull;&nbsp;
        <a href="mailto:sales@leadingedge.com.bd" style="color:#93c5fd; text-decoration:none;">sales@leadingedge.com.bd</a>
      </p>
      <div style="margin:0 0 20px; font-size:0;">
        ${socialIcon('https://www.facebook.com/leadingedge.bd', FB_SVG, 'Facebook')}
        ${socialIcon('https://www.instagram.com/leadingedgebd/', IG_SVG, 'Instagram')}
        ${socialIcon('https://x.com/Leadingedge_bd', X_SVG, 'X / Twitter')}
        ${socialIcon('https://www.linkedin.com/company/107868953/', LI_SVG, 'LinkedIn')}
        ${socialIcon('https://maps.app.goo.gl/FaFjLs4K25RE3wip7', MAP_SVG, 'Find us on Maps')}
      </div>
      <div style="font-size:11px; color:#475569; border-top:1px solid rgba(255,255,255,0.08); padding-top:12px; margin-top:4px;">
        &copy; ${new Date().getFullYear()} Leading Edge. All rights reserved.
      </div>
    </div>` : '';


  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="${forceColorScheme}" />
  <meta name="supported-color-schemes" content="${forceColorScheme}" />
  <style>
    :root { color-scheme: ${forceColorScheme}; }
    body  { margin:0; padding:0; -webkit-text-size-adjust:100%; }
    img   { border:0; max-width:100%; height:auto; }
    ${adaptiveStyle}
  </style>
</head>
<body>
<div class="email-outer" style="background-color:${bg}; padding:20px 10px; font-family:'Segoe UI',Arial,sans-serif;">
  <div class="email-card" style="max-width:620px; margin:0 auto; background-color:${cardBg}; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    ${header}
    <div class="email-body" style="padding:28px 32px; color:${bodyColor}; font-size:15px; line-height:1.7;">
      ${bodyHtml}
    </div>
    ${footer}
  </div>
</div>
</body></html>`;
}

ipcMain.on('start-campaign', async (event, { csvPath, contactListId, designId, designData, delay, subject }) => {
  const currentSettings: any = getSmtpSettings();
  if (!currentSettings || !currentSettings.host) {
    event.sender.send('campaign-log', { type: 'error', msg: 'SMTP Settings missing. Please save them in Settings.' });
    event.sender.send('campaign-stopped');
    return;
  }

  isCampaignRunning = true;
  event.sender.send('campaign-log', { type: 'info', msg: 'Building email template...' });

  const htmlTemplate = buildEmailHtml(
    designData.body_html,
    !!designData.use_header,
    !!designData.use_footer,
    designData.email_theme || 'light'
  );

  const campaignTargetSubject = subject || designData.subject || 'Promotional Offer';

  // Build recipients list — either from saved contact list or a CSV file
  const results: { email: string; name?: string }[] = [];

  if (contactListId) {
    event.sender.send('campaign-log', { type: 'info', msg: 'Loading contacts from saved list...' });
    const dbContacts = getContactsByListId(contactListId) as any[];
    for (const c of dbContacts) results.push({ email: c.email, name: c.name });
  } else if (csvPath) {
    event.sender.send('campaign-log', { type: 'info', msg: 'Reading CSV file...' });
    const rawRows: any[] = [];
    try {
      await new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
          .pipe(csv())
          .on('data', (data) => rawRows.push(data))
          .on('end', () => resolve(true))
          .on('error', (err) => reject(err));
      });
    } catch (err: any) {
      event.sender.send('campaign-log', { type: 'error', msg: `CSV Error: ${err.message}` });
      event.sender.send('campaign-stopped');
      return;
    }
    const emailKey = rawRows.length > 0 ? Object.keys(rawRows[0]).find(k => k.toLowerCase() === 'email') : null;
    if (!emailKey) {
      event.sender.send('campaign-log', { type: 'error', msg: 'No "email" column found in CSV.' });
      event.sender.send('campaign-stopped');
      return;
    }
    for (const row of rawRows) {
      if (row[emailKey]) results.push({ email: row[emailKey], name: row['name'] || row['Name'] || '' });
    }
  }

  if (results.length === 0) {
    event.sender.send('campaign-log', { type: 'error', msg: 'No recipients found.' });
    event.sender.send('campaign-stopped');
    isCampaignRunning = false;
    return;
  }

  event.sender.send('campaign-init', { total: results.length });

  // Init transporter
  const transporter = nodemailer.createTransport({
    host: currentSettings.host,
    port: parseInt(currentSettings.port),
    secure: parseInt(currentSettings.port) === 465, 
    auth: {
      user: currentSettings.username,
      pass: currentSettings.password,
    },
  });

  // Verify transporter early
  try {
    await transporter.verify();
    event.sender.send('campaign-log', { type: 'success', msg: 'SMTP Connection Verified successfully.' });
  } catch (err: any) {
    event.sender.send('campaign-log', { type: 'error', msg: `SMTP Connection Failed: ${err.message}` });
    event.sender.send('campaign-stopped');
    return;
  }

  let campaignId = 0;
  try {
    campaignId = createCampaign({
      campaign_name: `${designData.name || 'Quick'} Campaign - ${new Date().toLocaleDateString()}`,
      design_name: designData.name || 'Ad-Hoc Design',
      total_recipients: results.length,
      from_email: currentSettings.from_email || currentSettings.username
    });
  } catch (err: any) {
    event.sender.send('campaign-log', { type: 'error', msg: `DB Error: ${err.message}` });
  }

  let sent = 0;
  let failed = 0;
  event.sender.send('campaign-log', { type: 'info', msg: `Starting sending sequence for ${results.length} subscribers...` });

  for (let i = 0; i < results.length; i++) {
    if (!isCampaignRunning) {
      event.sender.send('campaign-log', { type: 'error', msg: 'Campaign aborted by user.' });
      break;
    }

    const row = results[i];
    const targetEmail = row.email;

    if (!targetEmail) {
      failed++;
      event.sender.send('campaign-progress', { sent, failed, currentEmail: `Missing email in row ${i+1}` });
      continue;
    }

    event.sender.send('campaign-progress', { sent, failed, currentEmail: targetEmail });

    try {
      if (isCampaignRunning) {
        // Inject tracking pixel for this specific user
        const trackingPixel = `<img src="https://leadingedge.com.bd/tracker.php?c=${campaignId}&e=${encodeURIComponent(targetEmail)}" width="1" height="1" alt="" style="display:none;" />`;
        const personalizedHtml = htmlTemplate.replace('</body>', `${trackingPixel}\n</body>`);

        await transporter.sendMail({
          from: `"${currentSettings.from_name}" <${currentSettings.from_email || currentSettings.username}>`,
          to: targetEmail,
          subject: campaignTargetSubject,
          html: personalizedHtml, 
        });
        sent++;
        addSendRecord({ campaign_id: campaignId, recipient_email: targetEmail, status: 'sent' });
        event.sender.send('campaign-log', { type: 'success', msg: `✓ Sent to ${targetEmail}` });
      }
    } catch (err: any) {
      failed++;
      addSendRecord({ campaign_id: campaignId, recipient_email: targetEmail, status: 'failed', error_message: err.message });
      event.sender.send('campaign-log', { type: 'error', msg: `✗ Failed → ${targetEmail}: ${err.message}` });
    }

    updateCampaignProgress(campaignId, sent, failed);
    event.sender.send('campaign-progress', { sent, failed, currentEmail: isCampaignRunning ? targetEmail : 'Stopping...' });

    // Delay if there are more emails left to respect SMTP rate limits
    if (i < results.length - 1 && isCampaignRunning) {
      await new Promise(r => setTimeout(r, delay * 1000));
    }
  }

  finishCampaign(campaignId, sent, failed, isCampaignRunning ? 'completed' : 'aborted');
  event.sender.send('campaign-log', { type: 'info', msg: `Campaign finished. Sent: ${sent}, Failed: ${failed}` });
  event.sender.send('campaign-stopped');
  isCampaignRunning = false;
});
