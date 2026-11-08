import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, ReactNode, SVGProps } from 'react'

/* ------------------------------------------------------------------
   İkonlar — emoji yerine çizgi ikonlar
   ------------------------------------------------------------------ */

export type IconName =
  | 'plus'
  | 'arrow-left'
  | 'trash'
  | 'comment'
  | 'check'
  | 'check-circle'
  | 'users'
  | 'folder'
  | 'calendar'
  | 'logout'
  | 'close'
  | 'search'
  | 'filter'
  | 'alert'
  | 'info'
  | 'clock'
  | 'columns'
  | 'user'
  | 'pin'

const paths: Record<IconName, ReactNode> = {
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  'arrow-left': (
    <>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m6 6 1 14h10l1-14" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  comment: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />,
  check: <path d="M20 6 9 17l-5-5" />,
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  folder: <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2Z" />,
  calendar: (
    <>
      <path d="M8 2v4M16 2v4" />
      <path d="M3 10h18" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  close: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  filter: <path d="M22 3H2l8 9.46V19l4 2v-8.54Z" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  columns: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M15 3v18" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </>
  ),
  pin: (
    <>
      <path d="M9 3h6l-1 6 3 4H7l3-4Z" />
      <path d="M12 13v8" />
    </>
  ),
}

export function Icon({
  name,
  size = 17,
  strokeWidth = 1.7,
  ...rest
}: { name: IconName; size?: number; strokeWidth?: number } & Omit<SVGProps<SVGSVGElement>, 'name'>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}

/* ------------------------------------------------------------------
   Modal — kalıp föyü gibi açılır
   ------------------------------------------------------------------ */

export function Modal({
  title,
  kicker,
  onClose,
  children,
  wide,
}: {
  title: string
  kicker?: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const titleId = useId()

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!ref.current?.contains(document.activeElement)) ref.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const root = ref.current
      if (!root) return
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null)

      if (focusable.length === 0) {
        event.preventDefault()
        root.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (active === root) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      } else if (!root.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      previous?.focus?.()
    }
  }, [])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={ref}
        className={`modal${wide ? ' modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            {kicker && <div className="modal-kicker">{kicker}</div>}
            <h3 id={titleId}>{title}</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Kapat" type="button">
            <Icon name="close" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   Küçük parçalar
   ------------------------------------------------------------------ */

export function Badge({
  className,
  children,
  title,
}: {
  className: string
  children: ReactNode
  title?: string
}) {
  return (
    <span className={`badge ${className}`} title={title}>
      {children}
    </span>
  )
}

const tones = ['navy', 'red', 'green', 'tape'] as const

function toneFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return tones[Math.abs(hash) % tones.length]
}

export function Avatar({ name, size }: { name: string; size?: 'lg' }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <span
      className={`avatar${size === 'lg' ? ' avatar-lg' : ''}`}
      data-tone={toneFor(name || '?')}
      aria-hidden="true"
    >
      {initials || '?'}
    </span>
  )
}

/** Değer değiştiğinde sayıyı dikiş ritmiyle sayar. */
export function LiveCounter({ value, className = '' }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const from = fromRef.current
    if (reduce || from === value) {
      fromRef.current = value
      setDisplay(value)
      return
    }

    const start = performance.now()
    const duration = 650
    let frame = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
      else fromRef.current = value
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return <span className={`live-counter ${className}`.trim()}>{display}</span>
}

export function statusBadgeClass(status: string) {
  switch (status) {
    case 'ToDo':
      return 'badge-todo'
    case 'InProgress':
      return 'badge-inprogress'
    case 'Done':
      return 'badge-done'
    default:
      return ''
  }
}

export function priorityBadgeClass(priority: string) {
  switch (priority) {
    case 'Low':
      return 'badge-low'
    case 'Medium':
      return 'badge-medium'
    case 'High':
      return 'badge-high'
    default:
      return ''
  }
}

export function roleBadgeClass(role: string) {
  return role === 'Admin' ? 'badge-role-admin' : 'badge-role-member'
}

export function statusLabel(status: string) {
  switch (status) {
    case 'ToDo':
      return 'Yapılacak'
    case 'InProgress':
      return 'Devam Ediyor'
    case 'Done':
      return 'Tamamlandı'
    default:
      return status
  }
}

export function priorityLabel(priority: string) {
  switch (priority) {
    case 'Low':
      return 'Düşük'
    case 'Medium':
      return 'Orta'
    case 'High':
      return 'Yüksek'
    default:
      return priority
  }
}

export function roleLabel(role: string) {
  return role === 'Admin' ? 'Yönetici' : 'Üye'
}

export function statusTone(status: string): 'todo' | 'doing' | 'done' {
  if (status === 'InProgress') return 'doing'
  if (status === 'Done') return 'done'
  return 'todo'
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Görevin panoda geçirdiği süreyi dikiş uzunluğuna çevirir. */
export function ageStyle(iso: string): CSSProperties & Record<'--age', string> {
  const days = Math.max(0, (Date.now() - new Date(iso).getTime()) / 86_400_000)
  const width = Math.min(100, 8 + days * 7)
  return { '--age': `${Math.round(width)}%` }
}

export function ageLabel(iso: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000))
  if (days === 0) return 'bugün panoda'
  if (days === 1) return '1 gündür panoda'
  return `${days} gündür panoda`
}
