'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import api from '@/lib/api'
import { ArrowLeft, ArrowRight, Check, ImageIcon, Loader2, UserCircle2 } from 'lucide-react'

const newsreaderStyle = "var(--font-newsreader), Georgia, serif"

type Step = 'profile' | 'plan'
const STEPS: { key: Step; label: string }[] = [
  { key: 'profile', label: 'Your page' },
  { key: 'plan', label: 'Your plan' },
]

const PLAN_FEATURES = {
  free: ['Your vuala.bio page', 'Up to 3 projects', '1 roadmap board', 'Unlimited wishlists & email capture'],
  pro: ['Everything in Free, plus', 'Unlimited projects', 'Unlimited roadmap boards', 'Export wishlists to CSV', 'Remove the Vuala badge'],
}

function StepDot({ index, active }: { index: number; active: 'done' | 'current' | 'upcoming' }) {
  return (
    <span
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-bold transition-colors"
      style={{
        background: active === 'upcoming' ? '#fff' : '#394be8',
        color: active === 'upcoming' ? '#aab2c0' : '#fff',
        border: active === 'upcoming' ? '1.5px solid #e4e7ec' : 'none',
        boxShadow: active !== 'upcoming' ? '0 4px 12px -3px rgba(57,75,232,.55)' : 'none',
      }}
    >
      {active === 'done' ? <Check className="h-4 w-4" /> : index + 1}
    </span>
  )
}

function OnboardingFlow() {
  const { user, loading, refresh } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const reenteringPlanStep = searchParams.get('step') === 'plan'
  const [step, setStep] = useState<Step>(reenteringPlanStep ? 'plan' : 'profile')

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const prefilled = useRef(false)

  const [plan, setPlan] = useState<'free' | 'pro'>(searchParams.get('plan') === 'free' ? 'free' : 'pro')
  const [cycle, setCycle] = useState<'monthly' | 'annual'>(searchParams.get('cycle') === 'monthly' ? 'monthly' : 'annual')
  const annual = cycle === 'annual'

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (prefilled.current || !user) return
    prefilled.current = true
    setDisplayName(user.storefront?.display_name || user.name || '')
    setBio(user.storefront?.bio || '')
    setAvatarUrl(user.storefront?.avatar_url || user.avatar_url || '')
  }, [user])

  const entryCheckDone = useRef(false)
  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (entryCheckDone.current) return
    entryCheckDone.current = true
    if (user.onboarding_completed_at && !reenteringPlanStep) router.replace('/dashboard')
  }, [user, loading, router, reenteringPlanStep])

  if (loading || !user || (user.onboarding_completed_at && !reenteringPlanStep)) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(180deg,#f5f7fd 0%,#fbfbfc 100%)' }}>
        <Loader2 className="h-6 w-6 animate-spin text-[#394BE8]" />
      </div>
    )
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    setAvatarError('')
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setAvatarUrl(res.data.url)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      setAvatarError(status === 422 ? 'That image is too large. Please use a file under 4MB.' : 'Could not upload that image. Please try again.')
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const goToStep = (next: Step) => {
    setError('')
    setStep(next)
  }

  const finishOnboarding = async () => {
    setSubmitting(true)
    setError('')
    try {
      await api.put('/storefront', { display_name: displayName, bio, avatar_url: avatarUrl })
      await api.post('/auth/onboarding/complete')
      await refresh()

      if (plan === 'pro') {
        const res = await api.post('/billing/checkout', { plan: 'pro', cycle, context: 'onboarding' })
        window.location.href = res.data.url
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step)

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-12" style={{ background: 'linear-gradient(180deg,#f5f7fd 0%,#fbfbfc 100%)' }}>
      <div className="mb-9 flex items-center gap-2">
        <img src="/logo.png" alt="Vuala" className="h-7 w-7 rounded-lg object-cover" />
        <span className="text-[19px] font-bold tracking-[-0.02em] text-[#171a21]">vuala</span>
      </div>

      <div className="mb-9 flex items-center">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center">
            {i > 0 && (
              <span className="mx-2.5 h-[2px] w-10 rounded-full" style={{ background: i <= stepIndex ? '#394BE8' : '#e4e7ec' }} />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <StepDot index={i} active={i < stepIndex ? 'done' : i === stepIndex ? 'current' : 'upcoming'} />
              <span className="text-[11px] font-semibold" style={{ color: i <= stepIndex ? '#394BE8' : '#aab2c0' }}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div
        className="w-full max-w-[520px] rounded-[22px] border border-[#ebedf1] bg-white p-10"
        style={{ boxShadow: '0 1px 2px rgba(20,24,40,.04), 0 30px 60px -28px rgba(20,24,40,.22)' }}
      >

        {step === 'profile' && (
          <>
            <h1 style={{ fontFamily: newsreaderStyle, fontSize: '28px', lineHeight: 1.2, letterSpacing: '-0.01em', fontWeight: 500, margin: '0', color: '#171a21' }}>
              Let&apos;s set up your page
            </h1>

            <div className="mt-7 flex items-center gap-4">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="group relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-full"
                style={{ background: '#eef1fd' }}
              >
                {uploadingAvatar ? (
                  <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-[#394BE8]" /></div>
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center"><UserCircle2 className="h-9 w-9 text-[#394BE8]" /></div>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <ImageIcon className="h-3.5 w-3.5 text-white" />
                  <span className="text-[8px] font-semibold uppercase tracking-wide text-white">Change</span>
                </div>
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              <div className="min-w-0 text-[13px] leading-relaxed text-[#8a93a3]">Click the circle to add a photo.<br />You can skip this for now.</div>
            </div>

            {avatarError && (
              <p className="mt-2.5 text-[12.5px] font-medium text-red-600">{avatarError}</p>
            )}

            <label className="mt-7 block">
              <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.04em] text-[#8b909d]">Your name</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Maya Chen"
                style={{ fontFamily: 'inherit' }}
                className="w-full rounded-[10px] border border-[#e0e5fb] bg-[#fbfcff] px-4 py-3 text-[14px] text-[#171a21] outline-none transition-colors focus:border-[#394BE8] focus:bg-white"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.04em] text-[#8b909d]">Bio</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Designer & indie maker building small useful tools."
                rows={3}
                maxLength={160}
                style={{ fontFamily: 'inherit' }}
                className="w-full resize-none rounded-[10px] border border-[#e0e5fb] bg-[#fbfcff] px-4 py-3 text-[14px] text-[#171a21] outline-none transition-colors focus:border-[#394BE8] focus:bg-white"
              />
            </label>

            <button
              type="button"
              onClick={() => goToStep('plan')}
              disabled={!displayName.trim()}
              className="mt-8 flex w-full items-center justify-center gap-1.5 rounded-[11px] py-3.5 text-[14.5px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: '#394be8', boxShadow: '0 1px 2px rgba(57,75,232,.25)' }}
              onMouseEnter={(e) => { if (displayName.trim()) e.currentTarget.style.background = '#2f3fcf' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#394be8' }}
            >
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </>
        )}

        {step === 'plan' && (
          <>
            <h1 style={{ fontFamily: newsreaderStyle, fontSize: '28px', lineHeight: 1.2, letterSpacing: '-0.01em', fontWeight: 500, margin: '0', color: '#171a21' }}>
              Choose your plan
            </h1>

            <div className="mt-5 flex items-center justify-center">
              <div className="inline-flex gap-[3px] rounded-[10px] border border-[#e4e7ec] bg-white p-1">
                <button
                  type="button"
                  onClick={() => setCycle('monthly')}
                  className="rounded-[7px] px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors"
                  style={{ background: !annual ? '#394BE8' : 'transparent', color: !annual ? '#fff' : '#5c6573' }}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setCycle('annual')}
                  className="rounded-[7px] px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors"
                  style={{ background: annual ? '#394BE8' : 'transparent', color: annual ? '#fff' : '#5c6573' }}
                >
                  Annual
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPlan('free')}
                className="rounded-[16px] p-5 text-left transition-all"
                style={{
                  border: plan === 'free' ? '1.5px solid #394be8' : '1px solid #ebedf1',
                  boxShadow: plan === 'free' ? '0 1px 2px rgba(20,24,40,.04),0 18px 36px -22px rgba(57,75,232,.35)' : 'none',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[#171a21]">Free</span>
                  {plan === 'free' && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: '#394be8' }}>
                      <Check className="h-3 w-3 text-white" />
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: newsreaderStyle, fontSize: '30px', fontWeight: 500, color: '#171a21', marginTop: '8px' }}>$0</div>
                <div className="mt-3 flex flex-col gap-1.5">
                  {PLAN_FEATURES.free.map((f) => (
                    <div key={f} className="flex items-start gap-1.5 text-[11.5px] leading-snug text-[#5c6573]">
                      <Check className="mt-[2px] h-3 w-3 flex-shrink-0 text-[#9aa2b1]" />
                      {f}
                    </div>
                  ))}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPlan('pro')}
                className="rounded-[16px] p-5 text-left transition-all"
                style={{
                  border: plan === 'pro' ? '1.5px solid #394be8' : '1px solid #ebedf1',
                  boxShadow: plan === 'pro' ? '0 1px 2px rgba(20,24,40,.04),0 18px 36px -22px rgba(57,75,232,.35)' : 'none',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[#2f3bb5]">Pro</span>
                  {plan === 'pro' && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: '#394be8' }}>
                      <Check className="h-3 w-3 text-white" />
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginTop: '8px' }}>
                  <span style={{ fontFamily: newsreaderStyle, fontSize: '30px', fontWeight: 500, color: '#171a21' }}>${annual ? '4' : '6'}</span>
                  <span className="text-[12px] text-[#9aa2b1]">/mo</span>
                </div>
                <div className="mt-3 flex flex-col gap-1.5">
                  {PLAN_FEATURES.pro.map((f) => (
                    <div key={f} className="flex items-start gap-1.5 text-[11.5px] leading-snug text-[#5c6573]">
                      <Check className="mt-[2px] h-3 w-3 flex-shrink-0 text-[#394BE8]" />
                      {f}
                    </div>
                  ))}
                </div>
              </button>
            </div>

            {error && (
              <div className="mt-5 rounded-[9px] border border-red-100 bg-red-50 px-3 py-2 text-[12.5px] font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="mt-7 flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToStep('profile')}
                disabled={submitting}
                className="flex items-center justify-center gap-1.5 rounded-[11px] border border-[#e4e7ec] px-4 py-3.5 text-[14.5px] font-semibold text-[#1b1f27] transition-colors hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={finishOnboarding}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[11px] py-3.5 text-[14.5px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: '#394be8', boxShadow: '0 1px 2px rgba(57,75,232,.25)' }}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : plan === 'pro' ? (
                  'Continue to payment'
                ) : (
                  'Create your free page'
                )}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingFlow />
    </Suspense>
  )
}
