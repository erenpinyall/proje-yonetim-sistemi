import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSignalR } from '../hooks/useSignalR'
import { TaskItemStatus, TaskPriority } from '../types'
import type {
  ProjectDetailDto,
  TaskItemDto,
} from '../types'
import { LoadingPage, PageHeader } from '../components/Layout'
import {
  Modal,
  Badge,
  Avatar,
  statusBadgeClass,
  priorityBadgeClass,
  roleBadgeClass,
  statusLabel,
  priorityLabel,
  roleLabel,
} from '../components/ui'
import { TaskDetailModal } from '../components/TaskDetailModal'

type Tab = 'tasks' | 'members'

export default function ProjectPage() {
  const { id = '' } = useParams()
  const { userId } = useAuth()
  const { toast } = useToast()

  const [project, setProject] = useState<ProjectDetailDto | null>(null)
  const [tasks, setTasks] = useState<TaskItemDto[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('tasks')

  const [showCreateTask, setShowCreateTask] = useState(false)
  const [creatingTask, setCreatingTask] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>(TaskPriority.Medium)
  const [taskAssignee, setTaskAssignee] = useState('')
  const [taskFormError, setTaskFormError] = useState('')

  const [showAddMember, setShowAddMember] = useState(false)
  const [addingMember, setAddingMember] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')
  const [memberRole, setMemberRole] = useState<'Admin' | 'Member'>('Member')
  const [memberFormError, setMemberFormError] = useState('')

  const [selectedTask, setSelectedTask] = useState<TaskItemDto | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [proj, taskRes] = await Promise.all([
        api.projects.get(id),
        api.tasks.list(id, { Page: '1', PageSize: '100' }),
      ])
      setProject(proj)
      setTasks(taskRes.items)
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    setLoading(true)
    void loadData()
  }, [loadData])

  const refreshTasks = useCallback(async () => {
    try {
      const res = await api.tasks.list(id, { Page: '1', PageSize: '100' })
      setTasks(res.items)
    } catch {
      // silent
    }
  }, [id])

  useSignalR(id, {
    onTaskCreated: (t) => setTasks((prev) => [t, ...prev]),
    onTaskUpdated: (t) => setTasks((prev) => prev.map((x) => (x.id === t.id ? t : x))),
    onTaskDeleted: (taskId) => setTasks((prev) => prev.filter((x) => x.id !== taskId)),
    onNewComment: () => {
      void refreshTasks()
    },
  })

  const isAdmin = useMemo(() => {
    if (!project || !userId) return false
    return project.ownerId === userId || project.members.some((m) => m.userId === userId && m.role === 'Admin')
  }, [project, userId])

  const columns = useMemo(() => {
    const cols: { key: TaskItemStatus; label: string }[] = [
      { key: TaskItemStatus.ToDo, label: 'Yapılacak' },
      { key: TaskItemStatus.InProgress, label: 'Devam Ediyor' },
      { key: TaskItemStatus.Done, label: 'Tamamlandı' },
    ]
    return cols.map((c) => ({ ...c, items: tasks.filter((t) => t.status === c.key) }))
  }, [tasks])

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault()
    setTaskFormError('')
    setCreatingTask(true)
    try {
      const created = await api.tasks.create(id, {
        title: taskTitle,
        description: taskDesc || null,
        priority: taskPriority,
        assigneeId: taskAssignee || null,
      })
      setTasks((prev) => [created, ...prev])
      setShowCreateTask(false)
      setTaskTitle('')
      setTaskDesc('')
      setTaskAssignee('')
      setTaskPriority(TaskPriority.Medium)
      toast('Görev oluşturuldu', 'success')
    } catch (err) {
      if (err instanceof ApiError) setTaskFormError(err.message)
      else setTaskFormError('Görev oluşturulamadı')
    } finally {
      setCreatingTask(false)
    }
  }

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault()
    setMemberFormError('')
    setAddingMember(true)
    try {
      const updated = await api.projects.get(id)
      setProject(updated)
      setShowAddMember(false)
      setMemberEmail('')
      setMemberRole('Member')
      toast('Üye eklendi', 'success')
    } catch (err) {
      if (err instanceof ApiError) setMemberFormError(err.message)
      else setMemberFormError('Üye eklenemedi')
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (memberUserId: string, memberName: string) => {
    if (!window.confirm(`${memberName} üyesini projeden çıkarmak istediğine emin misin?`)) return
    try {
      await api.projects.removeMember(id, memberUserId)
      setProject((prev) => (prev ? { ...prev, members: prev.members.filter((m) => m.userId !== memberUserId) } : prev))
      toast('Üye çıkarıldı', 'success')
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, 'error')
    }
  }

  const handleTaskChanged = (updated: TaskItemDto) => {
    setTasks((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
    setSelectedTask(updated)
  }

  if (loading) return <LoadingPage />

  if (!project) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h3>Proje bulunamadı</h3>
        <Link to="/">← Projelere dön</Link>
      </div>
    )
  }

  return (
    <>
      <Link to="/" className="back-link">
        ← Projelerim
      </Link>

      <PageHeader
        title={project.name}
        subtitle={
          project.description ||
          'Açıklama yok · ' +
            new Date(project.createdAt).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
        }
        actions={
          tab === 'tasks' ? (
            <button className="btn btn-primary" onClick={() => setShowCreateTask(true)}>
              + Yeni Görev
            </button>
          ) : isAdmin ? (
            <button className="btn btn-primary" onClick={() => setShowAddMember(true)}>
              + Üye Ekle
            </button>
          ) : undefined
        }
      />

      <div className="tabs">
        <button className={`tab${tab === 'tasks' ? ' active' : ''}`} onClick={() => setTab('tasks')}>
          Görevler
        </button>
        <button className={`tab${tab === 'members' ? ' active' : ''}`} onClick={() => setTab('members')}>
          Üyeler ({project.members.length})
        </button>
      </div>

      {tab === 'tasks' ? (
        tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Henüz görev yok</h3>
            <p>İlk görevi oluşturarak panoyu doldurmaya başla.</p>
            <br />
            <button className="btn btn-primary" onClick={() => setShowCreateTask(true)}>
              + Yeni Görev
            </button>
          </div>
        ) : (
          <div className="task-board">
            {columns.map((col) => (
              <div className="board-column" key={col.key}>
                <div className="board-column-header">
                  <span className="board-column-title">{col.label}</span>
                  <span className="board-column-count">{col.items.length}</span>
                </div>
                {col.items.map((task) => (
                  <div className="task-card" key={task.id} onClick={() => setSelectedTask(task)}>
                    <h4>{task.title}</h4>
                    {task.description && <div className="task-desc">{task.description}</div>}
                    <div className="task-card-footer" style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                      <Badge className={statusBadgeClass(task.status)}>{statusLabel(task.status)}</Badge>
                      <Badge className={priorityBadgeClass(task.priority)}>{priorityLabel(task.priority)}</Badge>
                    </div>
                    <div className="task-footer">
                      <span className="task-assignee">
                        {task.assigneeName ? (
                          <>
                            <Avatar name={task.assigneeName} />
                            {task.assigneeName}
                          </>
                        ) : (
                          <span style={{ opacity: 0.7 }}>Atanmadı</span>
                        )}
                      </span>
                      <span className="task-comments">💬 {task.commentCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="member-list">
          <div className="member-row" style={{ borderStyle: 'dashed' }}>
            <div className="member-info">
              <Avatar name={project.members.find((m) => m.userId === project.ownerId)?.username ?? 'S' } size="lg" />
              <div>
                <div className="member-name">
                  {project.members.find((m) => m.userId === project.ownerId)?.username ?? 'Sahip'}
                </div>
                <div className="member-email">{project.members.find((m) => m.userId === project.ownerId)?.email}</div>
              </div>
            </div>
            <Badge className="badge-role-admin">Sahip</Badge>
          </div>

          {project.members
            .filter((m) => m.userId !== project.ownerId)
            .map((m) => (
              <div className="member-row" key={m.userId}>
                <div className="member-info">
                  <Avatar name={m.username} size="lg" />
                  <div>
                    <div className="member-name">{m.username}</div>
                    <div className="member-email">{m.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge className={roleBadgeClass(m.role)}>{roleLabel(m.role)}</Badge>
                  {isAdmin && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => void handleRemoveMember(m.userId, m.username)}
                    >
                      Çıkar
                    </button>
                  )}
                </div>
              </div>
            ))}

          {project.members.length <= 1 && (
            <div className="empty-state" style={{ marginTop: 12 }}>
              <div className="empty-icon">👥</div>
              <h3>Henüz üye yok</h3>
              <p>E-posta adresiyle ekip üyesi davet et.</p>
              {isAdmin && (
                <>
                  <br />
                  <button className="btn btn-primary" onClick={() => setShowAddMember(true)}>
                    + Üye Ekle
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {showCreateTask && (
        <Modal title="Yeni Görev" onClose={() => setShowCreateTask(false)}>
          <form onSubmit={handleCreateTask}>
            {taskFormError && <div className="error-banner">{taskFormError}</div>}
            <div className="form-group">
              <label htmlFor="ttitle">Başlık</label>
              <input
                id="ttitle"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Görev başlığı"
                maxLength={200}
                autoFocus
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="tdesc">Açıklama</label>
              <textarea
                id="tdesc"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Görev açıklaması"
                rows={3}
                maxLength={2000}
              />
            </div>
            <div className="form-group">
              <label htmlFor="tpriority">Öncelik</label>
              <select id="tpriority" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}>
                <option value={TaskPriority.Low}>Düşük</option>
                <option value={TaskPriority.Medium}>Orta</option>
                <option value={TaskPriority.High}>Yüksek</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="tassignee">Atanan Kişi</label>
              <select id="tassignee" value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)}>
                <option value="">Atanmadı</option>
                {project.members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowCreateTask(false)}>
                İptal
              </button>
              <button type="submit" className="btn btn-primary" disabled={creatingTask || !taskTitle.trim()}>
                {creatingTask ? <span className="spinner" /> : 'Oluştur'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showAddMember && (
        <Modal title="Üye Ekle" onClose={() => setShowAddMember(false)}>
          <form onSubmit={(e) => void handleAddMember(e)}>
            {memberFormError && <div className="error-banner">{memberFormError}</div>}
            <div className="form-group">
              <label htmlFor="memail">Kullanıcı e-postası</label>
              <input
                id="memail"
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="ornek@mail.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="mrole">Rol</label>
              <select id="mrole" value={memberRole} onChange={(e) => setMemberRole(e.target.value as 'Admin' | 'Member')}>
                <option value="Member">Üye</option>
                <option value="Admin">Yönetici</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowAddMember(false)}>
                İptal
              </button>
              <button type="submit" className="btn btn-primary" disabled={addingMember || !memberEmail.trim()}>
                {addingMember ? <span className="spinner" /> : 'Ekle'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={id}
          members={project.members}
          onClose={() => setSelectedTask(null)}
          onChanged={handleTaskChanged}
        />
      )}
    </>
  )
}
