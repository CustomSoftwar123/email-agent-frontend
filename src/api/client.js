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
  getMailboxes:     ()     => USE_MOCK ? mock.getMailboxes()      : http('GET',    '/api/mailboxes'),
  addMailbox:       (m)    => USE_MOCK ? mock.addMailbox(m)       : http('POST',   '/api/mailboxes', m),
  deleteMailbox:    (id)   => USE_MOCK ? mock.deleteMailbox(id)   : http('DELETE', `/api/mailboxes/${id}`),
  getSettings:      ()     => USE_MOCK ? mock.getSettings()       : http('GET',    '/api/settings'),
  saveSettings:     (s)    => USE_MOCK ? mock.saveSettings(s)     : http('PUT',    '/api/settings', s),
  getProspects:     ()     => USE_MOCK ? mock.getProspects()      : http('GET',    '/api/prospects'),
  addProspects:     (rows) => USE_MOCK ? mock.addProspects(rows)  : http('POST',   '/api/prospects', { rows }),
  startOutreach:    (ids)  => USE_MOCK ? mock.startOutreach(ids)  : http('POST',   '/api/outreach/start', { ids }),
  getConversations: ()     => USE_MOCK ? mock.getConversations() : http('GET',    '/api/conversations'),
  getConversation:  (id)   => USE_MOCK ? mock.getConversation(id): http('GET',    `/api/conversations/${id}`),
  getLeads:         ()     => USE_MOCK ? mock.getLeads()          : http('GET',    '/api/leads'),
}
