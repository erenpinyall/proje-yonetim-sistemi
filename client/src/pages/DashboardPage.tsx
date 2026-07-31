import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { ProjectDto } from '../types'
import { LoadingPage, PageHeader } from '../components/Layout'
import { Modal } from '../components/ui'
import { formatDate } from '../components/ui'

export default function DashboardPage() {
  const { username, userId } = useAuth()
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

  return (
    <>
      <PageHeader
        title={`Merhaba, ${username} 👋`}
        subtitle="Projelerine genel bakış"
        actions={
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Yeni Proje
          </button>
        }
      />

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-icon">📁</span>
          <div>
            <div className="stat-value">{projects.length}</div>
            <div className="stat-label">Proje</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div>
            <div className="stat-value">{totalTasks}</div>
            <div className="stat-label">Toplam Görev</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div>
            <div className="stat-value">{totalMembers}</div>
            <div className="stat-label">Ekip Üyesi</div>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>Henüz proje yok</h3>
          <p>İlk projeni oluşturarak başla.</p>
          <br />
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Yeni Proje
          </button>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="project-card">
              {userId && (
                <button
                  className="delete-btn"
                  title="Projeyi sil"
                  onClick={(e) => void handleDelete(e, project)}
                >
                  🗑
                </button>
              )}
              <h3>{project.name}</h3>
              <div className="desc">
                {project.description || <span style={{ opacity: 0.5 }}>Açıklama yok</span>}
              </div>
              <div className="meta">
                <span>📋 {project.taskCount} görev</span>
                <span>👥 {project.memberCount} üye</span>
                <span>🗓 {formatDate(project.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="Yeni Proje" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate}>
            {formError && <div className="error-banner">{formError}</div>}
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
