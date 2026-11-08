import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api, ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { TaskItemStatus, TaskPriority } from '../types'
import type { CommentDto, ProjectMemberDto, TaskItemDto } from '../types'
import {
  Modal,
  Badge,
  Avatar,
  Icon,
  statusBadgeClass,
  priorityBadgeClass,
  statusLabel,
  priorityLabel,
  formatDateTime,
} from './ui'

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
      const nextComments = [comment, ...comments]
      setComments(nextComments)
      onChanged({ ...task, commentCount: nextComments.length })
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
      const nextComments = comments.filter((c) => c.id !== commentId)
      setComments(nextComments)
      onChanged({ ...task, commentCount: nextComments.length })
      toast('Yorum silindi', 'success')
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, 'error')
    }
  }

  const code = `GÖREV · ${task.id.slice(0, 4).toUpperCase()}`

  return (
    <Modal title="Görev Föyü" kicker={code} onClose={onClose} wide>
      <div className="task-sheet">
        <div className="task-sheet-main">
          <div className="task-chips">
            <Badge className={statusBadgeClass(task.status)}>{statusLabel(task.status)}</Badge>
            <Badge className={priorityBadgeClass(task.priority)}>{priorityLabel(task.priority)}</Badge>
          </div>

          <h2 className="task-sheet-title">{task.title}</h2>
          <p className={`task-sheet-desc${task.description ? '' : ' empty'}`}>
            {task.description || 'Açıklama yok.'}
          </p>

          <div className="task-fields">
            <div className="task-field">
              <label className="label" htmlFor="task-status">
                Durum
              </label>
              <div className="value">
                <select id="task-status" value={task.status} onChange={(e) => void handleStatusChange(e)} disabled={updating}>
                  <option value={TaskItemStatus.ToDo}>Yapılacak</option>
                  <option value={TaskItemStatus.InProgress}>Devam Ediyor</option>
                  <option value={TaskItemStatus.Done}>Tamamlandı</option>
                </select>
              </div>
            </div>

            <div className="task-field">
              <label className="label" htmlFor="task-priority">
                Öncelik
              </label>
              <div className="value">
                <select id="task-priority" value={task.priority} onChange={(e) => void handlePriorityChange(e)} disabled={updating}>
                  <option value={TaskPriority.Low}>Düşük</option>
                  <option value={TaskPriority.Medium}>Orta</option>
                  <option value={TaskPriority.High}>Yüksek</option>
                </select>
              </div>
            </div>

            <div className="task-field">
              <label className="label" htmlFor="task-assignee">
                Atanan kişi
              </label>
              <div className="value">
                <select
                  id="task-assignee"
                  value={task.assigneeId ?? ''}
                  onChange={(e) => void handleAssigneeChange(e)}
                  disabled={updating}
                >
                  <option value="">Atanmadı</option>
                  {members.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="task-field">
              <span className="label">Oluşturan</span>
              <div className="value">
                <Avatar name={task.createdByName} />
                <span>{task.createdByName}</span>
              </div>
            </div>

            <div className="task-field">
              <span className="label">Oluşturulma</span>
              <div className="value">{formatDateTime(task.createdAt)}</div>
            </div>

            <div className="task-field">
              <span className="label">Son güncelleme</span>
              <div className="value">{formatDateTime(task.updatedAt)}</div>
            </div>
          </div>
        </div>

        <aside className="comments-panel" aria-label="Yorumlar">
          <div className="comments-head">
            <h4>
              <Icon name="comment" size={14} />
              Yorumlar
            </h4>
            <span className="board-column-count">{comments.length}</span>
          </div>

          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">Henüz yorum yok. İlk notu sen iliştir.</div>
            ) : (
              comments.map((comment) => (
                <div className="comment" key={comment.id}>
                  <div className="comment-header">
                    <span className="comment-author">
                      <Avatar name={comment.username} />
                      {comment.username}
                      {comment.userId === userId && <span className="you">(sen)</span>}
                    </span>
                    <span className="comment-side">
                      <span className="comment-time">{formatDateTime(comment.createdAt)}</span>
                      {comment.userId === userId && (
                        <button
                          className="comment-delete"
                          title="Yorumu sil"
                          aria-label="Yorumu sil"
                          onClick={() => void handleDeleteComment(comment.id)}
                          type="button"
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      )}
                    </span>
                  </div>
                  <div className="comment-body">{comment.content}</div>
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
              aria-label="Yorum yaz"
            />
            <button className="btn btn-primary btn-sm" type="submit" disabled={sending || !content.trim() || !userId}>
              {sending ? <span className="spinner" /> : 'Gönder'}
            </button>
          </form>
        </aside>
      </div>
    </Modal>
  )
}
