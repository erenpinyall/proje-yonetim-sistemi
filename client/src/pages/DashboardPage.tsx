import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { ProjectDto } from '../types'
import { LoadingPage, PageHeader } from '../components/Layout'
import { Icon, LiveCounter, Modal, formatDate } from '../components/ui'

export default function DashboardPage() {
  const { username } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState('')

  const loadProjects = useCallback(async () => {
    try {
      const res = await api.projects.list({ Page: '1', PageSize: '100' })
      setProjects(res.items)
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadProjects()
  }, [loadProjects])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setFormError('')
    setCreating(true)
    try {
      const created = await api.projects.create({
        name,
        description: description || null,
      })
      toast('Proje oluşturuldu', 'success')
      setShowCreate(false)
      setName('')
      setDescription('')
      navigate(`/projects/${created.id}`)
    } catch (err) {
      if (err instanceof ApiError) setFormError(err.message)
      else setFormError('Proje oluşturulamadı')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, project: ProjectDto) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm(`"${project.name}" projesini silmek istediğine emin misin?`)) return
    try {
      await api.projects.remove(project.id)
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
      toast('Proje silindi', 'success')
    } catch (err) {
      if (err instanceof ApiError) toast(err.message, 'error')
    }
  }

  if (loading) return <LoadingPage />

  const totalTasks = projects.reduce((sum, p) => sum + p.taskCount, 0)
  const totalMembers = projects.reduce((sum, p) => sum + p.memberCount, 0)

  const stats = [
    { label: 'Proje kalıbı', value: projects.length, foot: 'Aktif panolar', icon: 'folder' as const, tone: 'red' },
    { label: 'Toplam görev', value: totalTasks, foot: 'Tüm panolarda', icon: 'columns' as const, tone: 'tape' },
    { label: 'Ekip üyesi', value: totalMembers, foot: 'Projelere dağılmış', icon: 'users' as const, tone: 'green' },
  ]

  return (
    <>
      <PageHeader
        title={`Merhaba, ${username ?? 'ekip'}`}
        subtitle="Projelerine genel bakış. Panondaki kalıplar burada; bir projeye girip görevleri dikebilirsin."
        actions={
          <button className="btn btn-primary" onClick={() => setShowCreate(true)} type="button">
            <Icon name="plus" size={16} />
            Yeni Proje
          </button>
        }
      />

      <div className="page-subrule">
        <span>Proje kalıpları</span>
        <span className="dash" aria-hidden="true" />
        <span>
          {projects.length} kalıp · {totalTasks} görev
        </span>
      </div>

      <div className="stats-row">
        {stats.map((stat) => (
          <div className="stat-card" data-tone={stat.tone} key={stat.label}>
            <div className="stat-head">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-icon">
                <Icon name={stat.icon} size={17} />
              </span>
            </div>
            <div className="stat-value">
              <LiveCounter value={stat.value} />
            </div>
            <div className="stat-foot">{stat.foot}</div>
          </div>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">
            <Icon name="folder" size={30} />
          </span>
          <h3>Henüz proje yok</h3>
          <p>İlk kalıbını çıkar: bir proje oluştur, ekibini ekle, görevleri panoya dik.</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)} type="button">
            <Icon name="plus" size={16} />
            Yeni Proje
          </button>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project, index) => (
            <div
              className="project-card"
              key={project.id}
              style={{ '--i': index } as CSSProperties}
            >
              <Link
                to={`/projects/${project.id}`}
                className="project-card-hit"
                aria-label={`${project.name} projesini aç`}
              />
              <span className="notch notch-tl" aria-hidden="true" />
              <span className="notch notch-br" aria-hidden="true" />

              <div className="project-code">
                KALIP · {project.id.slice(0, 4).toUpperCase()}
              </div>
              <h3>{project.name}</h3>
              <div className="desc">
                {project.description || <span style={{ opacity: 0.6 }}>Açıklama yok</span>}
              </div>

              <div className="meta">
                <span>
                  <Icon name="columns" size={13} />
                  {project.taskCount} görev
                </span>
                <span>
                  <Icon name="users" size={13} />
                  {project.memberCount} üye
                </span>
                <span>
                  <Icon name="calendar" size={13} />
                  {formatDate(project.createdAt)}
                </span>
              </div>

              <button
                className="delete-btn"
                title="Projeyi sil"
                aria-label={`${project.name} projesini sil`}
                onClick={(e) => void handleDelete(e, project)}
                type="button"
              >
                <Icon name="trash" size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal
          title="Yeni Proje"
          kicker="Yeni kalıp"
          onClose={() => setShowCreate(false)}
        >
          <form onSubmit={handleCreate}>
            {formError && (
              <div className="error-banner" role="alert">
                <Icon name="alert" size={16} />
                <span>{formError}</span>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="pname">Proje adı</label>
              <input
                id="pname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Web Sitesi Yenileme"
                maxLength={100}
                autoFocus
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="pdesc">Açıklama</label>
              <textarea
                id="pdesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Proje hakkında kısa bilgi"
                rows={3}
                maxLength={500}
              />
              <div className="form-hint">Kalıbın kenarına not düşer gibi: ne, kimin için, ne zamana kadar?</div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>
                İptal
              </button>
              <button type="submit" className="btn btn-primary" disabled={creating || !name.trim()}>
                {creating ? <span className="spinner" /> : 'Oluştur'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
