import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Agents from './pages/Agents.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Pricing from './pages/Pricing.jsx'
import Billing from './pages/Billing.jsx'
import ChoosePlan from './pages/ChoosePlan.jsx'
import { useAuth, isSuperAdmin, needsPlan } from './lib/auth.jsx'

/** Blank hold while the stored token is checked — stops the login page flashing. */
function Booting() {
  return <div className="min-h-screen bg-page" />
}

function RequireAuth({ children }) {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <Booting />
  // Remembering where they were means signing in lands them back there.
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  // A brand new account meets the plan picker before the app itself.
  if (needsPlan(user)) return <Navigate to="/choose-plan" replace />
  return children
}

function RedirectIfSignedIn({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return <Booting />
  return user ? <Navigate to="/" replace /> : children
}

/**
 * Admin-only route. The API refuses these calls for a normal account anyway —
 * this only stops a client landing on a page that would just throw at them.
 */
function RequireSuperAdmin({ children }) {
  const { user } = useAuth()
  return isSuperAdmin(user) ? children : <Navigate to="/" replace />
}

/** The picker itself: signed out → login; already has a plan → the app. */
function PlanPicker() {
  const { user, ready } = useAuth()
  if (!ready) return <Booting />
  if (!user) return <Navigate to="/login" replace />
  return needsPlan(user) ? <ChoosePlan /> : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<RedirectIfSignedIn><Login /></RedirectIfSignedIn>} />
      <Route path="/signup" element={<RedirectIfSignedIn><Signup /></RedirectIfSignedIn>} />

      {/* Signed in, but outside the app shell — there is nothing to navigate
          to until a plan is chosen. */}
      <Route path="/choose-plan" element={<PlanPicker />} />

      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="agents" element={<Agents />} />
        <Route path="agents/:id" element={<Agents />} />
        <Route path="billing" element={<Billing />} />
        <Route
          path="pricing"
          element={<RequireSuperAdmin><Pricing /></RequireSuperAdmin>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
