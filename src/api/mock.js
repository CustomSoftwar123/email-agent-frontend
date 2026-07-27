const clone = (v) => JSON.parse(JSON.stringify(v))
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))
const db = {
  status: { poller_running: true, sent_today: 14, daily_limit: 200, threads: 37, leads: 11 },
  mailboxes: [
    { id: 1, email: 'sales@yourco.com', provider: 'gmail', is_primary: true, leads_action: true, status: 'connected' },
    { id: 2, email: 'hello@yourco.com', provider: 'outlook', is_primary: false, leads_action: false, status: 'connected' },
    { id: 3, email: 'support@yourco.co', provider: 'imap', is_primary: false, leads_action: false, status: 'error' },
  ],
  settings: {
    company: { name: 'YourCo Ltd', description: 'We build custom software for SMBs.',
      pricing: 'Projects start at $2,000. Hourly rate $60.', address: '12 High Street, Dublin, Ireland' },
    agent: { persona: 'Friendly, concise sales rep. Never pushy. Always sign off with the company name.',
      daily_send_limit: 200, capture_leads: true },
  },
  prospects: [
    { id: 1, name: 'Ali Raza', email: 'ali@acme.com', status: 'queued' },
    { id: 2, name: 'Sara Khan', email: 'sara@globex.io', status: 'sent' },
    { id: 3, name: 'John Doe', email: 'john@initech.com', status: 'replied' },
  ],
  conversations: [
    { id: 't1', counterparty: 'sara@globex.io', subject: 'Re: Quick question about your software',
      lead_status: 'warm', updated_at: '2026-07-27 09:12', messages: [
        { from: 'agent', at: '2026-07-26 10:00', body: 'Hi Sara, saw Globex is scaling — we build custom tools for teams like yours. Worth a quick chat? — YourCo' },
        { from: 'lead', at: '2026-07-27 08:40', body: 'Yes, interested. What would a small internal dashboard cost roughly?' },
        { from: 'agent', at: '2026-07-27 09:12', body: 'Great! Projects start around $2,000. Could you share a good phone number so we can walk through it? — YourCo' } ] },
    { id: 't2', counterparty: 'john@initech.com', subject: 'Re: Introduction',
      lead_status: 'hot', updated_at: '2026-07-27 07:20', messages: [
        { from: 'agent', at: '2026-07-25 14:00', body: 'Hi John, quick note from YourCo — we help teams automate email follow-ups. Open to a chat? — YourCo' },
        { from: 'lead', at: '2026-07-27 07:20', body: 'Sounds good. Call me at +353 87 123 4567 tomorrow.' } ] },
  ],
  leads: [
    { id: 1, name: 'John Doe', email: 'john@initech.com', phone: '+353 87 123 4567', status: 'hot', captured_at: '2026-07-27 07:21' },
    { id: 2, name: 'Sara Khan', email: 'sara@globex.io', phone: '', status: 'warm', captured_at: '2026-07-27 09:12' },
  ],
}
let ids = 100; const nextId = () => ++ids
export const mock = {
  async getStatus() { await delay(); return clone(db.status) },
  async getMailboxes() { await delay(); return clone(db.mailboxes) },
  async addMailbox(m) { await delay(); const row = { id: nextId(), status: 'connected', is_primary: false, leads_action: false, ...m }; db.mailboxes.push(row); return clone(row) },
  async deleteMailbox(id) { await delay(); db.mailboxes = db.mailboxes.filter((m) => m.id !== id); return { ok: true } },
  async getSettings() { await delay(); return clone(db.settings) },
  async saveSettings(s) { await delay(); db.settings = clone(s); return clone(db.settings) },
  async getProspects() { await delay(); return clone(db.prospects) },
  async addProspects(rows) { await delay(); const added = rows.map((r) => ({ id: nextId(), status: 'queued', ...r })); db.prospects.push(...added); return clone(added) },
  async startOutreach(idList) { await delay(500); db.prospects.forEach((p) => { if (idList.includes(p.id) && p.status === 'queued') p.status = 'sent' }); return { ok: true, started: idList.length } },
  async getConversations() { await delay(); return clone(db.conversations) },
  async getConversation(id) { await delay(); return clone(db.conversations.find((c) => c.id === id)) },
  async getLeads() { await delay(); return clone(db.leads) },
}
