import { useEffect, useRef, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { getToken } from '../api/client'
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
  const eventsRef = useRef(events)
  eventsRef.current = events

  useEffect(() => {
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

    connection
      .start()
      .then(() => setConnected(true))
      .catch(() => setConnected(false))

    return () => {
      void connection.stop()
      connectionRef.current = null
    }
  }, [])

  useEffect(() => {
    const conn = connectionRef.current
    if (!conn || !projectId || conn.state !== signalR.HubConnectionState.Connected) return

    void conn.invoke('JoinProjectGroup', projectId).catch(() => {})

    return () => {
      if (conn.state === signalR.HubConnectionState.Connected) {
        void conn.invoke('LeaveProjectGroup', projectId).catch(() => {})
      }
    }
  }, [projectId, connected])

  return { connected }
}
