import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Banks from './pages/Banks'
import Expenses from './pages/Expenses'
import Transfers from './pages/Transfers'
import Goals from './pages/Goals'
import EMI from './pages/EMI'
import SIP from './pages/SIP'
import Notes from './pages/Notes'
import Analytics from './pages/Analytics'
import More from './pages/More'

const SIDEBAR_WIDTH = '220px'

const AppLayout = ({ children }) => {
  const { currentUser } = useAuth()
  if (!currentUser) return children
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar — hidden on mobile via CSS */}
      <div className="sidebar-desktop">
        <Sidebar />
      </div>
      {/* Main content — no left margin on mobile */}
      <div className="main-content">
        <Topbar />
        <main className="main-inner">
          <div className="fade-in">{children}</div>
        </main>
      </div>
      {/* Bottom nav — hidden on desktop via CSS */}
      <BottomNav />
    </div>
  )
}

const AppRoutes = () => {
  const { currentUser } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={currentUser ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/banks" element={<ProtectedRoute><AppLayout><Banks /></AppLayout></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><AppLayout><Expenses /></AppLayout></ProtectedRoute>} />
      <Route path="/transfers" element={<ProtectedRoute><AppLayout><Transfers /></AppLayout></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><AppLayout><Goals /></AppLayout></ProtectedRoute>} />
      <Route path="/emi" element={<ProtectedRoute><AppLayout><EMI /></AppLayout></ProtectedRoute>} />
      <Route path="/sip" element={<ProtectedRoute><AppLayout><SIP /></AppLayout></ProtectedRoute>} />
      <Route path="/notes" element={<ProtectedRoute><AppLayout><Notes /></AppLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
      <Route path="/more" element={<ProtectedRoute><AppLayout><More /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}
