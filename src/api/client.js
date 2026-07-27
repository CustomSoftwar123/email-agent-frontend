import { mock } from './mock.js'
const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? '1') !== '0'
const BASE = import.meta.env.VITE_API_BASE || ''
async function http(method, path, body) {
  const res = await fetch(`${BASE}${path}`, { method,
    headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`)
  return res.status === 204 ? null : res.json()
}
export const api = {
  useMock: USE_MOCK,
  getStatus:        ()     => USE_MOCK ? mock.getStatus()         : http('GET',    '/api/status'),
  getActivity:      ()     => USE_MOCK ? mock.getActivity()       : http('GET',    '/api/activity'),
  getSystem:        ()     => USE_MOCK ? mock.getSystem()         : http('GET',    '/api/system'),
  setPoller:        (run)  => USE_MOCK ? mock.setPoller(run)      : http('POST',   '/api/poller', { running: run }),
  getAgents:        ()     => USE_MOCK ? mock.getAgents()         : http('GET',    '/api/agents'),
  getAgent:         (id)   => USE_MOCK ? mock.getAgent(id)        : http('GET',    `/api/agents/${id}`),
  addAgent:         (a)    => USE_MOCK ? mock.addAgent(a)         : http('POST',   '/api/agents', a),
  saveAgent:        (a)    => USE_MOCK ? mock.saveAgent(a)        : http('PUT',    `/api/agents/${a.id}`, a),
  deleteAgent:      (id)   => USE_MOCK ? mock.deleteAgent(id)     : http('DELETE', `/api/agents/${id}`),
  connectProvider:  (id, p, e) => USE_MOCK ? mock.connectProvider(id, p, e) : http('POST', `/api/agents/${id}/connect`, { provider: p, email: e }),
  saveImap:         (id, c)=> USE_MOCK ? mock.saveImap(id, c)     : http('POST',   `/api/agents/${id}/imap`, c),
  disconnect:       (id)   => USE_MOCK ? mock.disconnectProvider(id) : http('POST', `/api/agents/${id}/disconnect`),
  getMailboxes:     ()     => USE_MOCK ? mock.getMailboxes()      : http('GET',    '/api/mailboxes'),
  getSettings:      ()     => USE_MOCK ? mock.getSettings()       : http('GET',    '/api/settings'),
  saveSettings:     (s)    => USE_MOCK ? mock.saveSettings(s)     : http('PUT',    '/api/settings', s),
  getProspects:     ()     => USE_MOCK ? mock.getProspects()      : http('GET',    '/api/prospects'),
  addProspects:     (rows) => USE_MOCK ? mock.addProspects(rows)  : http('POST',   '/api/prospects', { rows }),
  startOutreach:    (ids)  => USE_MOCK ? mock.startOutreach(ids)  : http('POST',   '/api/outreach/start', { ids }),
  getConversations: ()     => USE_MOCK ? mock.getConversations() : http('GET',    '/api/conversations'),
  getConversation:  (id)   => USE_MOCK ? mock.getConversation(id): http('GET',    `/api/conversations/${id}`),
  getLeads:         ()     => USE_MOCK ? mock.getLeads()          : http('GET',    '/api/leads'),
  addLead:          (l)    => USE_MOCK ? mock.addLead(l)          : http('POST',   '/api/leads', l),
  setLeadStage:     (id, s)=> USE_MOCK ? mock.setLeadStage(id, s) : http('PATCH',  `/api/leads/${id}`, { pipeline: s }),
  getAiEmails:      ()     => USE_MOCK ? mock.getAiEmails()       : http('GET',    '/api/ai-emails'),
  getEmails:        (f)    => USE_MOCK ? mock.getEmails(f)        : http('GET',    `/api/emails?folder=${f ?? 'all'}`),
  summariseEmail:   (id)   => USE_MOCK ? mock.summariseEmail(id)  : http('GET',    `/api/emails/${id}/summary`),
  sendEmail:        (m)    => USE_MOCK ? mock.sendEmail(m)        : http('POST',   '/api/emails/send', m),
  summarise:        (id)   => USE_MOCK ? mock.summarise(id)       : http('GET',    `/api/conversations/${id}/summary`),
}
