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
  getContactsByListId, insertContactsIntoList, getDashboardStats
} from './database';

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
ipcMain.handle('get-dashboard-stats', () => getDashboardStats());

// ── CONTACT LISTS ─────────────────────────────────────────────
ipcMain.handle('get-contact-lists', () => getAllContactLists());
ipcMain.handle('get-contacts', (_, listId) => getContactsByListId(listId));
ipcMain.handle('delete-contact-list', (_, id) => { deleteContactList(id); return true; });

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

const DEFAULT_HEADER = `
<div style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom: 2px solid #e2e8f0;">
  <img src="YOUR_LOGO_URL_HERE" alt="Company Logo" style="max-height: 60px;" />
</div>
<div style="padding: 20px; font-family: sans-serif; color: #1e293b;">
`;

const DEFAULT_FOOTER = `
</div>
<div style="background-color: #0f172a; padding: 30px 20px; text-align: center; color: #94a3b8; font-family: sans-serif; font-size: 14px;">
  <p style="margin: 0 0 10px 0;"><strong>Leading Edge</strong></p>
  <p style="margin: 0 0 10px 0;">House# 45, Road# 12, Sector# 10, Uttara, Dhaka</p>
  <p style="margin: 0 0 15px 0;"><a href="https://leadingedge.com.bd/" style="color: #60a5fa; text-decoration: none;">leadingedge.com.bd</a></p>
  <div style="font-size: 12px; margin-top: 20px; border-top: 1px solid #1e293b; padding-top: 15px;">
    Follow us on Social Media
  </div>
</div>
`;

ipcMain.on('start-campaign', async (event, { csvPath, contactListId, designId, designData, delay, subject }) => {
  const currentSettings: any = getSmtpSettings();
  if (!currentSettings || !currentSettings.host) {
    event.sender.send('campaign-log', { type: 'error', msg: 'SMTP Settings missing. Please save them in Settings.' });
    event.sender.send('campaign-stopped');
    return;
  }

  isCampaignRunning = true;
  event.sender.send('campaign-log', { type: 'info', msg: 'Loading HTML Template...' });
  
  let htmlTemplate = designData.body_html;
  if (designData.use_header) htmlTemplate = DEFAULT_HEADER + htmlTemplate;
  if (designData.use_footer) htmlTemplate = htmlTemplate + DEFAULT_FOOTER;

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
        await transporter.sendMail({
          from: `"${currentSettings.from_name}" <${currentSettings.from_email || currentSettings.username}>`,
          to: targetEmail,
          subject: campaignTargetSubject,
          html: htmlTemplate, 
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
