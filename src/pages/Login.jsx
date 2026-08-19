import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout, { Field, PasswordField } from '../components/AuthLayout.jsx'
import { useToast } from '../components/ui.jsx'
import { IconChevronRight, IconMail } from '../components/icons.jsx'
import { useAuth } from '../lib/auth.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  // Arriving from signup: the address is already known, so only the password
  // is left to type, and the confirmation is carried across.
  const [form, setForm] = useState({ email: location.state?.email ?? '', password: '' })
  const [remember, setRemember] = useState(true)
  const [notice] = useState(location.state?.notice ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(form.email.trim(), form.password, remember)
      toast('Logged in successfully')
      // Back to whatever they were trying to reach before the guard stepped in.
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not sign in.')
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your account"
      subtitle="Enter your credentials to reach your dashboard."
      notice={notice}
      error={error}
      footer={
        <>
          Don’t have an account?{' '}
          <Link to="/signup" className="font-semibold text-accent hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field
          id="email"
          label="Email address"
          icon={<IconMail size={16} />}
          type="email"
          autoComplete="email"
          autoFocus={!notice}
          required
          placeholder="Enter your email"
          value={form.email}
          onChange={set('email')}
        />

        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          autoFocus={!!notice}
          required
          placeholder="Enter your password"
          value={form.password}
          onChange={set('password')}
        />

        <label className="flex items-center gap-2.5 cursor-pointer select-none pt-0.5">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-line-strong accent-[var(--accent)]"
          />
          <span className="text-[13px] text-muted">Keep me signed in</span>
        </label>

        <button className="btn-primary w-full mt-1" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
          {!busy && <IconChevronRight size={16} />}
        </button>
      </form>
    </AuthLayout>
  )
}
