import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('That email and password don\u2019t match. Check them and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-aqua" />
            <span className="font-display font-semibold text-2xl text-white">WaterWatch</span>
          </div>
          <p className="text-mist text-sm">Real-time water safety, reported and tracked together.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h1 className="font-display font-semibold text-xl text-deep">Sign in</h1>

          {error && (
            <p role="alert" className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-deep mb-1">Email</label>
            <input
              id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-deep/20 px-3 py-2 focus:border-teal focus:ring-1 focus:ring-teal"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-deep mb-1">Password</label>
            <input
              id="password" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-deep/20 px-3 py-2 focus:border-teal focus:ring-1 focus:ring-teal"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit" disabled={submitting}
            className="w-full bg-teal text-white rounded-md py-2.5 font-medium hover:bg-deep transition-colors disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-sm text-center text-deep/70">
            New here? <Link to="/register" className="text-teal font-medium hover:underline">Create an account</Link>
          </p>

          <div className="pt-3 border-t border-deep/10 text-xs text-deep/50 space-y-0.5">
            <p>Demo logins (password: password123):</p>
            <p>citizen@example.com · ngo@example.com · authority@example.com · admin@example.com</p>
          </div>
        </form>
      </div>
    </div>
  )
}
