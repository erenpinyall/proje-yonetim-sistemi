export const TaskItemStatus = {
  ToDo: 'ToDo',
  InProgress: 'InProgress',
  Done: 'Done',
} as const
export type TaskItemStatus = (typeof TaskItemStatus)[keyof typeof TaskItemStatus]

export const TaskPriority = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
} as const
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority]

export const ProjectRole = {
  Admin: 'Admin',
  Member: 'Member',
} as const
export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole]

export interface AuthResponse {
  token: string
  username: string
  email: string
  userId: string
}

export interface RegisterDto {
  username: string
  email: string
  password: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface ProjectDto {
  id: string
  name: string
  description: string | null
  createdAt: string
  memberCount: number
  taskCount: number
}

export interface ProjectMemberDto {
  userId: string
  username: string
  email: string
  role: ProjectRole
}

export interface ProjectDetailDto {
  id: string
  name: string
  description: string | null
  createdAt: string
  ownerId: string
  members: ProjectMemberDto[]
}

export interface CreateProjectDto {
  name: string
  description?: string | null
}

export interface AddMemberDto {
  email: string
  role: ProjectRole
}

export interface TaskItemDto {
  id: string
  title: string
  description: string | null
  status: TaskItemStatus
  priority: TaskPriority
  createdAt: string
  updatedAt: string
  projectId: string
  assigneeId: string | null
  assigneeName: string | null
  createdById: string
  createdByName: string
  commentCount: number
}

export interface CreateTaskDto {
  title: string
  description?: string | null
  priority: TaskPriority
  assigneeId?: string | null
}

export interface UpdateTaskDto {
  title?: string | null
  description?: string | null
  status?: TaskItemStatus | null
  priority?: TaskPriority | null
  assigneeId?: string | null
}

export interface CommentDto {
  id: string
  content: string
  createdAt: string
  userId: string
  username: string
}

export interface CreateCommentDto {
  content: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}
