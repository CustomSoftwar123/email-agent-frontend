import { useEffect, useState } from 'react'
import { PageHeader } from '../components/Layout.jsx'
import { Skeleton, useToast } from '../components/ui.jsx'
import { IconChevronDown, IconClose, IconSettings } from '../components/icons.jsx'
import { api } from '../api/client.js'

const COUNTRIES = [
  'Ireland', 'United Kingdom', 'United States', 'Canada', 'Pakistan', 'India',
  'Poland', 'Germany', 'France', 'Spain', 'Netherlands', 'Australia', 'United Arab Emirates',
]

// Company Region is stored as an IANA timezone.
const REGIONS = [
  'Europe/Dublin', 'Europe/London', 'Europe/Vienna', 'Europe/Berlin', 'Europe/Warsaw',
  'Europe/Madrid', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Dubai',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Australia/Sydney',
]

export default function CompanyInfo() {
  const [s, setS] = useState(null)
  const [initial, setInitial] = useState(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    api.getSettings().then((data) => {
      setS(data)
      setInitial(JSON.stringify(data))
    })
  }, [])

  const dirty = s && JSON.stringify(s) !== initial
  const set = (k, v) => setS((prev) => ({ ...prev, company: { ...prev.company, [k]: v } }))

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const saved = await api.saveSettings(s)
    setS(saved)
    setInitial(JSON.stringify(saved))
    setSaving(false)
    toast('Company info updated')
  }

  if (!s) {
    return (
      <>
        <PageHeader eyebrow="Settings" icon={<IconSettings size={12} />} title="Edit Company Info" />
        <div className="page-body">
          <div className="card p-7 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-11 w-full" />
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  const c = s.company
  const isProduct = c.business_type === 'Product'

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        icon={<IconSettings size={12} />}
        title="Edit Company Info"
        subtitle="Manage your company profile, AI prompts, and active agent services."
      />

      <div className="page-body">
        <form onSubmit={save} className="card p-6 sm:p-7">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
            {/* ---------------- left column ---------------- */}
            <div className="space-y-5">
              <Field label="Company Name" required id="ci-name">
                <input id="ci-name" className="input h-[46px]" value={c.name} onChange={(e) => set('name', e.target.value)} />
              </Field>

              <Field label="Company Address" required id="ci-address">
                <input id="ci-address" className="input h-[46px]" value={c.address} onChange={(e) => set('address', e.target.value)} />
              </Field>

              <Field label="Company Description" required id="ci-desc">
                <textarea id="ci-desc" className="input leading-relaxed" rows={3} value={c.description} onChange={(e) => set('description', e.target.value)} />
              </Field>

              <Field label="Price Guidelines" required id="ci-price">
                <textarea id="ci-price" className="input leading-relaxed" rows={3} value={c.pricing} onChange={(e) => set('pricing', e.target.value)} />
              </Field>

              <div>
                <p className="label">Select Business Type:</p>
                <div className="flex items-center gap-10">
                  {['Service', 'Product'].map((t) => (
                    <label key={t} className="inline-flex items-center gap-2.5 cursor-pointer text-sm text-muted">
                      <input
                        type="radio"
                        name="business_type"
                        className="w-4 h-4 accent-[var(--accent)]"
                        checked={c.business_type === t}
                        onChange={() => set('business_type', t)}
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ---------------- right column ---------------- */}
            <div className="space-y-5">
              <Field label="Company Email" required id="ci-email">
                <input id="ci-email" type="email" className="input h-[46px]" value={c.email} onChange={(e) => set('email', e.target.value)} />
              </Field>

              <Field label="Country" required id="ci-country">
                <ClearableSelect
                  id="ci-country"
                  value={c.country}
                  options={COUNTRIES}
                  placeholder="Select Country"
                  onChange={(v) => set('country', v)}
                />
              </Field>

              <Field label="Company Region" required id="ci-region">
                <ClearableSelect
                  id="ci-region"
                  value={c.region}
                  options={REGIONS}
                  placeholder="Select Region"
                  onChange={(v) => set('region', v)}
                />
              </Field>

              <Field label="Set a Prompt" required id="ci-prompt">
                <textarea id="ci-prompt" className="input leading-relaxed" rows={3} value={c.global_prompt} onChange={(e) => set('global_prompt', e.target.value)} />
              </Field>

              <div>
                <p className="label">Active Agent Services:</p>
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm text-muted">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[var(--accent)]"
                    checked={!!c.email_agent}
                    onChange={(e) => set('email_agent', e.target.checked)}
                  />
                  Email Agent
                </label>
              </div>
            </div>
          </div>

          {/* full-width knowledge box */}
          <div className="mt-5">
            <p className="label">{isProduct ? 'Product Knowledge:' : 'Service Knowledge:'}</p>
            <textarea
              className="input leading-relaxed font-mono text-xs"
              rows={8}
              value={isProduct ? (c.product_knowledge ?? '') : (c.service_knowledge ?? '')}
              onChange={(e) => set(isProduct ? 'product_knowledge' : 'service_knowledge', e.target.value)}
              placeholder={'1. Custom Software Development\n\n* Custom Web Application Development\n* Enterprise Software Development'}
            />
          </div>

          <div className="mt-7">
            <button className="btn-primary h-[46px] px-6" disabled={saving || !dirty}>
              {saving ? 'Saving…' : 'Update Info'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

function Field({ label, required, id, children }) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  )
}

/** Select with a clear button and caret on the right. */
function ClearableSelect({ id, value, options, placeholder, onChange }) {
  return (
    <div className="relative">
      <select
        id={id}
        className="input h-[46px] pr-16 appearance-none"
        style={{ backgroundImage: 'none' }}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="pointer-events-auto p-1 text-faint hover:text-ink"
            aria-label={`Clear ${placeholder}`}
          >
            <IconClose size={13} />
          </button>
        )}
        <span className="w-px h-4 bg-line" />
        <IconChevronDown size={14} className="text-faint" />
      </div>
    </div>
  )
}
