import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSignalR } from '../hooks/useSignalR'
import { TaskItemStatus, TaskPriority } from '../types'
import type { ProjectDetailDto, TaskItemDto } from '../types'
import { LoadingPage, PageHeader } from '../components/Layout'
import {
  Avatar,
  Badge,
  Icon,
  LiveCounter,
  Modal,
  ageLabel,
  ageStyle,
  formatDate,
  priorityBadgeClass,
  priorityLabel,
  roleBadgeClass,
  roleLabel,
  statusBadgeClass,
  statusLabel,
  statusTone,
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

  const [changedIds, setChangedIds] = useState<Set<string>>(new Set())
  const changeTimers = useRef<Map<string, number>>(new Map())

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
      // sessiz geç: canlı yorum yenilemesi kritik değil
    }
  }, [id])

  const markChanged = useCallback((taskId: string) => {
    setChangedIds((prev) => {
      const next = new Set(prev)
      next.add(taskId)
      return next
    })
    const existing = changeTimers.current.get(taskId)
    if (existing) window.clearTimeout(existing)
    const timer = window.setTimeout(() => {
      setChangedIds((prev) => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
      changeTimers.current.delete(taskId)
    }, 12_000)
    changeTimers.current.set(taskId, timer)
  }, [])

  const clearChanged = useCallback((taskId: string) => {
    const timer = changeTimers.current.get(taskId)
    if (timer) {
      window.clearTimeout(timer)
      changeTimers.current.delete(taskId)
    }
    setChangedIds((prev) => {
      if (!prev.has(taskId)) return prev
      const next = new Set(prev)
      next.delete(taskId)
      return next
    })
  }, [])

  useEffect(() => {
    const timers = changeTimers.current
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      timers.clear()
    }
  }, [])

  useSignalR(id, {
    onTaskCreated: (task) => {
      setTasks((prev) => (prev.some((t) => t.id === task.id) ? prev : [task, ...prev]))
      markChanged(task.id)
    },
    onTaskUpdated: (task) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
      markChanged(task.id)
    },
    onTaskDeleted: (taskId) => setTasks((prev) => prev.filter((t) => t.id !== taskId)),
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
    return cols.map((col) => ({ ...col, items: tasks.filter((t) => t.status === col.key) }))
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
      await api.projects.addMember(id, { email: memberEmail, role: memberRole })
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
      setProject((prev) =>
        prev ? { ...prev, members: prev.members.filter((m) => m.userId !== memberUserId) } : prev,
      )
      toast('Üye çıkarıldı', 'success')
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, 'error')
    }
  }

  const handleTaskChanged = (updated: TaskItemDto) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setSelectedTask(updated)
  }

  const openTask = (task: TaskItemDto) => {
    clearChanged(task.id)
    setSelectedTask(task)
  }

  const onTaskKeyDown = (event: KeyboardEvent<HTMLElement>, task: TaskItemDto) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openTask(task)
    }
  }

  if (loading) return <LoadingPage label="Pano dikiliyor" />

  if (!project) {
    return (
      <div className="empty-state">
        <span className="empty-icon">
          <Icon name="search" size={28} />
        </span>
        <h3>Proje bulunamadı</h3>
        <p>Aradığın kalıp silinmiş olabilir.</p>
        <Link to="/">← Projelere dön</Link>
      </div>
    )
  }

  const owner = project.members.find((m) => m.userId === project.ownerId)

  return (
    <>
      <Link to="/" className="back-link">
        <Icon name="arrow-left" size={13} />
        Projelerim
      </Link>

      <PageHeader
        title={project.name}
        subtitle={project.description || 'Açıklama yok.'}
        actions={
          tab === 'tasks' ? (
            <button className="btn btn-primary" onClick={() => setShowCreateTask(true)} type="button">
              <Icon name="plus" size={16} />
              Yeni Görev
            </button>
          ) : isAdmin ? (
            <button className="btn btn-primary" onClick={() => setShowAddMember(true)} type="button">
              <Icon name="plus" size={16} />
              Üye Ekle
            </button>
          ) : undefined
        }
      >
        <div className="project-meta">
          <span className="meta-chip">
            <Icon name="calendar" size={12} />
            {formatDate(project.createdAt)}
          </span>
          <span className="meta-chip">
            <Icon name="users" size={12} />
            {project.members.length} üye
          </span>
          <span className="meta-chip">
            <Icon name="columns" size={12} />
            {tasks.length} görev
          </span>
        </div>
      </PageHeader>

      <div className="tabs" role="tablist" aria-label="Proje görünümü">
        <button
          className={`tab${tab === 'tasks' ? ' active' : ''}`}
          onClick={() => setTab('tasks')}
          role="tab"
          aria-selected={tab === 'tasks'}
          type="button"
        >
          Görevler <span className="count">{tasks.length}</span>
        </button>
        <button
          className={`tab${tab === 'members' ? ' active' : ''}`}
          onClick={() => setTab('members')}
          role="tab"
          aria-selected={tab === 'members'}
          type="button"
        >
          Üyeler <span className="count">{project.members.length}</span>
        </button>
      </div>

      {tab === 'tasks' ? (
        tasks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              <Icon name="columns" size={28} />
            </span>
            <h3>Henüz görev yok</h3>
            <p>İlk görevi oluştur; panoya ilk dikişi at.</p>
            <button className="btn btn-primary" onClick={() => setShowCreateTask(true)} type="button">
              <Icon name="plus" size={16} />
              Yeni Görev
            </button>
          </div>
        ) : (
          <div className="board-wrap">
            <div className="board-stitch" aria-hidden="true" />
            <div className="task-board">
              {columns.map((column) => (
                <section className="board-column" key={column.key} aria-label={column.label}>
                  <div className="board-column-header">
                    <span className="board-column-title">
                      <i className={statusTone(column.key)} />
                      {column.label}
                    </span>
                    <span className="board-column-count">
                      <LiveCounter value={column.items.length} />
                    </span>
                  </div>

                  {column.items.map((task, index) => {
                    const isChanged = changedIds.has(task.id)
                    return (
                      <article
                        className={`task-card${isChanged ? ' is-changed' : ''}`}
                        key={task.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openTask(task)}
                        onKeyDown={(e) => onTaskKeyDown(e, task)}
                        aria-label={`${task.title} görevini aç`}
                        style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                      >
                        {isChanged && <span className="new-thread">YENİ · AZ ÖNCE</span>}
                        <span className="notch notch-tl" aria-hidden="true" />
                        <span className="notch notch-br" aria-hidden="true" />

                        <div className="task-card-head">
                          <span className="task-code">GÖREV · {task.id.slice(0, 4).toUpperCase()}</span>
                          <span className="task-comments" title={`${task.commentCount} yorum`}>
                            <Icon name="comment" size={12} />
                            {task.commentCount}
                          </span>
                        </div>

                        <h4>{task.title}</h4>
                        {task.description && <div className="task-desc">{task.description}</div>}

                        <div className="task-chips">
                          <Badge className={priorityBadgeClass(task.priority)}>{priorityLabel(task.priority)}</Badge>
                          <Badge className={statusBadgeClass(task.status)}>{statusLabel(task.status)}</Badge>
                        </div>

                        <div className="task-footer">
                          <span className="task-assignee">
                            {task.assigneeName ? (
                              <>
                                <Avatar name={task.assigneeName} />
                                {task.assigneeName}
                              </>
                            ) : (
                              <span className="muted">Atanmadı</span>
                            )}
                          </span>
                        </div>

                        <div className="task-age" data-state={statusTone(task.status)}>
                          <span>{ageLabel(task.createdAt)}</span>
                          <span className="task-age-track" aria-hidden="true">
                            <i style={ageStyle(task.createdAt)} />
                          </span>
                        </div>
                      </article>
                    )
                  })}
                </section>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="member-list">
          <div className="member-row owner">
            <div className="member-info">
              <Avatar name={owner?.username ?? 'Sahip'} size="lg" />
              <div>
                <div className="member-name">{owner?.username ?? 'Sahip'}</div>
                <div className="member-email">{owner?.email ?? 'Proje sahibi'}</div>
              </div>
            </div>
            <div className="member-actions">
              <Badge className="badge-role-admin">Sahip</Badge>
            </div>
          </div>

          {project.members
            .filter((member) => member.userId !== project.ownerId)
            .map((member) => (
              <div className="member-row" key={member.userId}>
                <div className="member-info">
                  <Avatar name={member.username} size="lg" />
                  <div>
                    <div className="member-name">{member.username}</div>
                    <div className="member-email">{member.email}</div>
                  </div>
                </div>
                <div className="member-actions">
                  <Badge className={roleBadgeClass(member.role)}>{roleLabel(member.role)}</Badge>
                  {isAdmin && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => void handleRemoveMember(member.userId, member.username)}
                      type="button"
                    >
                      Çıkar
                    </button>
                  )}
                </div>
              </div>
            ))}

          {project.members.length <= 1 && (
            <div className="empty-state" style={{ marginTop: 12 }}>
              <span className="empty-icon">
                <Icon name="users" size={28} />
              </span>
              <h3>Henüz üye yok</h3>
              <p>E-posta adresiyle ekip üyesi davet et; kalıbı birlikte biçin.</p>
              {isAdmin && (
                <button className="btn btn-primary" onClick={() => setShowAddMember(true)} type="button">
                  <Icon name="plus" size={16} />
                  Üye Ekle
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {showCreateTask && (
        <Modal title="Yeni Görev" kicker="Panoya yeni dikiş" onClose={() => setShowCreateTask(false)}>
          <form onSubmit={handleCreateTask}>
            {taskFormError && (
              <div className="error-banner" role="alert">
                <Icon name="alert" size={16} />
                <span>{taskFormError}</span>
              </div>
            )}
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
              <select
                id="tpriority"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
              >
                <option value={TaskPriority.Low}>Düşük</option>
                <option value={TaskPriority.Medium}>Orta</option>
                <option value={TaskPriority.High}>Yüksek</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="tassignee">Atanan kişi</label>
              <select id="tassignee" value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)}>
                <option value="">Atanmadı</option>
                {project.members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.username}
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
        <Modal title="Üye Ekle" kicker="Ekibi büyüt" onClose={() => setShowAddMember(false)}>
          <form onSubmit={(e) => void handleAddMember(e)}>
            {memberFormError && (
              <div className="error-banner" role="alert">
                <Icon name="alert" size={16} />
                <span>{memberFormError}</span>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="memail">Kullanıcı e-postası</label>
              <input
                id="memail"
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="ornek@mail.com"
                autoFocus
                required
              />
              <div className="form-hint">Kişinin Nabız hesabındaki e-posta adresi.</div>
            </div>
            <div className="form-group">
              <label htmlFor="mrole">Rol</label>
              <select
                id="mrole"
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value as 'Admin' | 'Member')}
              >
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
