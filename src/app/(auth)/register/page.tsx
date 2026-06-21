'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import api from '@/lib/api'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-1.7c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.8 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #ebedf1',
  borderRadius: '9px',
  outline: 'none',
  fontSize: '13.5px',
  padding: '10px 14px',
  background: '#f7f8fa',
  color: '#171a21',
  fontFamily: 'inherit',
  transition: 'border-color .15s, background .15s',
  boxSizing: 'border-box',
}

function RegisterForm() {
  const { register } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') // 'pro' | 'studio' | null
  const cycle = searchParams.get('cycle') === 'monthly' ? 'monthly' : 'annual'
  const [form, setForm] = useState({
    name: '', email: '', username: searchParams.get('username') ?? '', password: '', password_confirmation: ''
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setGeneralError('')
    setLoading(true)
    try {
      await register(form)
    } catch (err: unknown) {
      const response = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response
      if (response?.data?.errors) {
        setErrors(response.data.errors)
      } else if (response?.data?.message) {
        setGeneralError(response.data.message)
      } else {
        setGeneralError('Could not connect to the server. Make sure the API is running.')
      }
      setLoading(false)
      return
    }

    if (plan === 'pro' || plan === 'studio') {
      try {
        const res = await api.post('/billing/checkout', { plan, cycle })
        window.location.href = res.data.url
        return
      } catch {
        // Account was created fine; just send them to the dashboard and let
        // them upgrade from Settings instead of stranding them here.
      }
    }

    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "var(--font-plus-jakarta, 'Space Grotesk', sans-serif)" }}>
    <div style={{ width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,.06), 0 20px 56px rgba(0,0,0,.1)' }}>

      {/* ── Left panel ── */}
      <div style={{ background: '#fff', padding: '36px 52px', display: 'flex', flexDirection: 'column' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '32px' }}>
          <img src="/logo.png" alt="Vuala" style={{ width: '26px', height: '26px', borderRadius: '7px', objectFit: 'cover', display: 'block' }} />
          <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em', color: '#171a21' }}>vuala</span>
        </Link>

        {/* Heading */}
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171a21', margin: '0 0 4px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Complete your registration.
        </h1>
        <p style={{ fontSize: '13px', color: '#8a93a3', margin: '0 0 20px' }}>
          Fill in your details to complete the registration.
        </p>

        {/* Social buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[
            { label: 'Google', icon: <GoogleIcon />, provider: 'google' },
            { label: 'GitHub', icon: <GithubIcon />, provider: 'github' },
          ].map(({ label, icon, provider }) => (
            <button
              key={label}
              type="button"
              onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}/redirect`}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '9px 14px', border: '1px solid #e4e7ec', borderRadius: '9px', background: '#fff', fontSize: '13px', fontWeight: 600, color: '#1b1f27', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
              onMouseEnter={e => { const b = e.currentTarget; b.style.background = '#f0f2fe'; b.style.borderColor = '#c7cef8'; b.style.color = '#394be8' }}
              onMouseLeave={e => { const b = e.currentTarget; b.style.background = '#fff'; b.style.borderColor = '#e4e7ec'; b.style.color = '#1b1f27' }}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: '#eef0f3' }} />
          <span style={{ fontSize: '12px', color: '#aab2c0' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#eef0f3' }} />
        </div>

        {/* Error */}
        {generalError && (
          <div style={{ marginBottom: '12px', padding: '9px 12px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', fontSize: '13px', color: '#dc2626' }}>
            {generalError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          <div>
            <input type="text" required placeholder="Your full name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            {errors.name?.map(msg => <p key={msg} style={{ fontSize: '11px', color: '#dc2626', margin: '2px 0 0' }}>{msg}</p>)}
          </div>

          <div>
            <input type="email" required placeholder="your@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
            {errors.email?.map(msg => <p key={msg} style={{ fontSize: '11px', color: '#dc2626', margin: '2px 0 0' }}>{msg}</p>)}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ebedf1', borderRadius: '9px', background: '#f7f8fa', overflow: 'hidden' }}>
              <span style={{ fontSize: '13.5px', color: '#aab2c0', padding: '10px 4px 10px 14px', whiteSpace: 'nowrap' }}>vuala.dev/</span>
              <input type="text" required placeholder="yourhandle" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                style={{ ...inputStyle, border: 'none', borderRadius: 0, background: 'transparent', padding: '10px 14px 10px 0' }} />
            </div>
            {errors.username?.map(msg => <p key={msg} style={{ fontSize: '11px', color: '#dc2626', margin: '2px 0 0' }}>{msg}</p>)}
          </div>

          <div>
            <input type="password" required placeholder="Password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} />
            {errors.password?.map(msg => <p key={msg} style={{ fontSize: '11px', color: '#dc2626', margin: '2px 0 0' }}>{msg}</p>)}
          </div>

          <div>
            <input type="password" required placeholder="Password confirmation" value={form.password_confirmation}
              onChange={e => setForm({ ...form, password_confirmation: e.target.value })} style={inputStyle} />
            {errors.password_confirmation?.map(msg => <p key={msg} style={{ fontSize: '11px', color: '#dc2626', margin: '2px 0 0' }}>{msg}</p>)}
          </div>

          <button type="submit" disabled={loading}
            style={{ width: '100%', background: '#394be8', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1, letterSpacing: '-0.01em', transition: 'background .15s' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#2f3fcf' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#394be8' }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#8a93a3', marginTop: '16px' }}>
          Do you already have an account?{' '}
          <Link href="/login" style={{ color: '#171a21', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>

      {/* ── Right panel ── */}
      <div style={{ background: '#f0ede8', padding: '52px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '42px', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em', color: '#171a21', margin: '0 0 16px' }}>
          Your work, finally in one place.
        </h2>
        <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#5c6573', margin: 0 }}>
          Create your maker page, showcase what you&apos;ve shipped, and collect wishlists for what you&apos;re building next — so you always know what to build next.
        </p>
      </div>

    </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  )
}
