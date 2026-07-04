import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import api from '../services/api'
import { useAuth } from '../context/AuthContext.jsx'
import Card from '../components/Card.jsx'

// Default Leaflet marker icons reference image files that don't resolve
// under Vite's bundler by default — point them at a CDN explicitly.
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export default function MapView() {
  const { user } = useAuth()
  const [stations, setStations] = useState([])
  const [readingsByStation, setReadingsByStation] = useState({})
  const [syncingId, setSyncingId] = useState(null)

  const canSync = user && ['authority', 'admin'].includes(user.role)

  const loadStations = () => {
    api.get('/stations').then(async ({ data }) => {
      setStations(data)
      const results = await Promise.all(
        data.map((s) => api.get('/readings', { params: { station_id: s.id, limit: 5 } }))
      )
      const map = {}
      data.forEach((s, i) => { map[s.id] = results[i].data })
      setReadingsByStation(map)
    })
  }

  useEffect(loadStations, [])

  const handleSync = async (stationId) => {
    setSyncingId(stationId)
    try {
      await api.post(`/stations/${stationId}/sync`)
      loadStations()
    } finally {
      setSyncingId(null)
    }
  }

  const center = stations.length
    ? [stations[0].latitude, stations[0].longitude]
    : [39.78, -89.65]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold text-deep mb-1">Water station map</h1>
      <p className="text-deep/60 text-sm mb-6">Live readings pulled from monitoring stations and government data feeds.</p>

      <Card className="p-0 overflow-hidden">
        <div style={{ height: '480px' }}>
          <MapContainer center={center} zoom={11} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {stations.map((s) => (
              <Marker key={s.id} position={[s.latitude, s.longitude]} icon={markerIcon}>
                <Popup>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-deep/60 mb-2">{s.location}</p>
                  <ul className="text-xs space-y-0.5">
                    {(readingsByStation[s.id] || []).slice(0, 5).map((r) => (
                      <li key={r.id}><span className="font-mono">{r.parameter}</span>: {r.value}</li>
                    ))}
                  </ul>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {stations.map((s) => (
          <Card key={s.id} title={s.name}>
            <p className="text-xs text-deep/50 mb-3">{s.location}</p>
            <ul className="text-sm space-y-1 mb-3">
              {(readingsByStation[s.id] || []).slice(0, 5).map((r) => (
                <li key={r.id} className="flex justify-between font-mono text-deep/80">
                  <span>{r.parameter}</span><span>{r.value}</span>
                </li>
              ))}
              {(readingsByStation[s.id] || []).length === 0 && (
                <li className="text-deep/40">No readings yet.</li>
              )}
            </ul>
            {canSync && (
              <button
                onClick={() => handleSync(s.id)}
                disabled={syncingId === s.id}
                className="text-xs px-3 py-1.5 rounded-md bg-teal text-white hover:bg-deep disabled:opacity-60"
              >
                {syncingId === s.id ? 'Syncing…' : 'Sync latest readings'}
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
