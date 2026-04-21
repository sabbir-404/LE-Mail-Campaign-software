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
      email_theme TEXT NOT NULL DEFAULT 'light',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migrate existing DBs — add email_theme if missing
  try {
    db.exec(`ALTER TABLE mail_designs ADD COLUMN email_theme TEXT NOT NULL DEFAULT 'light';`);
  } catch (_) { /* Column already exists, skip */ }

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

  // Contact lists table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      contact_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Contacts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      name TEXT DEFAULT '',
      extra_data TEXT DEFAULT '',
      FOREIGN KEY (list_id) REFERENCES contact_lists(id) ON DELETE CASCADE
    );
  `);

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
  use_header: number; use_footer: number; email_theme: string;
}) {
  const result = db.prepare(`
    INSERT INTO mail_designs (name, subject, body_html, use_header, use_footer, email_theme)
    VALUES (@name, @subject, @body_html, @use_header, @use_footer, @email_theme)
  `).run(design);
  return result.lastInsertRowid;
}

export function updateDesign(id: number, design: {
  name: string; subject: string; body_html: string;
  use_header: number; use_footer: number; email_theme: string;
}) {
  db.prepare(`
    UPDATE mail_designs SET
      name = @name, subject = @subject, body_html = @body_html,
      use_header = @use_header, use_footer = @use_footer, email_theme = @email_theme,
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

// ── CONTACT LISTS ─────────────────────────────────────────────
export function getAllContactLists() {
  return db.prepare('SELECT * FROM contact_lists ORDER BY created_at DESC').all();
}

export function getContactListById(id: number) {
  return db.prepare('SELECT * FROM contact_lists WHERE id = ?').get(id);
}

export function createContactList(name: string, description: string) {
  const result = db.prepare(
    `INSERT INTO contact_lists (name, description) VALUES (?, ?)`
  ).run(name, description);
  return result.lastInsertRowid as number;
}

export function deleteContactList(id: number) {
  db.prepare('DELETE FROM contacts WHERE list_id = ?').run(id);
  db.prepare('DELETE FROM contact_lists WHERE id = ?').run(id);
}

export function getContactsByListId(listId: number) {
  return db.prepare('SELECT * FROM contacts WHERE list_id = ?').all(listId);
}

export function insertContactsIntoList(listId: number, contacts: { email: string; name: string; extra_data: string }[]) {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO contacts (list_id, email, name, extra_data) VALUES (?, ?, ?, ?)`
  );
  const insertMany = db.transaction((rows: typeof contacts) => {
    for (const row of rows) {
      insert.run(listId, row.email, row.name, row.extra_data);
    }
  });
  insertMany(contacts);
  // Update count
  const count = (db.prepare('SELECT COUNT(*) as c FROM contacts WHERE list_id = ?').get(listId) as any).c;
  db.prepare('UPDATE contact_lists SET contact_count = ? WHERE id = ?').run(count, listId);
}

export function updateContactCount(listId: number) {
  const count = (db.prepare('SELECT COUNT(*) as c FROM contacts WHERE list_id = ?').get(listId) as any).c;
  db.prepare('UPDATE contact_lists SET contact_count = ? WHERE id = ?').run(count, listId);
}

export function addSingleContact(listId: number, email: string, name: string) {
  db.prepare('INSERT OR IGNORE INTO contacts (list_id, email, name, extra_data) VALUES (?, ?, ?, ?)').run(listId, email, name, '{}');
  updateContactCount(listId);
}

export function updateContact(id: number, email: string, name: string) {
  db.prepare('UPDATE contacts SET email = ?, name = ? WHERE id = ?').run(email, name, id);
}

export function deleteContact(id: number, listId: number) {
  db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
  updateContactCount(listId);
}

// ── DASHBOARD STATS ────────────────────────────────────────────
export function getDashboardStats() {
  const totalSent = (db.prepare(`SELECT COALESCE(SUM(sent_count), 0) AS total FROM campaign_history`).get() as any).total;
  const totalFailed = (db.prepare(`SELECT COALESCE(SUM(failed_count), 0) AS total FROM campaign_history`).get() as any).total;
  const totalCampaigns = (db.prepare(`SELECT COUNT(*) AS total FROM campaign_history`).get() as any).total;
  const totalContacts = (db.prepare(`SELECT COUNT(*) AS total FROM contacts`).get() as any).total;
  const totalContactLists = (db.prepare(`SELECT COUNT(*) AS total FROM contact_lists`).get() as any).total;
  const totalDesigns = (db.prepare(`SELECT COUNT(*) AS total FROM mail_designs`).get() as any).total;
  const recentCampaigns = db.prepare(
    `SELECT * FROM campaign_history ORDER BY started_at DESC LIMIT 5`
  ).all();

  return { totalSent, totalFailed, totalCampaigns, totalContacts, totalContactLists, totalDesigns, recentCampaigns };
}
