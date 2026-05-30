import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  if (loading) return <div className="flex-center" style={{ minHeight: '100vh', fontSize: '1.5rem' }}>💸</div>
  return currentUser ? children : <Navigate to="/login" replace />
}
