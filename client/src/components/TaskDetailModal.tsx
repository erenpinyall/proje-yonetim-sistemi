import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api, ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { TaskItemStatus, TaskPriority } from '../types'
import type { CommentDto, ProjectMemberDto, TaskItemDto } from '../types'
import { Modal, Badge, Avatar, statusBadgeClass, priorityBadgeClass, statusLabel, priorityLabel, formatDateTime } from './ui'

export function TaskDetailModal({
  task,
  projectId,
  members,
  onClose,
  onChanged,
}: {
  task: TaskItemDto
  projectId: string
  members: ProjectMemberDto[]
  onClose: () => void
  onChanged: (task: TaskItemDto) => void
}) {
  const { userId } = useAuth()
  const { toast } = useToast()
  const [comments, setComments] = useState<CommentDto[]>([])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [updating, setUpdating] = useState(false)

  const loadComments = useCallback(async () => {
    try {
      const res = await api.comments.list(task.id)
      setComments(res.items)
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, 'error')
    }
  }, [task.id, toast])

  useEffect(() => {
    void loadComments()
  }, [loadComments])

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUpdating(true)
    try {
      const updated = await api.tasks.update(projectId, task.id, {
        status: e.target.value as TaskItemStatus,
      })
      onChanged(updated)
      toast('Görev durumu güncellendi', 'success')
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handlePriorityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUpdating(true)
    try {
      const updated = await api.tasks.update(projectId, task.id, {
        priority: e.target.value as TaskPriority,
      })
      onChanged(updated)
      toast('Görev önceliği güncellendi', 'success')
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleAssigneeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUpdating(true)
    try {
      const assigneeId = e.target.value || null
      const updated = await api.tasks.update(projectId, task.id, { assigneeId })
      onChanged(updated)
      toast('Atanan kişi güncellendi', 'success')
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleComment = async (e: FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !userId) return
    setSending(true)
    try {
      const comment = await api.comments.create(task.id, { content: content.trim() })
      setComments((prev) => [comment, ...prev])
      setContent('')
      toast('Yorum eklendi', 'success')
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, 'error')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.comments.remove(task.id, commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast('Yorum silindi', 'success')
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, 'error')
    }
  }

  return (
    <Modal title="Görev Detayı" onClose={onClose}>
      <div style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, margin: 0 }}>{task.title}</h3>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <Badge className={statusBadgeClass(task.status)}>{statusLabel(task.status)}</Badge>
          <Badge className={priorityBadgeClass(task.priority)}>{priorityLabel(task.priority)}</Badge>
        </div>
      </div>

      <div className="task-desc-full" style={{ marginTop: 12 }}>
        {task.description || <span style={{ color: 'var(--text-muted)' }}>Açıklama yok</span>}
      </div>

      <div className="task-meta-grid" style={{ gridTemplateColumns: '1fr', gap: 10 }}>
        <div className="task-meta-item">
          <div className="label">Oluşturan</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar name={task.createdByName} />
            <span>{task.createdByName}</span>
          </div>
        </div>
        <div className="task-meta-item">
          <div className="label">Oluşturulma</div>
          <span>{formatDateTime(task.createdAt)}</span>
        </div>
        <div className="task-meta-item">
          <div className="label">Durum</div>
          <select value={task.status} onChange={(e) => void handleStatusChange(e)} disabled={updating}>
            <option value={TaskItemStatus.ToDo}>Yapılacak</option>
            <option value={TaskItemStatus.InProgress}>Devam Ediyor</option>
            <option value={TaskItemStatus.Done}>Tamamlandı</option>
          </select>
        </div>
        <div className="task-meta-item">
          <div className="label">Öncelik</div>
          <select value={task.priority} onChange={(e) => void handlePriorityChange(e)} disabled={updating}>
            <option value={TaskPriority.Low}>Düşük</option>
            <option value={TaskPriority.Medium}>Orta</option>
            <option value={TaskPriority.High}>Yüksek</option>
          </select>
        </div>
        <div className="task-meta-item">
          <div className="label">Atanan Kişi</div>
          <select value={task.assigneeId ?? ''} onChange={(e) => void handleAssigneeChange(e)} disabled={updating}>
            <option value="">Atanmadı</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.username}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0 12px', paddingTop: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          💬 Yorumlar <span className="board-column-count">{comments.length}</span>
        </h3>

        <div className="comments-list" style={{ maxHeight: 260, overflowY: 'auto' }}>
          {comments.length === 0 ? (
            <div className="no-comments">Henüz yorum yok.</div>
          ) : (
            comments.map((c) => (
              <div className="comment" key={c.id}>
                <div className="comment-header">
                  <span className="comment-author">
                    <Avatar name={c.username} />
                    {c.username}
                    {c.userId === userId && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(sen)</span>}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="comment-time">{formatDateTime(c.createdAt)}</span>
                    {c.userId === userId && (
                      <button className="comment-delete" title="Yorumu sil" onClick={() => void handleDeleteComment(c.id)}>
                        🗑
                      </button>
                    )}
                  </span>
                </div>
                <div className="comment-body">{c.content}</div>
              </div>
            ))
          )}
        </div>

        <form className="comment-input" onSubmit={(e) => void handleComment(e)}>
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Yorum yaz..."
            maxLength={2000}
            disabled={!userId}
          />
          <button className="btn btn-primary btn-sm" type="submit" disabled={sending || !content.trim() || !userId}>
            {sending ? <span className="spinner" /> : 'Gönder'}
          </button>
        </form>
      </div>

      <div className="modal-actions">
        <button className="btn btn-outline" onClick={onClose}>
          Kapat
        </button>
      </div>
    </Modal>
  )
}
