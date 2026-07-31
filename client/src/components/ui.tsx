import type { ReactNode } from 'react'

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  )
}

export function Badge({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`badge ${className}`}>{children}</span>
}

export function Avatar({ name, size }: { name: string; size?: 'lg' }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return <span className={`avatar${size === 'lg' ? ' avatar-lg' : ''}`}>{initials || '?'}</span>
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
