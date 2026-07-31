import { mock } from './mock.js'
const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? '1') !== '0'
const BASE = import.meta.env.VITE_API_BASE || ''

// The bearer token is read per request, so a fresh tab is signed in and no call
// can race ahead of the auth context loading. "Remember me" decides which store
// it lands in: localStorage survives closing the browser, sessionStorage does
// not — so on a shared machine the session really does end with the tab.
const TOKEN_KEY = 'ea.token'
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || '',
  set: (token, remember = true) => {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    if (token) (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token)
  },
}

/** Fired when the backend rejects our token, so the app can bounce to /login. */
export const AUTH_EXPIRED = 'auth:expired'

async function http(method, path, body) {
  const token = tokenStore.get()
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401) {
    tokenStore.set('')
    window.dispatchEvent(new Event(AUTH_EXPIRED))
  }
  if (!res.ok) {
    // FastAPI puts the human-readable reason in `detail` — surface it as-is.
    let detail = ''
    try {
      detail = (await res.json())?.detail
    } catch {
      /* not JSON — fall back to the status line */
    }
    const error = new Error(detail || `${method} ${path} failed: ${res.status}`)
    // Callers need the code to tell a plan limit (402) from a real failure.
    error.status = res.status
    throw error
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  useMock: USE_MOCK,
  signup:           (b)    => USE_MOCK ? mock.signup(b)           : http('POST',   '/api/auth/signup', b),
  login:            (b)    => USE_MOCK ? mock.login(b)            : http('POST',   '/api/auth/login', b),
  me:               ()     => USE_MOCK ? mock.me()                : http('GET',    '/api/auth/me'),
  logout:           ()     => USE_MOCK ? mock.logout()            : http('POST',   '/api/auth/logout'),
  // Admin module — every one of these 403s for a non-super-admin token.
  getPlans:         ()     => USE_MOCK ? mock.getPlans()          : http('GET',    '/api/admin/plans'),
  createPlan:       (p)    => USE_MOCK ? mock.createPlan(p)       : http('POST',   '/api/admin/plans', p),
  updatePlan:       (p)    => USE_MOCK ? mock.updatePlan(p)       : http('PUT',    `/api/admin/plans/${p.id}`, p),
  deletePlan:       (id)   => USE_MOCK ? mock.deletePlan(id)      : http('DELETE', `/api/admin/plans/${id}`),
  getAccounts:      ()     => USE_MOCK ? mock.getAccounts()       : http('GET',    '/api/admin/accounts'),
  getAccount:       (id)   => USE_MOCK ? mock.getAccount(id)      : http('GET',    `/api/admin/accounts/${id}`),
  assignPlan:       (id, plan_id) => USE_MOCK ? mock.assignPlan(id, plan_id) : http('PATCH', `/api/admin/accounts/${id}`, { plan_id }),
  updateAccount:    (id, patch) => USE_MOCK ? mock.updateAccount(id, patch) : http('PATCH', `/api/admin/accounts/${id}`, patch),

  renewAccount:     (id)   => USE_MOCK ? mock.renewAccount(id)    : http('POST',   `/api/admin/accounts/${id}/renew`),

  // Plans as a client sees them — readable by any signed-in account.
  getAvailablePlans:()     => USE_MOCK ? mock.getAvailablePlans() : http('GET',    '/api/plans'),
  choosePlan:       (id)   => USE_MOCK ? mock.choosePlan(id)      : http('POST',   '/api/plans/choose', { plan_id: id }),
  getBilling:       ()     => USE_MOCK ? mock.getBilling()        : http('GET',    '/api/billing'),

  getStatus:        ()     => USE_MOCK ? mock.getStatus()         : http('GET',    '/api/status'),
  getActivity:      ()     => USE_MOCK ? mock.getActivity()       : http('GET',    '/api/activity'),
  getSystem:        ()     => USE_MOCK ? mock.getSystem()         : http('GET',    '/api/system'),
  setPoller:        (run)  => USE_MOCK ? mock.setPoller(run)      : http('POST',   '/api/poller', { running: run }),
  getAgents:        ()     => USE_MOCK ? mock.getAgents()         : http('GET',    '/api/agents'),
  getAgent:         (id)   => USE_MOCK ? mock.getAgent(id)        : http('GET',    `/api/agents/${id}`),
  addAgent:         (a)    => USE_MOCK ? mock.addAgent(a)         : http('POST',   '/api/agents', a),
  saveAgent:        (a)    => USE_MOCK ? mock.saveAgent(a)        : http('PUT',    `/api/agents/${a.id}`, a),
  deleteAgent:      (id)   => USE_MOCK ? mock.deleteAgent(id)     : http('DELETE', `/api/agents/${id}`),
  saveAgentCompany: (id, c)=> USE_MOCK ? mock.saveAgentCompany(id, c) : http('PATCH', `/api/agents/${id}/company`, c),
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
