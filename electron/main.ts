import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { autoUpdater } from 'electron-updater';
import csv from 'csv-parser';
import nodemailer from 'nodemailer';

let mainWindow: BrowserWindow | null = null;
let currentSettings: any = null;
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

  const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
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

ipcMain.on('save-settings', (event, settings) => {
  currentSettings = settings;
  console.log('Main process saved SMTP settings');
});

ipcMain.on('stop-campaign', () => {
  isCampaignRunning = false;
});

ipcMain.on('start-campaign', async (event, { csvPath, htmlPath, delay }) => {
  if (!currentSettings || !currentSettings.host) {
    event.sender.send('campaign-log', { type: 'error', msg: 'SMTP Settings missing. Please save them first.' });
    event.sender.send('campaign-stopped');
    return;
  }

  isCampaignRunning = true;
  event.sender.send('campaign-log', { type: 'info', msg: 'Parsing HTML Template...' });
  
  let htmlTemplate = '';
  try {
    htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
  } catch (err: any) {
    event.sender.send('campaign-log', { type: 'error', msg: `Failed to read HTML file: ${err.message}` });
    event.sender.send('campaign-stopped');
    return;
  }

  event.sender.send('campaign-log', { type: 'info', msg: 'Reading CSV list...' });
  
  const results: any[] = [];
  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(true))
        .on('error', (err) => reject(err));
    });
  } catch (err: any) {
    event.sender.send('campaign-log', { type: 'error', msg: `CSV Error: ${err.message}` });
    event.sender.send('campaign-stopped');
    return;
  }

  if (results.length === 0) {
    event.sender.send('campaign-log', { type: 'error', msg: 'CSV is empty or invalid.' });
    event.sender.send('campaign-stopped');
    return;
  }

  event.sender.send('campaign-init', { total: results.length });

  // Init transporter
  const transporter = nodemailer.createTransport({
    host: currentSettings.host,
    port: parseInt(currentSettings.port),
    secure: parseInt(currentSettings.port) === 465, 
    auth: {
      user: currentSettings.user,
      pass: currentSettings.pass,
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

  let sent = 0;
  let failed = 0;
  event.sender.send('campaign-log', { type: 'info', msg: `Starting sending sequence for ${results.length} subscribers...` });

  for (let i = 0; i < results.length; i++) {
    if (!isCampaignRunning) {
      event.sender.send('campaign-log', { type: 'error', msg: 'Campaign aborted by user.' });
      break;
    }

    const row = results[i];
    // We assume the CSV has a column 'email' or 'Email'. Let's find it flexibly.
    const emailKey = Object.keys(row).find(k => k.toLowerCase() === 'email');
    const targetEmail = emailKey ? row[emailKey] : null;

    if (!targetEmail) {
      failed++;
      event.sender.send('campaign-progress', { sent, failed, currentEmail: `No email column in row ${i+1}` });
      continue;
    }

    event.sender.send('campaign-progress', { sent, failed, currentEmail: targetEmail });

    try {
      await transporter.sendMail({
        from: `"${currentSettings.fromName}" <${currentSettings.fromEmail}>`,
        to: targetEmail,
        subject: row.subject || row.Subject || 'Promotional Offer', // Basic fallback or dynamic subject
        html: htmlTemplate, 
      });
      sent++;
      event.sender.send('campaign-log', { type: 'success', msg: `Sent to ${targetEmail}` });
    } catch (err: any) {
      failed++;
      event.sender.send('campaign-log', { type: 'error', msg: `Failed sending to ${targetEmail}: ${err.message}` });
    }

    event.sender.send('campaign-progress', { sent, failed, currentEmail: isCampaignRunning ? targetEmail : 'Stopping...' });

    // Delay if there are more emails left to respect SMTP rate limits
    if (i < results.length - 1 && isCampaignRunning) {
      await new Promise(r => setTimeout(r, delay * 1000));
    }
  }

  event.sender.send('campaign-log', { type: 'info', msg: `Campaign finished. Sent: ${sent}, Failed: ${failed}` });
  event.sender.send('campaign-stopped');
  isCampaignRunning = false;
});
