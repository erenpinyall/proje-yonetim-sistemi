import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import type { ReactNode } from 'react'
import { Layout } from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProjectPage from './pages/ProjectPage'

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

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
            <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
            <Route path="/" element={<Protected><DashboardPage /></Protected>} />
            <Route path="/projects/:id" element={<Protected><ProjectPage /></Protected>} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
