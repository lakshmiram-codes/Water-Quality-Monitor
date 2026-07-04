import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext.jsx'
import Card from '../components/Card.jsx'
import AlertTypeBadge from '../components/AlertTypeBadge.jsx'

const emptyForm = { alert_type: 'contamination', message: '', location: '', station_id: '' }

export default function Alerts() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [stations, setStations] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const canIssue = user && ['authority', 'admin'].includes(user.role)

  const loadAlerts = () => api.get('/alerts').then(({ data }) => setAlerts(data))

  useEffect(() => {
    loadAlerts()
    api.get('/stations').then(({ data }) => setStations(data))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/alerts', {
        ...form,
        station_id: form.station_id ? Number(form.station_id) : null,
      })
      setForm(emptyForm)
      loadAlerts()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {canIssue && (
        <div className="lg:col-span-1">
          <Card title="Issue an alert">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-deep mb-1">Type</label>
                <select value={form.alert_type} onChange={(e) => setForm({ ...form, alert_type: e.target.value })}
                  className="w-full rounded-md border border-deep/20 px-3 py-2">
                  <option value="boil_notice">Boil notice</option>
                  <option value="contamination">Contamination</option>
                  <option value="outage">Outage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-deep mb-1">Location</label>
                <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full rounded-md border border-deep/20 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep mb-1">Related station (optional)</label>
                <select value={form.station_id} onChange={(e) => setForm({ ...form, station_id: e.target.value })}
                  className="w-full rounded-md border border-deep/20 px-3 py-2">
                  <option value="">None</option>
                  {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-deep mb-1">Message</label>
                <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-md border border-deep/20 px-3 py-2" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-danger text-white rounded-md py-2.5 font-medium hover:opacity-90 disabled:opacity-60">
                {submitting ? 'Issuing…' : 'Issue alert'}
              </button>
            </form>
          </Card>
        </div>
      )}

      <div className={canIssue ? 'lg:col-span-2' : 'lg:col-span-3'}>
        <Card title="All alerts">
          <p className="text-xs text-deep/50 mb-4">
            Alerts here include both auto-triggered alerts (from unsafe readings or flagged reports)
            and alerts issued manually by authorities.
          </p>
          {alerts.length === 0 ? (
            <p className="text-sm text-deep/50">No alerts right now — that's good news.</p>
          ) : (
            <ul className="divide-y divide-deep/10">
              {alerts.map((a) => (
                <li key={a.id} className="py-4 flex items-start gap-3">
                  <AlertTypeBadge type={a.alert_type} />
                  <div>
                    <p className="text-sm text-deep">{a.message}</p>
                    <p className="text-xs text-deep/50 mt-1">{a.location} · {new Date(a.issued_at).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
