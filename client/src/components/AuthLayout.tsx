import type { ReactNode } from 'react'
import { DEMO_MODE } from '../demo/bus'
import { Icon } from './ui'

const features = [
  { icon: 'columns' as const, label: 'Kanban tarzı görev panoları' },
  { icon: 'users' as const, label: 'Ekip üyeleri ve rol yönetimi' },
  { icon: 'clock' as const, label: 'Gerçek zamanlı güncellemeler' },
  { icon: 'comment' as const, label: 'Görev üzerinde yorumlar' },
]

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      <section className="auth-hero">
        <div className="auth-brand">
          <span className="brand-mark" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="6" cy="7" r="2.2" />
              <circle cx="6" cy="17" r="2.2" />
              <path d="M8 8.6 20 18M8 15.4 20 6" strokeLinecap="round" />
            </svg>
          </span>
          Nabız
        </div>

        <div className="auth-hero-copy">
          <h1>
            Projelerini tek yerden <em>yönet.</em>
          </h1>
          <p>
            Görevleri planla, ekip üyelerini davet et, ilerlemeyi gerçek zamanlı takip et. Nabız ile
            projelerin hep yolunda.
          </p>
        </div>

        <div className="auth-features">
          {features.map((feature) => (
            <div className="auth-feature" key={feature.label}>
              <span className="icon">
                <Icon name={feature.icon} size={16} />
              </span>
              {feature.label}
            </div>
          ))}
        </div>

        <div className="pattern-art" aria-hidden="true">
          <div className="pattern-sheet">
            <div className="pattern-columns">
              <div className="pattern-col">
                <b>YAPILACAK</b>
                <div className="pattern-mini">
                  <i />
                  <i />
                </div>
                <div className="pattern-mini">
                  <i />
                  <i />
                </div>
              </div>
              <div className="pattern-col">
                <b>DEVAM EDİYOR</b>
                <div className="pattern-mini">
                  <i />
                  <i />
                </div>
                <div className="pattern-mini hot">
                  <i />
                  <i />
                </div>
              </div>
              <div className="pattern-col">
                <b>TAMAMLANDI</b>
                <div className="pattern-mini">
                  <i />
                  <i />
                </div>
                <div className="pattern-mini">
                  <i />
                  <i />
                </div>
              </div>
            </div>
          </div>
          <div className="pattern-stitch" />
          <div className="pattern-needle" />
          <div className="pattern-chip c1">
            <b />
            YENİ GÖREV DİKİLDİ
          </div>
          <div className="pattern-chip c2">
            <b />
            SEDA · CANLI
          </div>
        </div>
      </section>

      <section className="auth-panel">
        {children}
        <div className="auth-foot">
          {DEMO_MODE ? 'NABIZ · DEMO · ÖRNEK VERİYLE ÇALIŞIR' : 'NABIZ · KÜÇÜK EKİPLER İÇİN CANLI PANO'}
        </div>
      </section>
    </div>
  )
}
