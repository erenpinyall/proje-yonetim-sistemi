import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  ProjectDto,
  ProjectDetailDto,
  CreateProjectDto,
  AddMemberDto,
  TaskItemDto,
  CreateTaskDto,
  UpdateTaskDto,
  CommentDto,
  CreateCommentDto,
  PagedResult,
} from '../types'

const TOKEN_KEY = 'tt_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`/api${path}`, { ...options, headers })

  if (res.status === 401 && token) {
    clearToken()
    window.location.href = '/login'
    throw new ApiError(401, 'Oturum süresi doldu')
  }

  if (!res.ok) {
    let message = 'Bir hata oluştu'
    try {
      const data = await res.json()
      if (typeof data === 'object' && data !== null) {
        const err = data as { message?: string; errors?: Record<string, string[]> }
        if (err.message) message = err.message
        else if (err.errors) {
          const first = Object.values(err.errors)[0]
          if (first && first.length) message = first[0]
        }
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  auth: {
    register: (dto: RegisterDto) =>
      request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(dto) }),
    login: (dto: LoginDto) =>
      request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(dto) }),
  },
  projects: {
    list: (params = {}) => {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null) as [string, string][],
      ).toString()
      return request<PagedResult<ProjectDto>>(`/projects?${qs}`)
    },
    get: (id: string) => request<ProjectDetailDto>(`/projects/${id}`),
    create: (dto: CreateProjectDto) =>
      request<ProjectDto>('/projects', { method: 'POST', body: JSON.stringify(dto) }),
    addMember: (projectId: string, dto: AddMemberDto) =>
      request(`/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify(dto) }),
    removeMember: (projectId: string, memberId: string) =>
      request(`/projects/${projectId}/members/${memberId}`, { method: 'DELETE' }),
    remove: (id: string) => request(`/projects/${id}`, { method: 'DELETE' }),
  },
  tasks: {
    list: (projectId: string, params = {}) => {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null) as [string, string][],
      ).toString()
      return request<PagedResult<TaskItemDto>>(`/projects/${projectId}/tasks?${qs}`)
    },
    get: (projectId: string, taskId: string) =>
      request<TaskItemDto>(`/projects/${projectId}/tasks/${taskId}`),
    create: (projectId: string, dto: CreateTaskDto) =>
      request<TaskItemDto>(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(dto) }),
    update: (projectId: string, taskId: string, dto: UpdateTaskDto) =>
      request<TaskItemDto>(`/projects/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      }),
    remove: (projectId: string, taskId: string) =>
      request(`/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' }),
  },
  comments: {
    list: (taskId: string) => {
      const qs = new URLSearchParams({ Page: '1', PageSize: '100' }).toString()
      return request<PagedResult<CommentDto>>(`/tasks/${taskId}/comments?${qs}`)
    },
    create: (taskId: string, dto: CreateCommentDto) =>
      request<CommentDto>(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify(dto) }),
    remove: (taskId: string, commentId: string) =>
      request(`/tasks/${taskId}/comments/${commentId}`, { method: 'DELETE' }),
  },
}
