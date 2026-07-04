import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext.jsx'
import Card from '../components/Card.jsx'
import StatusPill from '../components/StatusPill.jsx'
import AlertTypeBadge from '../components/AlertTypeBadge.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const [stations, setStations] = useState([])
  const [alerts, setAlerts] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([
      api.get('/stations'),
      api.get('/alerts', { params: { limit: 5 } }),
      api.get('/reports'),
    ]).then(([s, a, r]) => {
      if (!mounted) return
      setStations(s.data)
      setAlerts(a.data)
      setReports(r.data)
    }).finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  const pendingReports = reports.filter((r) => r.status === 'pending').length

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-deep">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-deep/60 text-sm mt-1">Here's the current state of the water systems you follow.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-deep/60">Monitored stations</p>
          <p className="font-display text-3xl font-semibold text-teal mt-1">{loading ? '—' : stations.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-deep/60">Active alerts</p>
          <p className="font-display text-3xl font-semibold text-danger mt-1">{loading ? '—' : alerts.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-deep/60">{user?.role === 'citizen' ? 'Your reports' : 'Pending reports'}</p>
          <p className="font-display text-3xl font-semibold text-watch mt-1">
            {loading ? '—' : user?.role === 'citizen' ? reports.length : pendingReports}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent alerts" action={<Link to="/alerts" className="text-sm text-teal hover:underline">View all</Link>}>
          {alerts.length === 0 ? (
            <p className="text-sm text-deep/50">No alerts right now — that's good news.</p>
          ) : (
            <ul className="space-y-3">
              {alerts.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <AlertTypeBadge type={a.alert_type} />
                  <div>
                    <p className="text-sm text-deep">{a.message}</p>
                    <p className="text-xs text-deep/50">{a.location} · {new Date(a.issued_at).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent reports" action={<Link to="/reports" className="text-sm text-teal hover:underline">View all</Link>}>
          {reports.length === 0 ? (
            <p className="text-sm text-deep/50">No reports yet.</p>
          ) : (
            <ul className="space-y-3">
              {reports.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-deep">{r.description}</p>
                    <p className="text-xs text-deep/50">{r.location} · {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <StatusPill value={r.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Stations at a glance">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((s) => (
            <Link key={s.id} to="/map" className="block rounded-lg border border-deep/10 p-4 hover:border-teal transition-colors">
              <p className="font-medium text-deep">{s.name}</p>
              <p className="text-xs text-deep/50 mt-1">{s.location}</p>
              <p className="text-xs text-deep/40 mt-2 font-mono">{s.latitude}, {s.longitude}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
