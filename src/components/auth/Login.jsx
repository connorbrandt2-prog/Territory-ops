import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'

const S = {
  root: { fontFamily: "'Palatino Linotype',serif", background: '#0d0d14', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 },
  brand: { textAlign: 'center', marginBottom: 36 },
  brandName: { fontSize: 11, color: '#34a876', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 },
  brandSub: { fontSize: 12, color: '#333', letterSpacing: '1px' },
  card: { width: '100%', maxWidth: 340, background: '#111119', border: '1px solid #1e1e2e', borderRadius: 18, padding: '28px 24px' },
  title: { fontSize: 15, fontWeight: 700, color: '#ddd8cc', marginBottom: 6, textAlign: 'center' },
  sub: { fontSize: 11, color: '#444', textAlign: 'center', marginBottom: 24, letterSpacing: '0.3px' },
  label: { fontSize: 9, letterSpacing: '1.5px', color: '#555', textTransform: 'uppercase', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', background: '#0d0d14', border: '1px solid #2a2a3e', borderRadius: 8, color: '#ddd8cc', fontFamily: "'Palatino Linotype',serif", fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 14 },
  btn: { width: '100%', padding: '11px 0', background: '#34a876', border: 'none', borderRadius: 8, color: '#0d0d14', fontFamily: "'Palatino Linotype',serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px' },
  googleBtn: { width: '100%', padding: '11px 0', background: 'transparent', border: '1px solid #2a2a3e', borderRadius: 8, color: '#ddd8cc', fontFamily: "'Palatino Linotype',serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  divider: { display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' },
  divLine: { flex: 1, height: 1, background: '#1e1e2e' },
  divText: { fontSize: 10, color: '#333', letterSpacing: '1px' },
  toggle: { textAlign: 'center', marginTop: 18, fontSize: 11, color: '#444' },
  toggleLink: { color: '#34a876', cursor: 'pointer', fontWeight: 700, textDecoration: 'none', marginLeft: 4 },
  err: { background: '#2a0a0f', border: '1px solid #5a1020', borderRadius: 7, padding: '8px 12px', fontSize: 11, color: '#e05060', marginBottom: 14 },
  msg: { background: '#0a2a1a', border: '1px solid #1a5a30', borderRadius: 7, padding: '8px 12px', fontSize: 11, color: '#34a876', marginBottom: 14 },
}

export default function Login() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  const reset = () => { setErr(''); setMsg('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    reset()
    setLoading(true)
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name.trim() || email.split('@')[0] } },
      })
      if (error) setErr(error.message)
      else setMsg('Account created! Check your email to confirm, then sign in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setErr(error.message)
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    reset()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) setErr(error.message)
  }

  return (
    <div style={S.root}>
      <div style={S.brand}>
        <div style={S.brandName}>Territory Ops</div>
        <div style={S.brandSub}>Orthopedic and Spine</div>
      </div>

      <div style={S.card}>
        <div style={S.title}>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</div>
        <div style={S.sub}>{mode === 'signin' ? 'Sign in to your account' : 'Join Territory Ops'}</div>

        {err && <div style={S.err}>{err}</div>}
        {msg && <div style={S.msg}>{msg}</div>}

        <button style={S.googleBtn} onClick={handleGoogle} type="button">
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.8 13.2l7.8 6C12.4 13 17.8 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 6.9-10 6.9-17z"/>
            <path fill="#FBBC05" d="M10.6 28.8A14.5 14.5 0 0 1 9.5 24c0-1.7.3-3.3.8-4.8l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.5 10.8l8.1-6z"/>
            <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.4-9.9l-8.1 6C6.7 42.6 14.7 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div style={S.divider}>
          <div style={S.divLine} />
          <span style={S.divText}>OR</span>
          <div style={S.divLine} />
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div>
              <div style={S.label}>Full Name</div>
              <input
                style={S.input} type="text" value={name} placeholder="Connor Brandt"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div style={S.label}>Email</div>
          <input
            style={S.input} type="email" value={email} placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)} required
          />
          <div style={S.label}>Password</div>
          <input
            style={{ ...S.input, marginBottom: 20 }} type="password" value={password}
            placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'}
            onChange={(e) => setPassword(e.target.value)} required
          />
          <button style={{ ...S.btn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={S.toggle}>
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          <span
            style={S.toggleLink}
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); reset() }}
          >
            {mode === 'signin' ? ' Sign up' : ' Sign in'}
          </span>
        </div>
      </div>
    </div>
  )
}
