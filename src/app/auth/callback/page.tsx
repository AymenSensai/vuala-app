'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    const error = params.get('error')

    if (error || !token) {
      router.replace('/login?error=oauth_failed')
      return
    }

    localStorage.setItem('token', token)
    router.replace('/dashboard')
  }, [params, router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', color: '#8a93a3', fontSize: '14px' }}>
      Signing you in…
    </div>
  )
}
