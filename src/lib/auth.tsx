'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import api from './api'

interface User {
  id: string
  name: string
  email: string
  username: string
  avatar_url: string | null
  plan: 'free' | 'pro' | 'studio'
  plan_billing_cycle: 'monthly' | 'annual' | null
  plan_status: string | null
  storefront?: {
    id: string
    username: string
    display_name: string
    bio: string | null
    avatar_url: string | null
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  username: string
  password: string
  password_confirmation: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
  }

  const register = async (data: RegisterData) => {
    const res = await api.post('/auth/register', data)
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
  }

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {})
    localStorage.removeItem('token')
    setUser(null)
  }

  const refresh = async () => {
    const res = await api.get('/auth/me')
    setUser(res.data)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
