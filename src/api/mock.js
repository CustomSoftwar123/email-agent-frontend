const clone = (v) => JSON.parse(JSON.stringify(v))
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

// Sample store. These shapes are the contract the real backend must return —
// set VITE_USE_MOCK=0 to bypass this layer and call the live API instead.

// Last 14 days, driving the dashboard column chart and the tile sparklines.
const daily = [
  { label: 'Jul 14', sent: 22, replies: 4 },
  { label: 'Jul 15', sent: 18, replies: 3 },
  { label: 'Jul 16', sent: 26, replies: 6 },
  { label: 'Jul 17', sent: 31, replies: 7 },
  { label: 'Jul 18', sent: 14, replies: 2 },
  { label: 'Jul 19', sent: 6, replies: 1 },
  { label: 'Jul 20', sent: 9, replies: 1 },
  { label: 'Jul 21', sent: 28, replies: 5 },
  { label: 'Jul 22', sent: 34, replies: 9 },
  { label: 'Jul 23', sent: 25, replies: 6 },
  { label: 'Jul 24', sent: 19, replies: 4 },
  { label: 'Jul 25', sent: 8, replies: 2 },
  { label: 'Jul 26', sent: 11, replies: 3 },
  { label: 'Jul 27', sent: 14, replies: 5 },
]

const db = {
  status: {
    poller_running: true,
    poll_interval: 30,
    sent_today: 14,
    daily_limit: 200,
    threads: 37,
    leads: 11,
    replies_today: 5,
    reply_rate: 21,
    deltas: { sent: 27, threads: 12, leads: 18, replies: -8 },
    daily,
  },

  services: {
    poller: { running: true, interval_seconds: 30, started_at: '2026-07-27 05:02', uptime: '4h 12m', watchers: 3 },
    outreach_runner: { last_run: '2026-07-27 08:12', source: 'prospects.csv', last_batch: 6 },
  },

  storage: {
    database: 'sqlite:///agent.db',
    leads_out: 'leads.csv',
    size_kb: 412,
    counts: { conversations: 37, messages: 148, send_locks: 62, reply_locks: 2, lead_ledger: 11, leads: 11 },
  },

  locks: {
    send: [
      { id: 1, prospect: 'Ali Raza', email: 'ali@acme.com', locked_at: '2026-07-27 08:12', state: 'held' },
      { id: 2, prospect: 'Sara Khan', email: 'sara@globex.io', locked_at: '2026-07-26 10:00', state: 'released' },
    ],
    reply: [
      { id: 1, conversation: 't1', counterparty: 'sara@globex.io', message_id: '<c9f2@globex.io>', acquired_at: '2026-07-27 09:11', state: 'released' },
      { id: 2, conversation: 't2', counterparty: 'john@initech.com', message_id: '<a41b@initech.com>', acquired_at: '2026-07-27 07:20', state: 'held' },
    ],
    lead: [
      { id: 1, conversation: 't2', email: 'john@initech.com', captured_at: '2026-07-27 07:21', reason: 'shared a phone number' },
      { id: 2, conversation: 't1', email: 'sara@globex.io', captured_at: '2026-07-27 09:12', reason: 'classified warm' },
    ],
  },

  activity: [
    { id: 1, type: 'lead', at: '09:12', title: 'Lead captured — Sara Khan', detail: 'sara@globex.io · warm' },
    { id: 2, type: 'reply', at: '08:40', title: 'Reply received', detail: 'Globex asked about pricing' },
    { id: 3, type: 'sent', at: '08:12', title: '6 cold emails sent', detail: 'outreach runner · prospects.csv' },
    { id: 4, type: 'lead', at: '07:21', title: 'Lead captured — John Doe', detail: 'phone number shared · hot' },
    { id: 5, type: 'error', at: '06:03', title: 'IMAP auth failed', detail: 'support@yourco.co — check the password' },
    { id: 6, type: 'sent', at: '05:30', title: '8 cold emails sent', detail: 'outreach runner · prospects.csv' },
  ],

  agents: [
    {
      id: 2, name: 'Usman Ali', dob: '1996-03-14', gender: 'Male', personality: 'Professional',
      roles: ['Email Agent'], leads_action: true,
      description: 'You are a professional sales rep for {{company_name}}. Keep replies under 120 words and always sign off with the company name.',
      company: {
        name: 'YourCo Ltd',
        email: 'hello@yourco.com',
        address: '12 High Street, Dublin, Ireland',
        country: 'Ireland',
        region: 'Europe/Dublin',
        description: 'We build custom software for SMBs.',
        pricing: 'Projects start at $2,000. Hourly rate $60.',
        business_type: 'Service',
        service_knowledge: 'Custom dashboards, internal tools, API integrations and email automation. Typical delivery 4-6 weeks.',
        product_knowledge: '',
        global_prompt: 'Always be concise, never invent pricing, and ask for a phone number once the prospect shows interest.',
      },
      provider: 'Gmail',
      connection: { status: 'connected', email: 'sales@yourco.com', detail: 'OAuth token · refreshes in 42m' },
      is_primary: true, watcher: 'running', bookmark: 'UID 18422', last_checked: '18s ago', sent_30d: 184,
    },
    {
      id: 4, name: 'Abc', dob: '2001-08-02', gender: 'Female', personality: 'Friendly',
      roles: ['Email Agent'], leads_action: false,
      description: 'You are a friendly assistant for {{company_name}}. Answer questions about {{service_knowledge}} and never pressure the prospect.',
      company: {
        name: 'Umbrella Labs',
        email: 'hello@umbrella.dev',
        address: '4 Dame Lane, Dublin, Ireland',
        country: 'Ireland',
        region: 'Europe/Dublin',
        description: 'We run first-line support inboxes for dev teams.',
        pricing: 'From $400/month per inbox.',
        business_type: 'Service',
        service_knowledge: 'Triage, first-line replies, escalation rules and weekly reporting on inbox volume.',
        product_knowledge: '',
        global_prompt: 'Be warm and helpful. Never promise a deadline. Offer a 14-day trial when asked about cost.',
      },
      provider: 'Outlook',
      connection: { status: 'connected', email: 'hello@yourco.com', detail: 'OAuth token · refreshes in 2h 10m' },
      is_primary: false, watcher: 'running', bookmark: 'UID 9031', last_checked: '24s ago', sent_30d: 76,
    },
    {
      id: 5, name: 'zain', dob: '2003-12-07', gender: 'Male', personality: 'Confident',
      roles: ['Email Agent'], leads_action: true,
      description: 'You are a confident sales rep for {{company_name}} at {{company_address}}. Quote pricing only when asked.',
      company: {
        name: 'Arna Software',
        email: 'ocmsoftware2026@gmail.com',
        address: 'Model Town F Block, Lahore',
        country: 'Pakistan',
        region: 'Asia/Karachi',
        description: 'Arna Software builds custom web, mobile and enterprise systems.',
        pricing: 'It can vary on services, so there is no fixed pricing.',
        business_type: 'Service',
        service_knowledge:
          '1. Custom Software Development\n2. Web Application Development\n3. Enterprise Systems, ERP and CRM',
        product_knowledge: '',
        global_prompt: 'Introduce the company briefly, then ask what the prospect needs built.',
      },
      provider: 'IMAP',
      connection: { status: 'error', email: 'support@yourco.co', detail: 'imap.yourco.co:993 · auth failed' },
      is_primary: false, watcher: 'error', bookmark: 'UID 2210', last_checked: '6h ago', sent_30d: 0,
    },
  ],

  settings: {
    company: {
      name: '',
      email: '',
      description: '',
      pricing: '',
      address: '',
      country: '',
      region: '',
      business_type: 'Service',
      email_agent: true,
      service_knowledge: '',
      product_knowledge: '',
      global_prompt: '',
    },
    agent: {
      persona: 'Friendly, concise sales rep. Never pushy. Always sign off with the company name.',
      daily_send_limit: 200,
      capture_leads: true,
    },
    storage: { database: 'sqlite:///agent.db', leads_out: 'leads.csv' },
    ai: { model: 'gpt-4o-mini', api_key: 'sk-live-9f4c2b7a1e8d' },
  },

  prospects: [
    { id: 1, name: 'Ali Raza', email: 'ali@acme.com', status: 'queued', added_at: 'Jul 27', mailbox: 'sales@yourco.com', send_lock: 'none' },
    { id: 2, name: 'Sara Khan', email: 'sara@globex.io', status: 'sent', added_at: 'Jul 26', mailbox: 'sales@yourco.com', send_lock: 'released' },
    { id: 3, name: 'John Doe', email: 'john@initech.com', status: 'replied', added_at: 'Jul 25', mailbox: 'sales@yourco.com', send_lock: 'released' },
    { id: 4, name: 'Mei Lin', email: 'mei@umbrella.dev', status: 'queued', added_at: 'Jul 27', mailbox: 'hello@yourco.com', send_lock: 'none' },
    { id: 5, name: 'Tom Byrne', email: 'tom@hooli.com', status: 'bounced', added_at: 'Jul 24', mailbox: 'hello@yourco.com', send_lock: 'released' },
  ],

  conversations: [
    {
      id: 't1', counterparty: 'sara@globex.io', name: 'Sara Khan',
      subject: 'Re: Quick question about your software', lead_status: 'warm',
      mailbox: 'sales@yourco.com', reply_lock: 'released', lead_captured: true,
      updated_at: '2026-07-27 09:12',
      messages: [
        { from: 'agent', at: '2026-07-26 10:00', body: 'Hi Sara, saw Globex is scaling — we build custom tools for teams like yours. Worth a quick chat? — YourCo' },
        { from: 'lead', at: '2026-07-27 08:40', body: 'Yes, interested. What would a small internal dashboard cost roughly?' },
        { from: 'agent', at: '2026-07-27 09:12', body: 'Great! Projects start around $2,000. Could you share a good phone number so we can walk through it? — YourCo' },
      ],
    },
    {
      id: 't2', counterparty: 'john@initech.com', name: 'John Doe',
      subject: 'Re: Introduction', lead_status: 'hot',
      mailbox: 'sales@yourco.com', reply_lock: 'held', lead_captured: true,
      updated_at: '2026-07-27 07:20',
      messages: [
        { from: 'agent', at: '2026-07-25 14:00', body: 'Hi John, quick note from YourCo — we help teams automate email follow-ups. Open to a chat? — YourCo' },
        { from: 'lead', at: '2026-07-27 07:20', body: 'Sounds good. Call me at +353 87 123 4567 tomorrow.' },
      ],
    },
  ],

  leads: [
    { id: 1, name: 'John Doe', email: 'john@initech.com', phone: '+353 87 123 4567', status: 'hot', pipeline: 'Contacted', source: 'Cold outreach', reference: 'OUT-1042', assigned_to: 'Agent', captured_at: '2026-07-27 07:21', conversation: 't2' },
    { id: 2, name: 'Sara Khan', email: 'sara@globex.io', phone: '', status: 'warm', pipeline: 'Follow-up', source: 'Cold outreach', reference: 'OUT-1039', assigned_to: 'Agent', captured_at: '2026-07-27 09:12', conversation: 't1' },
  ],

  emails: [
    { id: 1, folder: 'inbox', from_name: 'Crypto.com', from_email: 'news@crypto.com', to: 'sales@yourco.com', subject: 'Tech Q2 Earnings Season Is Coming — Are You Ready?', body: 'Get exposure to Apple, Microsoft and Nvidia ahead of Q2 earnings. Trade stock tokens with zero commission this month only.', date_sent: 'Fri, 24 Jul 2026 13:31:50 +0000 (UTC)' },
    { id: 2, folder: 'inbox', from_name: 'Google', from_email: 'no-reply@accounts.google.com', to: 'sales@yourco.com', subject: 'Security alert', body: 'You allowed Email Agent access to your Google Account. If you did not do this, check your account activity.', date_sent: 'Fri, 24 Jul 2026 09:20:30 GMT' },
    { id: 3, folder: 'inbox', from_name: 'Sara Khan', from_email: 'sara@globex.io', to: 'sales@yourco.com', subject: 'Re: Quick question about your software', body: 'Yes, interested. What would a small internal dashboard cost roughly? We are about 40 people and everything is in spreadsheets right now.', date_sent: 'Mon, 27 Jul 2026 08:40:12 GMT' },
    { id: 4, folder: 'inbox', from_name: 'John Doe', from_email: 'john@initech.com', to: 'sales@yourco.com', subject: 'Re: Introduction', body: 'Sounds good. Call me at +353 87 123 4567 tomorrow, mornings are best.', date_sent: 'Mon, 27 Jul 2026 07:20:02 GMT' },
    { id: 5, folder: 'inbox', from_name: 'Mei Lin', from_email: 'mei@umbrella.dev', to: 'hello@yourco.com', subject: 'Re: Automating your support inbox', body: 'Not right now, maybe revisit in Q4. Thanks for reaching out though.', date_sent: 'Sun, 26 Jul 2026 16:45:31 GMT' },
    { id: 6, folder: 'sent', from_name: 'YourCo', from_email: 'sales@yourco.com', to: 'sara@globex.io', subject: 'Re: Quick question about your software', body: 'Great! Projects start around $2,000. Could you share a good phone number so we can walk through it? — YourCo', date_sent: 'Mon, 27 Jul 2026 09:12:44 GMT' },
    { id: 7, folder: 'sent', from_name: 'YourCo', from_email: 'sales@yourco.com', to: 'ali@acme.com', subject: 'Custom tooling for Acme', body: 'Hi Ali, we build internal tools for teams like Acme. Worth a quick chat? — YourCo', date_sent: 'Mon, 27 Jul 2026 08:12:03 GMT' },
    { id: 8, folder: 'sent', from_name: 'YourCo', from_email: 'hello@yourco.com', to: 'mei@umbrella.dev', subject: 'Automating your support inbox', body: 'Hi Mei — we automate first-line email replies for dev teams. Worth 10 minutes? — YourCo', date_sent: 'Sun, 26 Jul 2026 11:00:19 GMT' },
  ],

  ai_emails: [
    { id: 1, contact_name: 'Sara Khan', lead_name: 'Globex', email: 'sara@globex.io', mailbox: 'sales@yourco.com', workflow: 'reply', subject: 'Re: Quick question about your software', content: 'Great! Projects start around $2,000. Could you share a good phone number so we can walk through it? — YourCo', status: 'replied', sent_at: '2026-07-27 09:12', opened_at: '2026-07-27 09:20', clicked_at: null, replied_at: '2026-07-27 09:41' },
    { id: 2, contact_name: 'John Doe', lead_name: 'Initech', email: 'john@initech.com', mailbox: 'sales@yourco.com', workflow: 'outreach', subject: 'Introduction', content: 'Hi John, quick note from YourCo — we help teams automate email follow-ups. Open to a chat? — YourCo', status: 'replied', sent_at: '2026-07-25 14:00', opened_at: '2026-07-26 08:14', clicked_at: '2026-07-26 08:15', replied_at: '2026-07-27 07:20' },
    { id: 3, contact_name: 'Ali Raza', lead_name: 'Acme', email: 'ali@acme.com', mailbox: 'sales@yourco.com', workflow: 'outreach', subject: 'Custom tooling for Acme', content: 'Hi Ali, we build internal tools for teams like Acme. Worth a quick chat? — YourCo', status: 'opened', sent_at: '2026-07-27 08:12', opened_at: '2026-07-27 08:44', clicked_at: null, replied_at: null },
  ],
}

let ids = 100
const nextId = () => ++ids

export const mock = {
  async getStatus() { await delay(); return clone(db.status) },
  async getActivity() { await delay(); return clone(db.activity) },

  async getSystem() {
    await delay()
    return clone({ services: db.services, storage: db.storage, locks: db.locks })
  },
  async setPoller(running) {
    await delay(400)
    db.services.poller.running = running
    db.status.poller_running = running
    db.agents.forEach((a) => {
      if (a.connection.status === 'connected') a.watcher = running ? 'running' : 'stopped'
    })
    return clone(db.services.poller)
  },

  /* ------------------------------------------------------------- agents.
     Each agent carries its own email connection, so the mailbox list is
     derived from the agents rather than kept separately. */
  async getAgents() { await delay(); return clone(db.agents) },
  async getAgent(id) { await delay(); return clone(db.agents.find((a) => a.id === Number(id))) },
  async saveAgent(agent) {
    await delay(500)
    const i = db.agents.findIndex((a) => a.id === agent.id)
    if (i === -1) return null
    db.agents[i] = { ...db.agents[i], ...clone(agent) }
    return clone(db.agents[i])
  },
  async addAgent(agent) {
    await delay(500)
    const row = {
      id: nextId(),
      gender: '',
      personality: 'Friendly',
      roles: ['Email Agent'],
      leads_action: true,
      description: '',
      company: {
        name: '', email: '', address: '', country: '', region: '',
        description: '', pricing: '', business_type: 'Service',
        service_knowledge: '', product_knowledge: '', global_prompt: '',
      },
      provider: 'Gmail',
      connection: { status: 'disconnected', email: '', detail: 'Not connected yet' },
      is_primary: false,
      watcher: 'stopped',
      bookmark: 'not set',
      last_checked: 'never',
      sent_30d: 0,
      ...agent,
    }
    db.agents.push(row)
    return clone(row)
  },
  /** Update only this agent's company profile. */
  async saveAgentCompany(id, company) {
    await delay(450)
    const agent = db.agents.find((a) => a.id === Number(id))
    if (!agent) return null
    agent.company = { ...agent.company, ...clone(company) }
    return clone(agent)
  },
  async deleteAgent(id) {
    await delay()
    db.agents = db.agents.filter((a) => a.id !== id)
    return { ok: true }
  },
  /** OAuth handshake for Gmail / Outlook — opens a provider consent screen. */
  async connectProvider(id, provider, email) {
    await delay(900)
    const agent = db.agents.find((a) => a.id === id)
    if (!agent) return null
    agent.provider = provider
    agent.connection = {
      status: 'connected',
      email: email || `${agent.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      detail: 'OAuth token stored · refreshes automatically',
    }
    agent.watcher = db.services.poller.running ? 'running' : 'stopped'
    return clone(agent)
  },
  /** IMAP/SMTP credentials, written to the local config file. */
  async saveImap(id, creds) {
    await delay(900)
    const agent = db.agents.find((a) => a.id === id)
    if (!agent) return null
    agent.provider = 'IMAP'
    agent.connection = {
      status: 'connected',
      email: creds.email || creds.username,
      detail: `${creds.imap_host}:${creds.imap_port} · ${creds.encryption ?? 'SSL'}`,
    }
    agent.watcher = db.services.poller.running ? 'running' : 'stopped'
    return clone(agent)
  },
  async disconnectProvider(id) {
    await delay(400)
    const agent = db.agents.find((a) => a.id === id)
    if (!agent) return null
    agent.connection = { status: 'disconnected', email: '', detail: 'Not connected' }
    agent.watcher = 'stopped'
    return clone(agent)
  },

  /** Mailboxes are the connected agents — kept for the compose/outreach pickers. */
  async getMailboxes() {
    await delay()
    return db.agents
      .filter((a) => a.connection.status === 'connected')
      .map((a) => ({
        id: a.id,
        email: a.connection.email,
        provider: a.provider.toLowerCase(),
        agent: a.name,
        is_primary: a.is_primary,
        leads_action: a.leads_action,
        status: a.connection.status === 'connected' ? 'connected' : 'error',
        watcher: a.watcher,
        bookmark: a.bookmark,
        last_checked: a.last_checked,
        sent_30d: a.sent_30d,
      }))
  },

  async getSettings() { await delay(); return clone(db.settings) },
  async saveSettings(s) { await delay(); db.settings = clone(s); return clone(db.settings) },

  async getProspects() { await delay(); return clone(db.prospects) },
  async addProspects(rows) {
    await delay()
    const added = rows.map((r) => ({
      id: nextId(),
      status: 'queued',
      added_at: 'Jul 27',
      mailbox: db.agents.find((a) => a.leads_action && a.connection.status === 'connected')?.connection.email
        ?? db.agents[0]?.connection.email ?? '—',
      send_lock: 'none',
      ...r,
    }))
    db.prospects.push(...added)
    return clone(added)
  },
  async startOutreach(idList) {
    await delay(600)
    let started = 0
    db.prospects.forEach((p) => {
      // The one-time send lock is what makes re-running the list safe.
      if (idList.includes(p.id) && p.status === 'queued' && p.send_lock === 'none') {
        p.status = 'sent'
        p.send_lock = 'released'
        started += 1
        db.locks.send.unshift({
          id: nextId(),
          prospect: p.name,
          email: p.email,
          locked_at: '2026-07-27 09:40',
          state: 'released',
        })
      }
    })
    db.services.outreach_runner.last_run = '2026-07-27 09:40'
    db.services.outreach_runner.last_batch = started
    db.storage.counts.send_locks += started
    return { ok: true, started, skipped: idList.length - started }
  },

  async getConversations() { await delay(); return clone(db.conversations) },
  async getConversation(id) { await delay(); return clone(db.conversations.find((c) => c.id === id)) },

  /** Short + detailed AI summary of a thread. */
  async summarise(conversationId) {
    await delay(900)
    const c = db.conversations.find((x) => x.id === conversationId)
    if (!c) return null
    const inbound = c.messages.filter((m) => m.from === 'lead').length
    return {
      short: `${c.name || c.counterparty} is ${c.lead_status} — ${inbound} inbound message${inbound === 1 ? '' : 's'} on "${c.subject.replace(/^Re:\s*/, '')}".`,
      detailed: [
        `The agent opened this thread from ${c.mailbox} and has exchanged ${c.messages.length} messages.`,
        `The prospect replied and is currently classified ${c.lead_status}.`,
        c.lead_captured
          ? 'They have been written to the local leads file — capture will not repeat for this conversation.'
          : 'No lead has been captured yet; the agent is waiting for genuine interest or a phone number.',
        `The reply lock is ${c.reply_lock}, so every incoming message is answered exactly once.`,
      ].join(' '),
    }
  },

  /** Manual send from a connected mailbox — the Compose action. */
  async sendEmail({ from, to, cc, subject, body }) {
    await delay(700)
    const row = {
      id: nextId(),
      contact_name: to.split('@')[0],
      lead_name: (to.split('@')[1] || '').split('.')[0],
      email: to,
      mailbox: from,
      workflow: 'manual',
      subject,
      content: body,
      cc: cc || '',
      status: 'sent',
      sent_at: '2026-07-27 09:55',
      opened_at: null,
      clicked_at: null,
      replied_at: null,
    }
    db.ai_emails.unshift(row)
    db.status.sent_today += 1
    db.activity.unshift({ id: nextId(), type: 'sent', at: '09:55', title: 'Manual email sent', detail: `${to} · from ${from}` })
    return clone(row)
  },

  async getAiEmails() { await delay(); return clone(db.ai_emails) },

  /** Mailbox contents for the Emails screen. */
  async getEmails(folder = 'all') {
    await delay()
    const rows = folder === 'all' ? db.emails : db.emails.filter((e) => e.folder === folder)
    return clone(rows)
  },

  /** Short + detailed AI summary of a single message — Show Summary. */
  async summariseEmail(id) {
    await delay(900)
    const e = db.emails.find((x) => x.id === id)
    if (!e) return null
    const words = e.body.split(/\s+/).length
    return {
      short: `${e.from_name.replace(/"/g, '')} wrote about "${e.subject}" — ${words} words, ${e.folder === 'sent' ? 'sent by the agent' : 'received in the inbox'}.`,
      detailed: [
        `From ${e.from_email} to ${e.to} on ${e.date_sent}.`,
        `Subject: ${e.subject}.`,
        `The message reads: ${e.body}`,
        e.folder === 'inbox'
          ? 'The poller will pick this up on its next pass unless it is filtered as automated or already handled.'
          : 'This message was sent from the connected mailbox and is recorded in the local store.',
      ].join(' '),
    }
  },

  async getLeads() { await delay(); return clone(db.leads) },
  async addLead(lead) {
    await delay()
    const row = {
      id: nextId(),
      status: 'warm',
      pipeline: 'New',
      source: 'Manual',
      reference: `MAN-${nextId()}`,
      assigned_to: 'Agent',
      captured_at: '2026-07-27 09:55',
      phone: '',
      ...lead,
    }
    db.leads.unshift(row)
    db.status.leads += 1
    db.storage.counts.leads += 1
    return clone(row)
  },
  async setLeadStage(id, pipeline) {
    await delay(250)
    const lead = db.leads.find((l) => l.id === id)
    if (lead) lead.pipeline = pipeline
    return clone(lead)
  },
}
