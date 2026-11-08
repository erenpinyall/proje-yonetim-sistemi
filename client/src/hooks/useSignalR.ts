import { useEffect, useRef, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { getToken } from '../api/client'
import { DEMO_MODE, demoBus } from '../demo/bus'
import type { TaskItemDto, CommentDto } from '../types'

interface HubEvents {
  onTaskCreated?: (task: TaskItemDto) => void
  onTaskUpdated?: (task: TaskItemDto) => void
  onTaskDeleted?: (taskId: string) => void
  onNewComment?: (comment: CommentDto) => void
}

export function useSignalR(projectId?: string, events?: HubEvents) {
  const [connected, setConnected] = useState(false)
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const projectIdRef = useRef(projectId)
  projectIdRef.current = projectId
  const eventsRef = useRef(events)
  eventsRef.current = events

  useEffect(() => {
    if (DEMO_MODE) {
      const unsubscribers = [
        demoBus.on('TaskCreated', (task) => eventsRef.current?.onTaskCreated?.(task)),
        demoBus.on('TaskUpdated', (task) => eventsRef.current?.onTaskUpdated?.(task)),
        demoBus.on('TaskDeleted', (taskId) => eventsRef.current?.onTaskDeleted?.(taskId)),
        demoBus.on('NewComment', (comment) => eventsRef.current?.onNewComment?.(comment)),
      ]
      setConnected(true)
      return () => {
        unsubscribers.forEach((unsubscribe) => unsubscribe())
      }
    }

    let disposed = false

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/tasks', {
        accessTokenFactory: () => getToken() ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    connection.on('TaskCreated', (task: TaskItemDto) => eventsRef.current?.onTaskCreated?.(task))
    connection.on('TaskUpdated', (task: TaskItemDto) => eventsRef.current?.onTaskUpdated?.(task))
    connection.on('TaskDeleted', (taskId: string) => eventsRef.current?.onTaskDeleted?.(taskId))
    connection.on('NewComment', (comment: CommentDto) => eventsRef.current?.onNewComment?.(comment))

    connectionRef.current = connection

    const joinProjectGroup = async () => {
      const projectId = projectIdRef.current
      if (!projectId) return
      try {
        await connection.invoke('JoinProjectGroup', projectId)
      } catch {
        // bağlantı henüz hazır değilse yeniden bağlanmada tekrar denenir
      }
    }

    connection.onreconnecting(() => {
      if (!disposed) setConnected(false)
    })

    connection.onreconnected(() => {
      if (disposed) return
      setConnected(true)
      void joinProjectGroup()
    })

    connection.onclose(() => {
      if (!disposed) setConnected(false)
    })

    // StrictMode ilk effect'i hemen temizliyor; negotiate sırasında stop()
    // çağırmak "connection was stopped during negotiation" hatası üretiyordu.
    // Bu yüzden durdurmayı start() sonuçlandıktan sonraya erteliyoruz.
    const started = connection
      .start()
      .then(() => {
        if (disposed) return
        setConnected(true)
        return joinProjectGroup()
      })
      .catch(() => {
        if (!disposed) setConnected(false)
      })

    return () => {
      disposed = true
      if (connectionRef.current === connection) connectionRef.current = null
      void started.finally(() => {
        void connection.stop()
      })
    }
  }, [])

  useEffect(() => {
    if (!DEMO_MODE || !projectId) return
    demoBus.setActiveProject(projectId)
    return () => demoBus.setActiveProject(null)
  }, [projectId])

  return { connected }
}
