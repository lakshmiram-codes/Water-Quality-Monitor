import { useEffect, useState } from 'react'
import api from '../services/api'
import Card from '../components/Card.jsx'

const emptyForm = { project_name: '', contact_email: '', station_id: '' }

export default function NGODashboard() {
  const [collaborations, setCollaborations] = useState([])
  const [stations, setStations] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const load = () => api.get('/collaborations').then(({ data }) => setCollaborations(data))

  useEffect(() => {
    load()
    api.get('/stations').then(({ data }) => setStations(data))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/collaborations', {
        ...form,
        station_id: form.station_id ? Number(form.station_id) : null,
      })
      setForm(emptyForm)
      load()
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (id) => {
    await api.delete(`/collaborations/${id}`)
    load()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card title="Register a collaboration project">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-deep mb-1">Project name</label>
              <input required value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })}
                className="w-full rounded-md border border-deep/20 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-deep mb-1">Contact email</label>
              <input type="email" required value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                className="w-full rounded-md border border-deep/20 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-deep mb-1">Linked station (optional)</label>
              <select value={form.station_id} onChange={(e) => setForm({ ...form, station_id: e.target.value })}
                className="w-full rounded-md border border-deep/20 px-3 py-2">
                <option value="">None</option>
                {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-teal text-white rounded-md py-2.5 font-medium hover:bg-deep disabled:opacity-60">
              {submitting ? 'Saving…' : 'Register project'}
            </button>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card title="Your collaboration projects">
          {collaborations.length === 0 ? (
            <p className="text-sm text-deep/50">No collaboration projects registered yet.</p>
          ) : (
            <ul className="divide-y divide-deep/10">
              {collaborations.map((c) => (
                <li key={c.id} className="py-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-deep">{c.project_name}</p>
                    <p className="text-xs text-deep/50">{c.contact_email} · {new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => remove(c.id)}
                    className="text-xs px-3 py-1.5 rounded-md border border-danger/40 text-danger hover:bg-danger/10">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
