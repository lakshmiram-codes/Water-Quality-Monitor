import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext.jsx'
import Card from '../components/Card.jsx'
import StatusPill from '../components/StatusPill.jsx'

const emptyForm = { location: '', description: '', water_source: '', station_id: '', photo: null }

export default function Reports() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [stations, setStations] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const canModerate = user && ['authority', 'admin'].includes(user.role)

  const loadReports = () => {
    api.get('/reports').then(({ data }) => setReports(data))
  }

  useEffect(() => {
    loadReports()
    api.get('/stations').then(({ data }) => setStations(data))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('location', form.location)
      fd.append('description', form.description)
      fd.append('water_source', form.water_source)
      if (form.station_id) fd.append('station_id', form.station_id)
      if (form.photo) fd.append('photo', form.photo)

      await api.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setForm(emptyForm)
      loadReports()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not submit the report. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = async (id, status) => {
    await api.patch(`/reports/${id}/status`, { status })
    loadReports()
  }

  const visibleReports = filter === 'all' ? reports : reports.filter((r) => r.status === filter)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card title="Submit a pollution report">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <p role="alert" className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            <div>
              <label className="block text-sm font-medium text-deep mb-1">Location</label>
              <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-md border border-deep/20 px-3 py-2 focus:border-teal focus:ring-1 focus:ring-teal"
                placeholder="e.g. Elm St bridge" />
            </div>
            <div>
              <label className="block text-sm font-medium text-deep mb-1">Water source</label>
              <input required value={form.water_source} onChange={(e) => setForm({ ...form, water_source: e.target.value })}
                className="w-full rounded-md border border-deep/20 px-3 py-2 focus:border-teal focus:ring-1 focus:ring-teal"
                placeholder="e.g. municipal tap, creek, well" />
            </div>
            <div>
              <label className="block text-sm font-medium text-deep mb-1">Nearest station (optional)</label>
              <select value={form.station_id} onChange={(e) => setForm({ ...form, station_id: e.target.value })}
                className="w-full rounded-md border border-deep/20 px-3 py-2 focus:border-teal focus:ring-1 focus:ring-teal">
                <option value="">None</option>
                {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-deep mb-1">What did you notice?</label>
              <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-md border border-deep/20 px-3 py-2 focus:border-teal focus:ring-1 focus:ring-teal"
                placeholder="Describe color, smell, taste, or anything unusual" />
            </div>
            <div>
              <label className="block text-sm font-medium text-deep mb-1">Photo (optional)</label>
              <input type="file" accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
                className="w-full text-sm" />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-teal text-white rounded-md py-2.5 font-medium hover:bg-deep transition-colors disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit report'}
            </button>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card
          title="Reports"
          action={
            <select value={filter} onChange={(e) => setFilter(e.target.value)}
              className="text-sm rounded-md border border-deep/20 px-2 py-1">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          }
        >
          {visibleReports.length === 0 ? (
            <p className="text-sm text-deep/50">No reports to show.</p>
          ) : (
            <ul className="divide-y divide-deep/10">
              {visibleReports.map((r) => (
                <li key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-start gap-3">
                  {r.photo_url && (
                    <img src={r.photo_url} alt="" className="w-20 h-20 object-cover rounded-md border border-deep/10" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusPill value={r.status} />
                      <span className="text-xs text-deep/50">{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-deep">{r.description}</p>
                    <p className="text-xs text-deep/50 mt-1">{r.location} · source: {r.water_source}</p>
                  </div>
                  {canModerate && r.status === 'pending' && (
                    <div className="flex gap-2 self-start">
                      <button onClick={() => updateStatus(r.id, 'verified')}
                        className="text-xs px-3 py-1.5 rounded-md bg-safe text-white hover:opacity-90">Verify</button>
                      <button onClick={() => updateStatus(r.id, 'rejected')}
                        className="text-xs px-3 py-1.5 rounded-md bg-danger text-white hover:opacity-90">Reject</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
