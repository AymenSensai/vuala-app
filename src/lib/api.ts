import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) config.headers.Authorization = `Bearer ${token}`

  const visitorId = getVisitorId()
  config.headers['X-Visitor-Id'] = visitorId

  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export function getVisitorId(): string {
  if (typeof window === 'undefined') return 'server'
  let id = localStorage.getItem('visitor_id')
  if (!id) {
    id = 'v_' + Math.random().toString(36).slice(2) + Date.now()
    localStorage.setItem('visitor_id', id)
  }
  return id
}

export default api
