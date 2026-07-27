import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CompanyInfo from './pages/CompanyInfo.jsx'
import Agents from './pages/Agents.jsx'
import Outreach from './pages/Outreach.jsx'
import Emails from './pages/Emails.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="company-info" element={<CompanyInfo />} />
        <Route path="agents" element={<Agents />} />
        <Route path="agents/:id" element={<Agents />} />
        <Route path="outreach" element={<Outreach />} />
        <Route path="emails" element={<Emails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
