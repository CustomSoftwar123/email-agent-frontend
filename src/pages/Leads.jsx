import { useEffect, useState } from 'react'
import { PageHeader } from '../components/Layout.jsx'
import { StatusBadge, Loading, Empty } from '../components/ui.jsx'
import { api } from '../api/client.js'
export default function Leads() {
  const [rows, setRows] = useState(null)
  useEffect(() => { api.getLeads().then(setRows) }, [])
  function exportCsv() {
    if (!rows?.length) return
    const header = ['name', 'email', 'phone', 'status', 'captured_at']
    const lines = [header.join(',')].concat(rows.map((r) => header.map((h) => `"${(r[h] ?? '').toString().replace(/"/g, '""')}"`).join(',')))
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' }); const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click(); URL.revokeObjectURL(url)
  }
  return (
    <><PageHeader title="Leads" subtitle="Captured warm / hot prospects"
      actions={<button className="btn-primary" onClick={exportCsv} disabled={!rows?.length}>⬇ Export CSV</button>} />
      <div className="p-8">{!rows ? <Loading /> : rows.length === 0 ? <Empty label="No leads captured yet." /> : (
        <div className="card overflow-hidden"><table className="w-full">
          <thead className="bg-slate-50"><tr><th className="th">Name</th><th className="th">Email</th><th className="th">Phone</th><th className="th">Status</th><th className="th">Captured</th></tr></thead>
          <tbody>{rows.map((l) => (<tr key={l.id}>
            <td className="td font-medium">{l.name}</td><td className="td text-slate-500">{l.email}</td>
            <td className="td">{l.phone || <span className="text-slate-400">—</span>}</td>
            <td className="td"><StatusBadge value={l.status} /></td><td className="td text-slate-500">{l.captured_at}</td>
          </tr>))}</tbody>
        </table></div>)}</div></>
  )
}
