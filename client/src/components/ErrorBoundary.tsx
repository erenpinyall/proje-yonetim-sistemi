import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Icon } from './ui'

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary yakaladı:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          background: 'var(--paper)',
          color: 'var(--ink)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 520,
            padding: 28,
            background: 'var(--paper-3)',
            border: '1.5px solid var(--ink)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 10,
              color: 'var(--thread)',
              fontFamily: 'var(--mono)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            <Icon name="alert" size={16} />
            Beklenmeyen bir hata
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>
            İş burada bir düğüm attı
          </h2>
          <p style={{ marginTop: 10, color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
            Sayfayı yenilemek çoğu zaman yeterli olur. Sorun sürerse aşağıdaki mesajı geliştiriciye
            iletebilirsin.
          </p>

          <div
            style={{
              marginTop: 16,
              padding: '10px 12px',
              background: 'var(--paper-2)',
              border: '1px dashed var(--seam)',
              borderRadius: 2,
              fontFamily: 'var(--mono)',
              fontSize: 11.5,
              lineHeight: 1.5,
              color: 'var(--thread)',
              wordBreak: 'break-word',
            }}
          >
            {this.state.message || 'Bilinmeyen hata'}
          </div>

          <div style={{ display: 'flex', gap: 9, marginTop: 20 }}>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => window.location.reload()}
            >
              Sayfayı yenile
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => this.setState({ hasError: false, message: '' })}
            >
              Tekrar dene
            </button>
          </div>
        </div>
      </div>
    )
  }
}
