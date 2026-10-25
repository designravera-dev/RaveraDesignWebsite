import React from 'react'
import { useAuth } from './AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    console.log('[ProtectedRoute] Still loading auth state...')
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#381F2E',
        color: 'white',
        fontFamily: 'Jost, sans-serif'
      }}>
        <p>Carregando...</p>
      </div>
    )
  }

  if (!user) {
    console.warn('[ProtectedRoute] No user found. Redirecting to /admin/login...')
    // Use window.location.replace para evitar loops de histórico
    window.location.replace('/admin/login')
    return null
  }

  console.log('[ProtectedRoute] Access granted for user:', user?.email || 'Unknown user')
  return <>{children}</>
}
