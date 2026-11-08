import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { Layout, LoadingPage } from './components/Layout'
import { DEMO_EMAIL, DEMO_MODE, DEMO_PASSWORD } from './demo/bus'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProjectPage from './pages/ProjectPage'
import { ErrorBoundary } from './components/ErrorBoundary'

function Protected({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

function RootRedirect() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to="/" replace />
}

function DemoEntry() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!DEMO_MODE) {
      navigate('/login', { replace: true })
      return
    }
    if (isAuthenticated) {
      navigate('/', { replace: true })
      return
    }

    let active = true
    login({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
      .then(() => {
        if (active) navigate('/', { replace: true })
      })
      .catch(() => {
        if (active) setFailed(true)
      })

    return () => {
      active = false
    }
  }, [isAuthenticated, login, navigate])

  if (failed) return <Navigate to="/login" replace />
  return <LoadingPage label="Demo panosu hazırlanıyor" />
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/demo" element={<DemoEntry />} />
              <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
              <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
              <Route path="/" element={<Protected><DashboardPage /></Protected>} />
              <Route path="/projects/:id" element={<Protected><ProjectPage /></Protected>} />
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
