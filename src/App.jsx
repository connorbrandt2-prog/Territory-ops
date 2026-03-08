import React from 'react'
import { useAuth } from './context/AuthContext'
import Login from './components/auth/Login'
import Shell from './components/layout/Shell'

function Loading() {
  return (
    <div style={{ fontFamily: "'Palatino Linotype',serif", background: '#0d0d14', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 11, color: '#34a876', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Territory Ops</div>
    </div>
  )
}

export default function App() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <Loading />
  if (!user) return <Login />
  return <Shell user={user} onLogout={signOut} />
}
