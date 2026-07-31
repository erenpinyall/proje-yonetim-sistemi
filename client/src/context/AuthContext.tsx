import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, getToken, setToken, clearToken } from '../api/client'
import type { LoginDto, RegisterDto } from '../types'

interface AuthContextValue {
  token: string | null
  username: string | null
  email: string | null
  userId: string | null
  isAuthenticated: boolean
  login: (dto: LoginDto) => Promise<void>
  register: (dto: RegisterDto) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('tt_username'))
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem('tt_email'))
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('tt_userid'))

  const applyAuth = useCallback((res: { token: string; username: string; email: string; userId: string }) => {
    setToken(res.token)
    localStorage.setItem('tt_username', res.username)
    localStorage.setItem('tt_email', res.email)
    localStorage.setItem('tt_userid', res.userId)
    setUsername(res.username)
    setEmail(res.email)
    setUserId(res.userId)
    setTokenState(res.token)
  }, [])

  const login = useCallback(
    async (dto: LoginDto) => {
      const res = await api.auth.login(dto)
      applyAuth(res)
    },
    [applyAuth],
  )

  const register = useCallback(
    async (dto: RegisterDto) => {
      const res = await api.auth.register(dto)
      applyAuth(res)
    },
    [applyAuth],
  )

  const logout = useCallback(() => {
    clearToken()
    localStorage.removeItem('tt_username')
    localStorage.removeItem('tt_email')
    localStorage.removeItem('tt_userid')
    setTokenState(null)
    setUsername(null)
    setEmail(null)
    setUserId(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      username,
      email,
      userId,
      isAuthenticated: !!token,
      login,
      register,
      logout,
    }),
    [token, username, email, userId, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
