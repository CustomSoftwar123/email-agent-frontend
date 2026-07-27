import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Mailboxes from './pages/Mailboxes.jsx'
import Outreach from './pages/Outreach.jsx'
import Conversations from './pages/Conversations.jsx'
import Leads from './pages/Leads.jsx'
import Settings from './pages/Settings.jsx'
export default function App() {
  return (<Routes><Route element={<Layout />}>
    <Route index element={<Dashboard />} />
    <Route path="mailboxes" element={<Mailboxes />} />
    <Route path="outreach" element={<Outreach />} />
    <Route path="conversations" element={<Conversations />} />
    <Route path="leads" element={<Leads />} />
    <Route path="settings" element={<Settings />} />
  </Route></Routes>)
}
