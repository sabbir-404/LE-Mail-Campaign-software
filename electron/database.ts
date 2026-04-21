import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';

let db: Database.Database;

export function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'le_mail_campaign.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Mail designs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS mail_designs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '',
      body_html TEXT NOT NULL DEFAULT '',
      use_header INTEGER NOT NULL DEFAULT 1,
      use_footer INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Campaign history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaign_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_name TEXT NOT NULL,
      design_name TEXT,
      total_recipients INTEGER NOT NULL DEFAULT 0,
      sent_count INTEGER NOT NULL DEFAULT 0,
      failed_count INTEGER NOT NULL DEFAULT 0,
      from_email TEXT,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      finished_at TEXT,
      status TEXT NOT NULL DEFAULT 'running'
    );
  `);

  // Individual send records
  db.exec(`
    CREATE TABLE IF NOT EXISTS send_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      recipient_email TEXT NOT NULL,
      status TEXT NOT NULL,
      error_message TEXT,
      sent_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (campaign_id) REFERENCES campaign_history(id)
    );
  `);

  // SMTP Settings stored in DB
  db.exec(`
    CREATE TABLE IF NOT EXISTS smtp_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      host TEXT DEFAULT '',
      port TEXT DEFAULT '465',
      username TEXT DEFAULT '',
      password TEXT DEFAULT '',
      from_name TEXT DEFAULT '',
      from_email TEXT DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Ensure there is always one settings row
  db.exec(`INSERT OR IGNORE INTO smtp_settings (id) VALUES (1);`);

  console.log('Database initialized at:', dbPath);
  return db;
}

// ── SMTP SETTINGS ─────────────────────────────────────────────
export function getSmtpSettings() {
  return db.prepare('SELECT * FROM smtp_settings WHERE id = 1').get();
}

export function saveSmtpSettings(settings: {
  host: string; port: string; username: string;
  password: string; fromName: string; fromEmail: string;
}) {
  db.prepare(`
    UPDATE smtp_settings SET
      host = @host, port = @port, username = @username,
      password = @password, from_name = @fromName, from_email = @fromEmail,
      updated_at = datetime('now')
    WHERE id = 1
  `).run(settings);
}

// ── MAIL DESIGNS ─────────────────────────────────────────────
export function getAllDesigns() {
  return db.prepare('SELECT * FROM mail_designs ORDER BY updated_at DESC').all();
}

export function getDesignById(id: number) {
  return db.prepare('SELECT * FROM mail_designs WHERE id = ?').get(id);
}

export function saveDesign(design: {
  name: string; subject: string; body_html: string;
  use_header: number; use_footer: number;
}) {
  const result = db.prepare(`
    INSERT INTO mail_designs (name, subject, body_html, use_header, use_footer)
    VALUES (@name, @subject, @body_html, @use_header, @use_footer)
  `).run(design);
  return result.lastInsertRowid;
}

export function updateDesign(id: number, design: {
  name: string; subject: string; body_html: string;
  use_header: number; use_footer: number;
}) {
  db.prepare(`
    UPDATE mail_designs SET
      name = @name, subject = @subject, body_html = @body_html,
      use_header = @use_header, use_footer = @use_footer,
      updated_at = datetime('now')
    WHERE id = ${id}
  `).run(design);
}

export function deleteDesign(id: number) {
  db.prepare('DELETE FROM mail_designs WHERE id = ?').run(id);
}

// ── CAMPAIGN HISTORY ─────────────────────────────────────────
export function createCampaign(data: {
  campaign_name: string; design_name: string;
  total_recipients: number; from_email: string;
}) {
  const result = db.prepare(`
    INSERT INTO campaign_history (campaign_name, design_name, total_recipients, from_email)
    VALUES (@campaign_name, @design_name, @total_recipients, @from_email)
  `).run(data);
  return result.lastInsertRowid as number;
}

export function updateCampaignProgress(id: number, sent: number, failed: number) {
  db.prepare(`
    UPDATE campaign_history SET sent_count = ?, failed_count = ? WHERE id = ?
  `).run(sent, failed, id);
}

export function finishCampaign(id: number, sent: number, failed: number, status: string) {
  db.prepare(`
    UPDATE campaign_history SET
      sent_count = ?, failed_count = ?, status = ?, finished_at = datetime('now')
    WHERE id = ?
  `).run(sent, failed, status, id);
}

export function addSendRecord(record: {
  campaign_id: number; recipient_email: string;
  status: string; error_message?: string;
}) {
  db.prepare(`
    INSERT INTO send_records (campaign_id, recipient_email, status, error_message)
    VALUES (@campaign_id, @recipient_email, @status, @error_message)
  `).run({ error_message: null, ...record });
}

export function getAllCampaigns() {
  return db.prepare('SELECT * FROM campaign_history ORDER BY started_at DESC').all();
}

export function getCampaignRecords(campaign_id: number) {
  return db.prepare('SELECT * FROM send_records WHERE campaign_id = ? ORDER BY sent_at DESC').all(campaign_id);
}
