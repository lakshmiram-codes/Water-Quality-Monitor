import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'bg-teal text-white' : 'text-mist hover:bg-deep/60'
  }`

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-ink border-b border-deep/60">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-aqua" aria-hidden="true" />
          <span className="font-display font-semibold text-lg text-white tracking-tight">WaterWatch</span>
        </div>
        <nav className="flex items-center gap-1" aria-label="Primary">
          <NavLink to="/" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/map" className={linkClass}>Map</NavLink>
          <NavLink to="/reports" className={linkClass}>Reports</NavLink>
          <NavLink to="/alerts" className={linkClass}>Alerts</NavLink>
          <NavLink to="/analytics" className={linkClass}>Analytics</NavLink>
          {user.role === 'ngo' && <NavLink to="/ngo" className={linkClass}>NGO Hub</NavLink>}
        </nav>
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight hidden sm:block">
            <p className="text-sm text-white font-medium">{user.name}</p>
            <p className="text-xs text-aqua capitalize">{user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-md border border-deep text-mist hover:bg-deep/60"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
