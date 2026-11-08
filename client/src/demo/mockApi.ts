import { DEMO_MODE, DEMO_STORAGE_KEY, demoBus } from './bus'
import { createSeedState, SEED_VERSION } from './seed'
import type { DemoProject, DemoState, DemoUser } from './seed'
import { ProjectRole, TaskItemStatus, TaskPriority } from '../types'
import type {
  AddMemberDto,
  AuthResponse,
  CommentDto,
  CreateCommentDto,
  CreateProjectDto,
  CreateTaskDto,
  LoginDto,
  PagedResult,
  ProjectDetailDto,
  ProjectDto,
  ProjectMemberDto,
  RegisterDto,
  TaskItemDto,
  UpdateTaskDto,
} from '../types'

const COMMENT_LINES = [
  'Bunu ben de kontrol edeyim, akşam üstü dönerim.',
  'Görseli güncelledim; son hâline bakabilir misin?',
  'Bu maddeyi bugün kapatıyoruz, takvimi ona göre güncelledim.',
  'Müşteriden geri bildirim geldi: başlık daha net olmalı.',
  'Takvimde bir gün kaydı, bilgin olsun.',
  'Bu iş için iki alternatif hazırladım, hangisini seçelim?',
]

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function empty(status = 204) {
  return new Response(null, { status })
}

function fail(status: number, message: string) {
  return json({ message }, status)
}

function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState
      if (
        parsed.version === SEED_VERSION &&
        Array.isArray(parsed.users) &&
        Array.isArray(parsed.projects) &&
        Array.isArray(parsed.tasks) &&
        parsed.comments &&
        typeof parsed.comments === 'object'
      ) {
        return parsed
      }
    }
  } catch {
    // bozuk demo verisi varsa aşağıda yeniden tohumlanır
  }
  const seeded = createSeedState()
  saveState(seeded)
  return seeded
}

function saveState(state: DemoState) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state))
}

function readBody<T>(init?: RequestInit): T {
  if (!init?.body) return {} as T
  try {
    return JSON.parse(String(init.body)) as T
  } catch {
    return {} as T
  }
}

function readUserId(init?: RequestInit): string | null {
  const headers = new Headers(init?.headers)
  const token = headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (token?.startsWith('demo-token:')) return token.slice('demo-token:'.length)
  return localStorage.getItem('tt_userid')
}

function getUser(state: DemoState, init?: RequestInit): DemoUser | null {
  const userId = readUserId(init)
  if (!userId) return null
  return state.users.find((user) => user.id === userId) ?? null
}

function authResponse(user: DemoUser): AuthResponse {
  return {
    token: `demo-token:${user.id}`,
    username: user.username,
    email: user.email,
    userId: user.id,
  }
}

function publicTask(state: DemoState, task: TaskItemDto): TaskItemDto {
  return { ...task, commentCount: state.comments[task.id]?.length ?? 0 }
}

function projectDto(state: DemoState, project: DemoProject): ProjectDto {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt,
    memberCount: project.members.length,
    taskCount: state.tasks.filter((task) => task.projectId === project.id).length,
  }
}

function projectDetail(state: DemoState, project: DemoProject): ProjectDetailDto {
  const members: ProjectMemberDto[] = project.members.flatMap((member) => {
    const user = state.users.find((candidate) => candidate.id === member.userId)
    return user
      ? [{ userId: user.id, username: user.username, email: user.email, role: member.role }]
      : []
  })

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt,
    ownerId: project.ownerId,
    members,
  }
}

function isMember(project: DemoProject, user: DemoUser) {
  return project.members.some((member) => member.userId === user.id)
}

function isAdmin(project: DemoProject, user: DemoUser) {
  return (
    project.ownerId === user.id ||
    project.members.some((member) => member.userId === user.id && member.role === ProjectRole.Admin)
  )
}

function paging(searchParams: URLSearchParams) {
  return {
    page: Math.max(1, Number(searchParams.get('Page') ?? 1) || 1),
    pageSize: Math.max(1, Number(searchParams.get('PageSize') ?? 100) || 100),
  }
}

function paged<T>(items: T[], page: number, pageSize: number): PagedResult<T> {
  const totalCount = items.length
  const totalPages = Math.ceil(totalCount / pageSize)
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    totalCount,
    page,
    pageSize,
    totalPages,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
  }
}

function newId(prefix: string) {
  const raw =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${prefix}${raw.replace(/-/g, '').slice(0, 6)}`
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

async function handleApi(url: URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method ?? 'GET').toUpperCase()
  const path = url.pathname
  const state = loadState()

  if (path === '/api/auth/login' && method === 'POST') {
    const dto = readBody<LoginDto>(init)
    const email = dto.email?.trim().toLowerCase()
    const user = state.users.find(
      (candidate) => candidate.email.toLowerCase() === email && candidate.password === dto.password,
    )
    if (!user) return fail(401, 'E-posta veya şifre hatalı')
    return json(authResponse(user))
  }

  if (path === '/api/auth/register' && method === 'POST') {
    const dto = readBody<RegisterDto>(init)
    const username = dto.username?.trim()
    const email = dto.email?.trim().toLowerCase()
    const password = dto.password ?? ''

    if (!username || username.length < 3) return fail(400, 'Kullanıcı adı en az 3 karakter olmalı')
    if (username.length > 50) return fail(400, 'Kullanıcı adı en fazla 50 karakter olabilir')
    if (!email || !email.includes('@')) return fail(400, 'Geçerli bir e-posta gir')
    if (password.length < 6) return fail(400, 'Şifre en az 6 karakter olmalı')
    if (state.users.some((candidate) => candidate.email.toLowerCase() === email)) {
      return fail(409, 'Bu e-posta zaten kayıtlı')
    }

    const user: DemoUser = { id: newId('u'), username, email, password }
    state.users.push(user)
    const firstProject = state.projects[0]
    if (firstProject) firstProject.members.push({ userId: user.id, role: ProjectRole.Member })
    saveState(state)
    return json(authResponse(user))
  }

  const user = getUser(state, init)
  if (!user) return fail(401, 'Oturum süresi doldu')

  const parts = path
    .split('/')
    .filter(Boolean)
    .slice(1) // /api/...

  if (parts[0] === 'projects') {
    if (parts.length === 1) {
      if (method === 'GET') {
        const visible = state.projects
          .filter((project) => isMember(project, user))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        const { page, pageSize } = paging(url.searchParams)
        return json(paged(visible.map((project) => projectDto(state, project)), page, pageSize))
      }

      if (method === 'POST') {
        const dto = readBody<CreateProjectDto>(init)
        const name = dto.name?.trim()
        if (!name) return fail(400, 'Proje adı gerekli')
        if (name.length > 100) return fail(400, 'Proje adı en fazla 100 karakter olabilir')

        const project: DemoProject = {
          id: newId('p'),
          name,
          description: dto.description?.trim() || null,
          createdAt: new Date().toISOString(),
          ownerId: user.id,
          members: [{ userId: user.id, role: ProjectRole.Admin }],
        }
        state.projects.unshift(project)
        saveState(state)
        return json(projectDto(state, project), 201)
      }
    }

    const project = state.projects.find((candidate) => candidate.id === parts[1])
    if (!project) return fail(404, 'Proje bulunamadı')
    if (!isMember(project, user)) return fail(403, 'Bu projeye erişimin yok')

    if (parts.length === 2) {
      if (method === 'GET') return json(projectDetail(state, project))
      if (method === 'DELETE') {
        if (!isAdmin(project, user)) return fail(403, 'Projeyi silmek için yönetici olmalısın')
        state.projects = state.projects.filter((candidate) => candidate.id !== project.id)
        const removedTaskIds = new Set(
          state.tasks.filter((task) => task.projectId === project.id).map((task) => task.id),
        )
        state.tasks = state.tasks.filter((task) => task.projectId !== project.id)
        for (const taskId of removedTaskIds) delete state.comments[taskId]
        saveState(state)
        return empty()
      }
    }

    if (parts[2] === 'members') {
      if (!isAdmin(project, user)) return fail(403, 'Bu işlem için yönetici olmalısın')

      if (parts.length === 3 && method === 'POST') {
        const dto = readBody<AddMemberDto>(init)
        const email = dto.email?.trim().toLowerCase()
        if (!email) return fail(400, 'E-posta gerekli')
        const target = state.users.find((candidate) => candidate.email.toLowerCase() === email)
        if (!target) return fail(404, 'Bu e-posta ile kayıtlı kullanıcı bulunamadı')
        if (project.members.some((member) => member.userId === target.id)) {
          return fail(400, 'Bu kullanıcı zaten projede')
        }
        project.members.push({
          userId: target.id,
          role: dto.role === ProjectRole.Admin ? ProjectRole.Admin : ProjectRole.Member,
        })
        saveState(state)
        return empty()
      }

      if (parts.length === 4 && method === 'DELETE') {
        const memberId = parts[3]
        if (memberId === project.ownerId) return fail(400, 'Proje sahibi çıkarılamaz')
        const index = project.members.findIndex((member) => member.userId === memberId)
        if (index === -1) return fail(404, 'Üye bulunamadı')
        project.members.splice(index, 1)
        saveState(state)
        return empty()
      }
    }

    if (parts[2] === 'tasks') {
      if (parts.length === 3) {
        if (method === 'GET') {
          const items = state.tasks
            .filter((task) => task.projectId === project.id)
            .map((task) => publicTask(state, task))
          const { page, pageSize } = paging(url.searchParams)
          return json(paged(items, page, pageSize))
        }

        if (method === 'POST') {
          const dto = readBody<CreateTaskDto>(init)
          const title = dto.title?.trim()
          if (!title) return fail(400, 'Görev başlığı gerekli')
          if (title.length > 200) return fail(400, 'Başlık en fazla 200 karakter olabilir')

          const assigneeId =
            dto.assigneeId && project.members.some((member) => member.userId === dto.assigneeId)
              ? dto.assigneeId
              : null
          const assignee = state.users.find((candidate) => candidate.id === assigneeId)
          const now = new Date().toISOString()
          const task: TaskItemDto = {
            id: newId('t'),
            title,
            description: dto.description?.trim() || null,
            status: TaskItemStatus.ToDo,
            priority: dto.priority ?? TaskPriority.Medium,
            createdAt: now,
            updatedAt: now,
            projectId: project.id,
            assigneeId,
            assigneeName: assignee?.username ?? null,
            createdById: user.id,
            createdByName: user.username,
            commentCount: 0,
          }
          state.tasks.unshift(task)
          saveState(state)
          return json(publicTask(state, task), 201)
        }
      }

      if (parts.length === 4) {
        const task = state.tasks.find(
          (candidate) => candidate.id === parts[3] && candidate.projectId === project.id,
        )
        if (!task) return fail(404, 'Görev bulunamadı')

        if (method === 'GET') return json(publicTask(state, task))

        if (method === 'PATCH') {
          const dto = readBody<UpdateTaskDto>(init)
          if (dto.title != null) {
            const title = dto.title.trim()
            if (!title) return fail(400, 'Başlık boş olamaz')
            if (title.length > 200) return fail(400, 'Başlık en fazla 200 karakter olabilir')
            task.title = title
          }
          if (dto.description !== undefined) task.description = dto.description?.trim() || null
          if (dto.status != null) task.status = dto.status
          if (dto.priority != null) task.priority = dto.priority
          if (dto.assigneeId !== undefined) {
            if (dto.assigneeId && !project.members.some((member) => member.userId === dto.assigneeId)) {
              return fail(400, 'Atanan kişi proje üyesi değil')
            }
            const assignee = state.users.find((candidate) => candidate.id === dto.assigneeId)
            task.assigneeId = dto.assigneeId
            task.assigneeName = assignee?.username ?? null
          }
          task.updatedAt = new Date().toISOString()
          saveState(state)
          return json(publicTask(state, task))
        }

        if (method === 'DELETE') {
          state.tasks = state.tasks.filter((candidate) => candidate.id !== task.id)
          delete state.comments[task.id]
          saveState(state)
          return empty()
        }
      }
    }
  }

  if (parts[0] === 'tasks') {
    const task = state.tasks.find((candidate) => candidate.id === parts[1])
    if (!task) return fail(404, 'Görev bulunamadı')
    const project = state.projects.find((candidate) => candidate.id === task.projectId)
    if (!project || !isMember(project, user)) return fail(403, 'Bu göreve erişimin yok')

    if (parts[2] === 'comments') {
      if (parts.length === 3) {
        if (method === 'GET') {
          const items = [...(state.comments[task.id] ?? [])].sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt),
          )
          const { page, pageSize } = paging(url.searchParams)
          return json(paged(items, page, pageSize))
        }

        if (method === 'POST') {
          const dto = readBody<CreateCommentDto>(init)
          const content = dto.content?.trim()
          if (!content) return fail(400, 'Yorum boş olamaz')
          if (content.length > 2000) return fail(400, 'Yorum en fazla 2000 karakter olabilir')
          const comment: CommentDto = {
            id: newId('c'),
            content,
            createdAt: new Date().toISOString(),
            userId: user.id,
            username: user.username,
          }
          state.comments[task.id] = [comment, ...(state.comments[task.id] ?? [])]
          task.commentCount = state.comments[task.id].length
          saveState(state)
          return json(comment, 201)
        }
      }

      if (parts.length === 4 && method === 'DELETE') {
        const commentId = parts[3]
        const list = state.comments[task.id] ?? []
        const comment = list.find((candidate) => candidate.id === commentId)
        if (!comment) return fail(404, 'Yorum bulunamadı')
        if (comment.userId !== user.id) return fail(403, 'Sadece kendi yorumunu silebilirsin')
        state.comments[task.id] = list.filter((candidate) => candidate.id !== commentId)
        task.commentCount = state.comments[task.id].length
        saveState(state)
        return empty()
      }
    }
  }

  return fail(404, 'İşlem bulunamadı')
}

let installed = false
let liveTimer: number | undefined
let liveTick = 0

function startLiveSimulation() {
  if (liveTimer !== undefined) return

  const run = () => {
    if (document.hidden || document.querySelector('.modal')) return
    const projectId = demoBus.getActiveProject()
    if (!projectId) return

    const state = loadState()
    const project = state.projects.find((candidate) => candidate.id === projectId)
    if (!project) return
    const projectTasks = state.tasks.filter((task) => task.projectId === projectId)
    if (!projectTasks.length) return

    liveTick += 1

    if (liveTick % 3 === 0) {
      const task = pick(projectTasks)
      const memberIds = new Set(project.members.map((member) => member.userId))
      const currentUserId = localStorage.getItem('tt_userid')
      const commenters = state.users.filter(
        (user) => user.id !== currentUserId && memberIds.has(user.id),
      )
      if (!commenters.length) return
      const author = pick(commenters)
      const comment: CommentDto = {
        id: newId('c'),
        content: pick(COMMENT_LINES),
        createdAt: new Date().toISOString(),
        userId: author.id,
        username: author.username,
      }
      state.comments[task.id] = [comment, ...(state.comments[task.id] ?? [])]
      task.commentCount = state.comments[task.id].length
      task.updatedAt = comment.createdAt
      saveState(state)
      demoBus.emit('NewComment', comment)
      return
    }

    const task = pick(projectTasks)
    task.status =
      task.status === TaskItemStatus.ToDo
        ? TaskItemStatus.InProgress
        : task.status === TaskItemStatus.InProgress
          ? TaskItemStatus.Done
          : TaskItemStatus.ToDo
    task.updatedAt = new Date().toISOString()
    saveState(state)
    demoBus.emit('TaskUpdated', publicTask(state, task))
  }

  window.setTimeout(run, 5_000)
  liveTimer = window.setInterval(run, 14_000)
}

export function installDemoApi() {
  if (!DEMO_MODE || installed) return
  installed = true

  const originalFetch = window.fetch.bind(window)
  const demoFetch: typeof window.fetch = async (input, init) => {
    const rawUrl =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    const url = new URL(rawUrl, window.location.origin)
    if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/')) {
      return originalFetch(input, init)
    }

    try {
      return await handleApi(url, init)
    } catch (error) {
      console.error('Nabız demo API hatası', error)
      return fail(500, 'Demo verisi okunamadı')
    }
  }

  window.fetch = demoFetch
  startLiveSimulation()
}
