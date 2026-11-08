import type { CommentDto, TaskItemDto } from '../types'

/** Demo build'i `vite build --mode demo` ile üretilir. */
export const DEMO_MODE = import.meta.env.MODE === 'demo'
export const DEMO_STORAGE_KEY = 'nabiz_demo_v1'
export const DEMO_EMAIL = 'eren@demo.nabiz.app'
export const DEMO_PASSWORD = 'demo1234'

interface DemoEvents {
  TaskCreated: TaskItemDto
  TaskUpdated: TaskItemDto
  TaskDeleted: string
  NewComment: CommentDto
}

type DemoListener<K extends keyof DemoEvents> = (payload: DemoEvents[K]) => void

const listeners = new Map<keyof DemoEvents, Set<(payload: never) => void>>()
let activeProjectId: string | null = null

/**
 * SignalR'ın demo karşılığı. Demo modunda sunucu yok; aynı olay adlarını
 * tarayıcı içinde yayınlayarak canlı pano hissini koruyoruz.
 */
export const demoBus = {
  on<K extends keyof DemoEvents>(event: K, listener: DemoListener<K>) {
    let set = listeners.get(event) as Set<DemoListener<K>> | undefined
    if (!set) {
      set = new Set<DemoListener<K>>()
      listeners.set(event, set as Set<(payload: never) => void>)
    }
    set.add(listener)
    return () => {
      set?.delete(listener)
    }
  },

  emit<K extends keyof DemoEvents>(event: K, payload: DemoEvents[K]) {
    const set = listeners.get(event) as Set<DemoListener<K>> | undefined
    set?.forEach((listener) => listener(payload))
  },

  setActiveProject(projectId: string | null) {
    activeProjectId = projectId
  },

  getActiveProject() {
    return activeProjectId
  },
}
