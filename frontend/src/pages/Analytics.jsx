import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import api from '../services/api'
import Card from '../components/Card.jsx'
import StatusPill from '../components/StatusPill.jsx'

const PARAMETERS = ['pH', 'turbidity', 'DO', 'lead', 'arsenic']

export default function Analytics() {
  const [stations, setStations] = useState([])
  const [stationId, setStationId] = useState('')
  const [parameter, setParameter] = useState('pH')
  const [trend, setTrend] = useState([])
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/stations').then(({ data }) => {
      setStations(data)
      if (data.length) setStationId(String(data[0].id))
    })
  }, [])

  useEffect(() => {
    if (!stationId) return
    setLoading(true)
    Promise.all([
      api.get(`/analytics/trends/${stationId}/${parameter}`),
      api.get(`/analytics/predict/${stationId}/${parameter}`),
    ]).then(([t, p]) => {
      setTrend(t.data.points.map((pt) => ({ ...pt, label: new Date(pt.recorded_at).toLocaleDateString() })))
      setPrediction(p.data)
    }).finally(() => setLoading(false))
  }, [stationId, parameter])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-deep mb-1">Analytics & predictive insights</h1>
        <p className="text-deep/60 text-sm">Historical trends and an early-warning risk estimate per station and parameter.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={stationId} onChange={(e) => setStationId(e.target.value)}
          className="rounded-md border border-deep/20 px-3 py-2 text-sm">
          {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={parameter} onChange={(e) => setParameter(e.target.value)}
          className="rounded-md border border-deep/20 px-3 py-2 text-sm">
          {PARAMETERS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Historical trend" className="lg:col-span-2">
          {loading ? (
            <p className="text-sm text-deep/50">Loading…</p>
          ) : trend.length === 0 ? (
            <p className="text-sm text-deep/50">No readings recorded yet for this station/parameter.</p>
          ) : (
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#12324a1a" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#1B6B70" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Predicted risk">
          {!prediction ? (
            <p className="text-sm text-deep/50">Select a station and parameter.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <StatusPill value={prediction.risk_level} />
                <span className="font-mono text-sm text-deep/70">{(prediction.risk_score * 100).toFixed(0)}% risk score</span>
              </div>
              <p className="text-sm text-deep">{prediction.reason}</p>
              <div className="text-xs text-deep/50 grid grid-cols-2 gap-2 pt-2 border-t border-deep/10">
                <div>
                  <p className="text-deep/40">Latest value</p>
                  <p className="font-mono text-deep">{prediction.latest_value ?? '—'}</p>
                </div>
                <div>
                  <p className="text-deep/40">Baseline mean</p>
                  <p className="font-mono text-deep">{prediction.baseline_mean ?? '—'}</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
