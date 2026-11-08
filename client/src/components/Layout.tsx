import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSignalR } from '../hooks/useSignalR'
import { DEMO_MODE, DEMO_STORAGE_KEY } from '../demo/bus'
import { HowToModal } from './HowToModal'
import { Avatar, Icon } from './ui'

export function Layout({ children }: { children: ReactNode }) {
  const { username, email, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { connected } = useSignalR()
  const [showHelp, setShowHelp] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const resetDemo = () => {
    localStorage.removeItem(DEMO_STORAGE_KEY)
    localStorage.removeItem('tt_token')
    localStorage.removeItem('tt_username')
    localStorage.removeItem('tt_email')
    localStorage.removeItem('tt_userid')
    window.location.assign('/demo')
  }

  const onProjects = location.pathname === '/' || location.pathname.startsWith('/projects')

  return (
    <div className="shell">
      <aside className="rail">
        <Link to="/" className="rail-brand" aria-label="Nabız ana sayfa">
          <span className="brand-mark" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="6" cy="7" r="2.2" />
              <circle cx="6" cy="17" r="2.2" />
              <path d="M8 8.6 20 18M8 15.4 20 6" strokeLinecap="round" />
            </svg>
          </span>
          <span className="brand-word">
            <b>Nabız</b>
            <span>CANLI EKİP PANOSU</span>
            {DEMO_MODE && <span className="demo-chip">DEMO</span>}
          </span>
        </Link>

        <nav className="rail-nav" aria-label="Ana menü">
          <Link to="/" className={`rail-link${onProjects ? ' active' : ''}`} aria-current={onProjects ? 'page' : undefined}>
            <Icon name="columns" size={16} />
            Projeler
          </Link>
          <button className="rail-link rail-link-button" type="button" onClick={() => setShowHelp(true)}>
            <Icon name="info" size={16} />
            Nasıl kullanılır?
          </button>
        </nav>

        <div className={`live-panel${connected ? ' on' : ''}`} aria-live="polite">
          <div className="live-panel-head">
            <span className="live-dot" />
            <span className="live-panel-label">{connected ? 'Canlı bağlantı' : 'Bağlantı yok'}</span>
          </div>
          <div className="live-panel-sub">
            {connected
              ? DEMO_MODE
                ? 'Örnek veri · değişiklikler anında akıyor.'
                : 'Değişiklikler panoya anında dikiliyor.'
              : 'Yeniden bağlanmayı deniyor.'}
          </div>
          <div className="live-panel-stitch" aria-hidden="true" />
          <div className="live-panel-actions">
            <button
              className="live-help"
              type="button"
              onClick={() => setShowHelp(true)}
              aria-label="Nasıl kullanılır?"
              title="Nasıl kullanılır?"
            >
              <Icon name="info" size={12} />
              <span>Nasıl kullanılır?</span>
            </button>
            {DEMO_MODE && (
              <button className="live-reset" type="button" onClick={resetDemo}>
                Demoyu sıfırla
              </button>
            )}
          </div>
        </div>

        <div className="rail-foot">
          <div className="rail-user">
            <Avatar name={username ?? '?'} />
            <span className="rail-user-text">
              <b>{username ?? 'Kullanıcı'}</b>
              {email && <span>{email}</span>}
            </span>
          </div>
          <button className="rail-logout" onClick={handleLogout} type="button">
            <Icon name="logout" size={15} />
            <span>Çıkış</span>
          </button>
        </div>
      </aside>

      <main className="content">{children}</main>

      {showHelp && <HowToModal onClose={() => setShowHelp(false)} />}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  )
}

export function LoadingPage({ label = 'Pano hazırlanıyor' }: { label?: string }) {
  return (
    <div className="loading-page" role="status" aria-live="polite">
      <div className="stitch-loader" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <span>{label}</span>
    </div>
  )
}
