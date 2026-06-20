'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function OAuthCallbackHandler() {
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

  return null
}

export default function OAuthCallbackPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', color: '#8a93a3', fontSize: '14px' }}>
      Signing you in…
      <Suspense fallback={null}>
        <OAuthCallbackHandler />
      </Suspense>
    </div>
  )
}
