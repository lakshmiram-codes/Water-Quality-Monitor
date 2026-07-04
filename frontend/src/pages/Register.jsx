import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ROLES = [
  { value: 'citizen', label: 'Citizen — report and follow local water quality' },
  { value: 'ngo', label: 'NGO — collaborate on monitoring projects' },
  { value: 'authority', label: 'Authority — verify reports and issue alerts' },
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'citizen', location: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create the account. Try a different email.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-aqua" />
            <span className="font-display font-semibold text-2xl text-white">WaterWatch</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h1 className="font-display font-semibold text-xl text-deep">Create your account</h1>

          {error && (
            <p role="alert" className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-deep mb-1">Name</label>
            <input required value={form.name} onChange={update('name')}
              className="w-full rounded-md border border-deep/20 px-3 py-2 focus:border-teal focus:ring-1 focus:ring-teal" />
          </div>
          <div>
            <label className="block text-sm font-medium text-deep mb-1">Email</label>
            <input type="email" required value={form.email} onChange={update('email')}
              className="w-full rounded-md border border-deep/20 px-3 py-2 focus:border-teal focus:ring-1 focus:ring-teal" />
          </div>
          <div>
            <label className="block text-sm font-medium text-deep mb-1">Password</label>
            <input type="password" required minLength={8} value={form.password} onChange={update('password')}
              className="w-full rounded-md border border-deep/20 px-3 py-2 focus:border-teal focus:ring-1 focus:ring-teal" />
          </div>
          <div>
            <label className="block text-sm font-medium text-deep mb-1">Location</label>
            <input value={form.location} onChange={update('location')} placeholder="City, region"
              className="w-full rounded-md border border-deep/20 px-3 py-2 focus:border-teal focus:ring-1 focus:ring-teal" />
          </div>
          <div>
            <label className="block text-sm font-medium text-deep mb-1">I am joining as a</label>
            <select value={form.role} onChange={update('role')}
              className="w-full rounded-md border border-deep/20 px-3 py-2 focus:border-teal focus:ring-1 focus:ring-teal">
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-teal text-white rounded-md py-2.5 font-medium hover:bg-deep transition-colors disabled:opacity-60">
            {submitting ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-sm text-center text-deep/70">
            Already have an account? <Link to="/login" className="text-teal font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
