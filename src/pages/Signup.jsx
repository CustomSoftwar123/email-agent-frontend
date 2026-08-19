import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout, { Field, PasswordField } from '../components/AuthLayout.jsx'
import { IconChevronRight, IconMail, IconRobot } from '../components/icons.jsx'
import { useAuth } from '../lib/auth.jsx'

const MIN_PASSWORD = 8

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    // Checked here as well as on the server so a mismatch costs no round trip.
    if (form.password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`)
      return
    }
    if (form.password !== form.confirm) {
      setError('Those passwords do not match.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const email = form.email.trim()
      await signup(form.name.trim(), email, form.password)
      // Straight to the login page, with the address already filled in.
      navigate('/login', {
        replace: true,
        state: { notice: 'Account created. Sign in to continue.', email },
      })
    } catch (err) {
      setError(err.message || 'Could not create the account.')
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Your agents, mailboxes, conversations and leads stay private to you."
      error={error}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field
          id="name"
          label="Your name"
          icon={<IconRobot size={16} />}
          autoComplete="name"
          autoFocus
          placeholder="Enter your name"
          value={form.name}
          onChange={set('name')}
        />

        <Field
          id="email"
          label="Email address"
          icon={<IconMail size={16} />}
          type="email"
          autoComplete="email"
          required
          placeholder="Enter your email"
          value={form.email}
          onChange={set('email')}
        />

        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          required
          placeholder="At least 8 characters"
          hint={`Minimum ${MIN_PASSWORD} characters.`}
          value={form.password}
          onChange={set('password')}
        />

        <PasswordField
          id="confirm"
          label="Confirm password"
          autoComplete="new-password"
          required
          placeholder="Repeat your password"
          value={form.confirm}
          onChange={set('confirm')}
        />

        <button className="btn-primary w-full mt-1" type="submit" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
          {!busy && <IconChevronRight size={16} />}
        </button>
      </form>
    </AuthLayout>
  )
}
