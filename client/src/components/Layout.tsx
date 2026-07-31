import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSignalR } from '../hooks/useSignalR'

export function Layout({ children }: { children: ReactNode }) {
  const { username, logout } = useAuth()
  const navigate = useNavigate()
  const { connected } = useSignalR()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <span className="logo">✓</span>
            TaskTracker
          </Link>
          <div className="navbar-right">
            <span className="live-dot" title={connected ? 'Canlı bağlantı' : 'Bağlantı yok'}>
              Canlı
            </span>
            <span className="navbar-user">{username}</span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Çıkış
            </button>
          </div>
        </div>
      </nav>
      <main className="content">{children}</main>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <div className="subtitle">{subtitle}</div>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  )
}

export function LoadingPage({ label = 'Yükleniyor...' }: { label?: string }) {
  return (
    <div className="loading-page">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  )
}
