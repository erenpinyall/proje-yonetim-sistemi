import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../api/client'

export default function LoginPage() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="auth-page">
      <div className="auth-hero">
        <h1>
          Projelerini tek yerden <span>yönet.</span>
        </h1>
        <p>
          Görevleri planla, ekip üyelerini davet et, ilerlemeyi gerçek zamanlı takip et. TaskTracker ile
          projelerin hep yolunda.
        </p>
        <div className="auth-features">
          <div className="auth-feature">
            <span className="icon">📋</span> Kanban tarzı görev panoları
          </div>
          <div className="auth-feature">
            <span className="icon">👥</span> Ekip üyeleri ve rol yönetimi
          </div>
          <div className="auth-feature">
            <span className="icon">⚡</span> Gerçek zamanlı güncellemeler
          </div>
          <div className="auth-feature">
            <span className="icon">💬</span> Görev üzerinde yorumlar
          </div>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <h2>Tekrar hoş geldin</h2>
          <p className="subtitle">Hesabına giriş yap</p>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">E-posta</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
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
                required
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Giriş Yap'}
            </button>
          </form>
          <div className="auth-switch">
            Hesabın yok mu? <Link to="/register">Kayıt ol</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
