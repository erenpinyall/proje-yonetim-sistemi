import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../api/client'
import { DEMO_EMAIL, DEMO_MODE, DEMO_PASSWORD } from '../demo/bus'
import { AuthLayout } from '../components/AuthLayout'
import { Icon } from '../components/ui'

export default function LoginPage() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState(DEMO_MODE ? DEMO_EMAIL : '')
  const [password, setPassword] = useState(DEMO_MODE ? DEMO_PASSWORD : '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      toast('Giriş başarılı', 'success')
      navigate('/')
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Giriş yapılamadı')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="auth-kicker">GİRİŞ · KALIP 01</div>
        <h2>Tekrar hoş geldin</h2>
        <p className="subtitle">Hesabına giriş yap, kaldığın yerden devam et.</p>

        {error && (
          <div className="error-banner" role="alert">
            <Icon name="alert" size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Giriş Yap'}
          </button>
        </form>

        {DEMO_MODE && (
          <>
            <div className="demo-login-hint">
              <span className="demo-chip">DEMO</span>
              <span>
                Örnek hesap: {DEMO_EMAIL} · {DEMO_PASSWORD}
              </span>
            </div>
            <Link className="btn btn-outline btn-block demo-open" to="/demo">
              Demo panosunu aç
            </Link>
          </>
        )}

        <div className="auth-switch">
          Hesabın yok mu? <Link to="/register">Kayıt ol</Link>
        </div>
      </div>
    </AuthLayout>
  )
}
