'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteFooter, SiteHeader } from '@/components/SiteChrome'

// ─── SVG icon primitives ──────────────────────────────────────────────────────

function Check({ color = '#394be8', size = 15 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? '#fff' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1l1.7 1.7L12 21.5l7.1-7.1 1.7-1.7a5 5 0 0 0 0-7.1z" />
    </svg>
  )
}


function PlusMinusIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform .2s' }}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-1.7c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.8 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 1.5h3.7l-8 9.1 9.4 12.4h-7.4l-5.8-7.6-6.6 7.6H.5l8.5-9.8L0 1.5h7.6l5.2 6.9 6.1-6.9zm-1.3 19.7h2L6.5 3.6H4.4l13.2 17.6z" />
    </svg>
  )
}

// ─── Dashboard chrome (icon rail + header — copied 1:1 from dashboard/layout.tsx) ──

function DashOverviewIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M15.024 22C16.2771 22 17.3524 21.9342 18.2508 21.7345C19.1607 21.5323 19.9494 21.1798 20.5646 20.5646C21.1798 19.9494 21.5323 19.1607 21.7345 18.2508C21.9342 17.3524 22 16.2771 22 15.024V12C22 10.8954 21.1046 10 20 10H12C10.8954 10 10 10.8954 10 12V20C10 21.1046 10.8954 22 12 22H15.024Z" fill="currentColor" />
      <path d="M2 15.024C2 16.2771 2.06584 17.3524 2.26552 18.2508C2.46772 19.1607 2.82021 19.9494 3.43543 20.5646C4.05065 21.1798 4.83933 21.5323 5.74915 21.7345C5.83628 21.7538 5.92385 21.772 6.01178 21.789C7.09629 21.9985 8 21.0806 8 19.976L8 12C8 10.8954 7.10457 10 6 10H4C2.89543 10 2 10.8954 2 12V15.024Z" fill="currentColor" />
      <path d="M8.97597 2C7.72284 2 6.64759 2.06584 5.74912 2.26552C4.8393 2.46772 4.05062 2.82021 3.4354 3.43543C2.82018 4.05065 2.46769 4.83933 2.26549 5.74915C2.24889 5.82386 2.23327 5.89881 2.2186 5.97398C2.00422 7.07267 2.9389 8 4.0583 8H19.976C21.0806 8 21.9985 7.09629 21.789 6.01178C21.772 5.92385 21.7538 5.83628 21.7345 5.74915C21.5322 4.83933 21.1798 4.05065 20.5645 3.43543C19.9493 2.82021 19.1606 2.46772 18.2508 2.26552C17.3523 2.06584 16.2771 2 15.024 2H8.97597Z" fill="currentColor" />
    </svg>
  )
}

function DashPageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" className={className}>
      <path d="M465.4 192L431.1 144L209 144L174.7 192L465.4 192zM96 212.5C96 199.2 100.2 186.2 107.9 175.3L156.9 106.8C168.9 90 188.3 80 208.9 80L431 80C451.7 80 471.1 90 483.1 106.8L532 175.3C539.8 186.2 543.9 199.2 543.9 212.5L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 212.5z" />
    </svg>
  )
}

function DashWishlistsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" className={className}>
      <path d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z" />
    </svg>
  )
}

function DashInboxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" className={className}>
      <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M12 10.75C12.1989 10.75 12.3897 10.671 12.5303 10.5303L15.5303 7.53033C15.8232 7.23744 15.8232 6.76256 15.5303 6.46967C15.2374 6.17678 14.7626 6.17678 14.4697 6.46967L12.75 8.18934V2C12.75 1.58579 12.4142 1.25 12 1.25C11.5858 1.25 11.25 1.58579 11.25 2V8.18934L9.53033 6.46967C9.23744 6.17678 8.76256 6.17678 8.46967 6.46967C8.17678 6.76256 8.17678 7.23744 8.46967 7.53033L11.4697 10.5303C11.6103 10.671 11.8011 10.75 12 10.75Z" />
      <path fill="currentColor" d="M3.46447 20.5355C4.92893 22 7.28595 22 12 22C16.714 22 19.0711 22 20.5355 20.5355C21.8063 19.2647 21.9744 17.3219 21.9966 13.75H18.8397C17.8659 13.75 17.6113 13.766 17.3975 13.8644C17.1838 13.9627 17.0059 14.1456 16.3722 14.8849L15.6794 15.6933C15.1773 16.2803 14.7796 16.7453 14.2292 16.9984C13.6789 17.2515 13.067 17.2509 12.2945 17.2501H11.7055C10.933 17.2509 10.3211 17.2515 9.77076 16.9984C9.22038 16.7453 8.82271 16.2803 8.32058 15.6933L7.62784 14.8849C6.9941 14.1456 6.81622 13.9627 6.60245 13.8644C6.38869 13.766 6.13407 13.75 5.16026 13.75H2.00339C2.02561 17.3219 2.19367 19.2647 3.46447 20.5355Z" />
      <path fill="currentColor" d="M22 12C22 7.28595 22 4.92893 20.5355 3.46447C19.3253 2.25428 17.5056 2.04415 14.25 2.00767V4.87812C15.0415 4.59899 15.9579 4.77595 16.591 5.40901C17.4697 6.28769 17.4697 7.71231 16.591 8.59099L13.591 11.591C13.169 12.0129 12.5967 12.25 12 12.25C11.4033 12.25 10.831 12.0129 10.409 11.591L7.40901 8.59099C6.53033 7.71231 6.53033 6.28769 7.40901 5.40901C8.04207 4.77595 8.95851 4.59899 9.75 4.87813V2.00767C6.49436 2.04415 4.67466 2.25428 3.46447 3.46447C2 4.92893 2 7.28595 2 12L2.00001 12.25L5.29454 12.2499C6.06705 12.2491 6.67886 12.2485 7.22924 12.5016C7.77961 12.7547 8.17729 13.2197 8.67941 13.8067L9.37216 14.6151C10.0059 15.3544 10.1838 15.5373 10.3975 15.6356C10.6113 15.734 10.8659 15.75 11.8397 15.75H12.1603C13.1341 15.75 13.3887 15.734 13.6025 15.6356C13.8162 15.5373 13.9941 15.3544 14.6278 14.6151L15.3206 13.8067C15.8227 13.2197 16.2204 12.7547 16.7708 12.5016C17.3211 12.2485 17.933 12.2491 18.7055 12.2499L22 12.25L22 12Z" />
    </svg>
  )
}

function DashRoadmapIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className}>
      <path d="M439.4 96L448 96C483.3 96 512 124.7 512 160L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 160C128 124.7 156.7 96 192 96L200.6 96C211.6 76.9 232.3 64 256 64L384 64C407.7 64 428.4 76.9 439.4 96zM376 176C389.3 176 400 165.3 400 152C400 138.7 389.3 128 376 128L264 128C250.7 128 240 138.7 240 152C240 165.3 250.7 176 264 176L376 176zM256 320C256 302.3 241.7 288 224 288C206.3 288 192 302.3 192 320C192 337.7 206.3 352 224 352C241.7 352 256 337.7 256 320zM288 320C288 333.3 298.7 344 312 344L424 344C437.3 344 448 333.3 448 320C448 306.7 437.3 296 424 296L312 296C298.7 296 288 306.7 288 320zM288 448C288 461.3 298.7 472 312 472L424 472C437.3 472 448 461.3 448 448C448 434.7 437.3 424 424 424L312 424C298.7 424 288 434.7 288 448zM224 480C241.7 480 256 465.7 256 448C256 430.3 241.7 416 224 416C206.3 416 192 430.3 192 448C192 465.7 206.3 480 224 480z" />
    </svg>
  )
}

function DashAnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" className={className}>
      <path fill="currentColor" fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6zm10 2a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0V8zm-4 3a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0v-5zm8 3a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2z" clipRule="evenodd" />
    </svg>
  )
}

function DashSettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
    </svg>
  )
}

type ChromeKey = 'overview' | 'page' | 'wishlists' | 'inbox' | 'roadmap' | 'analytics' | 'settings'

const CHROME_NAV: { key: ChromeKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'overview', label: 'Overview', icon: DashOverviewIcon },
  { key: 'page', label: 'My Page', icon: DashPageIcon },
  { key: 'wishlists', label: 'Wishlists', icon: DashWishlistsIcon },
  { key: 'inbox', label: 'Inbox', icon: DashInboxIcon },
  { key: 'roadmap', label: 'Roadmap', icon: DashRoadmapIcon },
  { key: 'analytics', label: 'Analytics', icon: DashAnalyticsIcon },
  { key: 'settings', label: 'Settings', icon: DashSettingsIcon },
]

// ─── Scroll reveal + step badge ────────────────────────────────────────────────

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity .7s cubic-bezier(.21,.6,.35,1) ${delay}ms, transform .7s cubic-bezier(.21,.6,.35,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

function StepBadge({ n }: { n: number }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
      background: '#394be8', color: '#fff', fontWeight: 700, fontSize: '11px',
      boxShadow: '0 4px 10px -3px rgba(57,75,232,.55)',
    }}>
      {n}
    </span>
  )
}

function DashboardChrome({
  active,
  headerLabel,
  children,
}: {
  active: Exclude<ChromeKey, 'overview' | 'settings'>
  headerLabel: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[20px] border border-[#ebedf1] bg-white shadow-[0_1px_2px_rgba(20,24,40,.04),0_30px_64px_-32px_rgba(20,24,40,.22)] overflow-hidden transition-transform duration-300 hover:-translate-y-1">
      <div className="grid" style={{ gridTemplateColumns: '56px 1fr' }}>
        {/* Icon rail */}
        <aside className="bg-[#F9FAFB] border-r border-slate-100 flex flex-col items-center py-3 gap-3">
          <img src="/logo.png" alt="Vuala" className="h-9 w-9 rounded-xl object-cover" />
          <nav className="flex flex-col items-center gap-2 mt-2">
            {CHROME_NAV.map(({ key, label, icon: Icon }) => {
              const isActive = key === active
              return (
                <span
                  key={key}
                  title={label}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                    isActive ? 'border border-slate-200 bg-white text-[#394BE8] shadow-sm' : 'text-[#797E93]'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
              )
            })}
          </nav>
          <div className="mt-auto h-9 w-9 rounded-xl bg-[#EEF1FF] text-[#394BE8] text-[11px] font-black flex items-center justify-center">
            MC
          </div>
        </aside>

        {/* Main */}
        <div className="flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-slate-100 bg-[#F9FAFB] px-5 flex-shrink-0">
            <span className="text-[15px] font-semibold text-slate-800">{headerLabel}</span>
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#394BE8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></svg>
              <span className="text-[12.5px] font-medium text-[#394BE8]">vuala.dev/maya</span>
            </div>
          </header>
          <div className="flex-1 min-h-[460px] bg-[#FCFCFD] p-4 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Shared style tokens ──────────────────────────────────────────────────────

const newsreaderStyle = "var(--font-newsreader), Georgia, serif"

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const [heroVotes, setHeroVotes] = useState(128)
  const [heroVoted, setHeroVoted] = useState(false)

  function toggleHero() {
    setHeroVoted(v => !v)
    setHeroVotes(v => v + (heroVoted ? -1 : 1))
  }

  return (
    <section id="top" style={{ background: 'linear-gradient(180deg,#f5f7fd 0%,#fbfbfc 100%)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '84px 28px 92px', display: 'grid', gridTemplateColumns: '1.04fr 1fr', gap: '60px', alignItems: 'center' }}>

        {/* LEFT */}
        <div>
          <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '60px', lineHeight: 1.06, letterSpacing: '-0.03em', fontWeight: 800, margin: '0 0 22px', color: '#171a21' }}>
            Show what you&apos;ve built — and{' '}
            <span style={{ color: '#394be8' }}>what&apos;s coming next.</span>
          </h1>

          <p style={{ fontSize: '18.5px', lineHeight: 1.6, color: '#5c6573', margin: '0 0 32px', maxWidth: '482px' }}>
            Vuala is a calm home for your projects. Showcase what you&apos;ve shipped, and let people add a wishlist for the things you&apos;re still building — so you ship with real demand behind you.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#fff', border: '1px solid #e0e5fb', borderRadius: '13px', padding: '6px 6px 6px 16px', maxWidth: '380px', boxShadow: '0 1px 2px rgba(20,24,40,.04),0 10px 24px -12px rgba(57,75,232,.3)' }}>
            <span style={{ fontSize: '15px', color: '#9aa2b1', whiteSpace: 'nowrap' }}>vuala.dev/</span>
            <input type="text" placeholder="yourname" style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '15px', color: '#1b1f27', padding: '9px 0', fontWeight: 500 }} />
            <button style={{ border: 'none', background: '#394be8', color: '#fff', fontFamily: 'inherit', fontWeight: 600, fontSize: '14px', padding: '11px 18px', borderRadius: '9px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Claim it
            </button>
          </div>
        </div>

        {/* RIGHT: showcase + wishlist card */}
        <div>
          <div style={{ background: '#fff', border: '1px solid #ebedf1', borderRadius: '22px', boxShadow: '0 1px 2px rgba(20,24,40,.04),0 30px 60px -28px rgba(20,24,40,.22)', overflow: 'hidden' }}>
            {/* Profile header */}
            <div style={{ padding: '24px 24px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(140deg,#6b7cf0,#394be8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '18px', flexShrink: 0 }}>MC</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#171a21' }}>Maya Chen</div>
                  <div style={{ fontSize: '13px', color: '#8a93a3' }}>Designer &amp; indie maker · vuala.dev/maya</div>
                </div>
                <button style={{ border: '1px solid #e4e7ec', background: '#fff', color: '#1b1f27', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, padding: '7px 14px', borderRadius: '9px', cursor: 'pointer' }}>
                  Follow
                </button>
              </div>
            </div>

            {/* Shipped projects */}
            <div style={{ padding: '0 24px 4px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#aab2c0', marginBottom: '12px' }}>Shipped</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '11px', borderRadius: '13px', border: '1px solid #f0f1f4' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eef1fd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#394be8" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="13.5" cy="6.5" r="2.5" /><circle cx="6.5" cy="12" r="2.5" /><circle cx="15" cy="17" r="2.5" />
                      <path d="M11.5 7.5L8.5 11M9 13l4 3" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#171a21' }}>Hued</div>
                    <div style={{ fontSize: '12.5px', color: '#8a93a3' }}>Color tools for designers</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#5c6573' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />Live
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '11px', borderRadius: '13px', border: '1px solid #f0f1f4' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fdeef4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#171a21' }}>Margins</div>
                    <div style={{ fontSize: '12.5px', color: '#8a93a3' }}>A quiet reading app</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#5c6573' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />Live
                  </span>
                </div>
              </div>
            </div>

            {/* Building next / wishlist */}
            <div style={{ margin: '16px', padding: '18px', borderRadius: '16px', background: '#f6f8fe', border: '1px solid #e6ebfb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#5566c9' }}>Building next</span>
                <span style={{ fontSize: '12px', color: '#8a93a3' }}>{heroVotes} on the wishlist</span>
              </div>
              <div style={{ fontFamily: newsreaderStyle, fontSize: '18px', fontWeight: 500, color: '#171a21', marginBottom: '3px' }}>Hued for Teams</div>
              <div style={{ fontSize: '13px', color: '#5c6573', lineHeight: 1.5, marginBottom: '14px' }}>Shared palettes and design tokens for whole teams.</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <button
                  onClick={toggleHero}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px', flexShrink: 0,
                    cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600,
                    padding: '9px 14px', borderRadius: '9px', transition: 'all .15s',
                    border: heroVoted ? '1px solid #394be8' : '1px solid #e2e6ee',
                    background: heroVoted ? '#394be8' : '#fff',
                    color: heroVoted ? '#fff' : '#1b1f27',
                  }}
                >
                  <Heart filled={heroVoted} />
                  {heroVoted ? 'On your list' : 'I want this'}
                </button>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e6ee', borderRadius: '9px', padding: '2px 2px 2px 12px' }}>
                  <input type="email" placeholder="Notify me at launch" style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '13px', color: '#1b1f27', padding: '7px 0' }} />
                  <button style={{ border: 'none', background: '#1b1f27', color: '#fff', fontFamily: 'inherit', fontSize: '12.5px', fontWeight: 600, padding: '7px 12px', borderRadius: '7px', cursor: 'pointer' }}>Join</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


// ─── Page (Store) ──────────────────────────────────────────────────────────────

function DeviceGlyph({ kind, active }: { kind: 'web' | 'tablet' | 'mobile'; active: boolean }) {
  const color = active ? '#0F172A' : '#94A3B8'
  if (kind === 'web') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8 20h8" /></svg>
  if (kind === 'tablet') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" /></svg>
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="7" y="2" width="10" height="20" rx="2.5" /></svg>
}

const DEVICE_FRAME: Record<'web' | 'tablet' | 'mobile', number> = { web: 256, tablet: 112, mobile: 74 }

function PageSection() {
  const [items, setItems] = useState([
    { title: 'Hued', type: 'Project', active: true },
    { title: 'Margins newsletter', type: 'Project', active: true },
    { title: 'Hued for Teams', type: 'Coming soon', active: false },
  ])
  const [device, setDevice] = useState<'web' | 'tablet' | 'mobile'>('web')

  function toggleItem(title: string) {
    setItems((curr) => curr.map((item) => item.title === title ? { ...item, active: !item.active } : item))
  }

  return (
    <section id="features" style={{ background: '#fbfbfc' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '96px 28px', display: 'grid', gridTemplateColumns: '0.92fr 1.08fr', gap: '64px', alignItems: 'center' }}>

        <Reveal>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <StepBadge n={1} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#394be8', letterSpacing: '0.02em' }}>Your page</span>
          </div>
          <h2 style={{ fontFamily: newsreaderStyle, fontSize: '40px', lineHeight: 1.12, letterSpacing: '-0.01em', fontWeight: 500, margin: '12px 0 16px', color: '#171a21' }}>
            One link. Your whole shipped catalog.
          </h2>
          <p style={{ fontSize: '16.5px', lineHeight: 1.65, color: '#5c6573', margin: '0 0 26px' }}>
            Add your projects, reorder them, and toggle what&apos;s live — all from one screen. No theme files, no page builder, just the things you&apos;ve made.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              ['Drag to reorder', ' — changes go live instantly.'],
              ['Preview before you publish', ' — see exactly how it looks on web, tablet, or phone.'],
              ['Your own link', ' — vuala.dev/you, no setup required.'],
            ].map(([bold, rest]) => (
              <div key={bold} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '7px', background: '#eef1fd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                  <Check />
                </span>
                <div style={{ fontSize: '15px' }}>
                  <strong style={{ color: '#171a21', fontWeight: 600 }}>{bold}</strong>
                  <span style={{ color: '#5c6573' }}>{rest}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </Reveal>

        <Reveal delay={120}>
        <DashboardChrome active="page" headerLabel="My Page">
          <div className="grid h-full gap-4" style={{ gridTemplateColumns: '1fr auto' }}>
            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-white px-3.5 py-2.5 shadow-sm">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#EEF1FF] text-[11px] font-black text-[#394BE8]">MC</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-slate-900">Maya Chen</p>
                  <p className="truncate text-[11px] text-slate-400">Design engineer, small useful tools.</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1.5 text-slate-300">
                  <GithubIcon />
                  <XIcon />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">Items · 3</p>
                <span className="rounded-lg bg-[#394BE8] px-2.5 py-1 text-[11px] font-semibold text-white">+ New</span>
              </div>

              <div className="flex flex-col gap-2">
                {items.map((item) => (
                  <div key={item.title} className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
                    <div className="h-7 w-7 flex-shrink-0 rounded-lg bg-[#EEF1FF]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium text-slate-900">{item.title}</p>
                      <p className="text-[10.5px] text-slate-400">{item.type}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleItem(item.title)}
                      aria-label={`Toggle ${item.title}`}
                      className={`relative h-4 w-7 flex-shrink-0 rounded-full transition-colors ${item.active ? 'bg-[#394BE8]' : 'bg-slate-200'}`}
                    >
                      <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${item.active ? 'left-[15px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex w-[100px] flex-shrink-0 flex-col items-center gap-2.5">
              <div className="flex items-center gap-[3px] rounded-lg bg-slate-100 p-[3px]">
                {(['web', 'tablet', 'mobile'] as const).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setDevice(kind)}
                    aria-label={`${kind} preview`}
                    className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${kind === device ? 'bg-white shadow-sm' : ''}`}
                  >
                    <DeviceGlyph kind={kind} active={kind === device} />
                  </button>
                ))}
              </div>
              <div
                className="flex h-[160px] flex-col gap-1.5 rounded-[16px] border border-slate-200 bg-white p-2 transition-[width] duration-200"
                style={{ width: DEVICE_FRAME[device] }}
              >
                <div className="mx-auto h-6 w-6 rounded-full bg-[#EEF1FF]" />
                <div className="mx-auto h-1.5 w-10 rounded bg-slate-100" />
                <div className="mt-1 flex flex-1 flex-col gap-1.5">
                  <div className="h-6 rounded-lg border border-slate-100 bg-slate-50" />
                  <div className="h-6 rounded-lg border border-slate-100 bg-slate-50" />
                  <div className="h-6 rounded-lg border border-slate-100 bg-slate-50" />
                </div>
              </div>
            </div>
          </div>
        </DashboardChrome>
        </Reveal>

      </div>
    </section>
  )
}

// ─── Wishlist Spotlight ────────────────────────────────────────────────────────

const WISH_DEFS = [
  { id: 'teams', title: 'Hued for Teams', desc: 'Shared palettes & design tokens', tag: 'Most wanted', count: 212 },
  { id: 'api', title: 'Public API', desc: 'Pull your colors programmatically', tag: 'Exploring', count: 132 },
  { id: 'ios', title: 'iOS app', desc: 'Capture palettes on the go', tag: 'Idea', count: 82 },
]

function WishlistSpotlight() {
  const [counts, setCounts] = useState({ teams: 212, api: 132, ios: 82 })
  const [voted, setVoted] = useState<Record<string, boolean>>({})

  function toggleVote(id: string) {
    const was = voted[id]
    setVoted(v => ({ ...v, [id]: !was }))
    setCounts(c => ({ ...c, [id]: c[id as keyof typeof c] + (was ? -1 : 1) }))
  }

  const totalWants = counts.teams + counts.api + counts.ios

  return (
    <section style={{ background: '#fff', borderTop: '1px solid #f0f1f4', borderBottom: '1px solid #f0f1f4' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '96px 28px', display: 'grid', gridTemplateColumns: '0.92fr 1.08fr', gap: '64px', alignItems: 'center' }}>

        <Reveal>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#394be8', letterSpacing: '0.02em' }}>Wishlists</span>
          <h2 style={{ fontFamily: newsreaderStyle, fontSize: '40px', lineHeight: 1.12, letterSpacing: '-0.01em', fontWeight: 500, margin: '12px 0 16px', color: '#171a21' }}>
            Turn &ldquo;what are you building?&rdquo; into a list you can act on.
          </h2>
          <p style={{ fontSize: '16.5px', lineHeight: 1.65, color: '#5c6573', margin: '0 0 26px' }}>
            Share the ideas you&apos;re working on. People upvote the ones they want and leave an email to hear when it ships. You build with proof of demand — and a warm list waiting on launch day.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              ['Gauge real interest', ' before you write a line of code.'],
              ['Build a launch list', ' of people who asked to be notified.'],
              ['Let demand set priorities', ' — the most-wanted ideas rise to the top.'],
            ].map(([bold, rest]) => (
              <div key={bold} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '7px', background: '#eef1fd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                  <Check />
                </span>
                <div style={{ fontSize: '15px' }}>
                  <strong style={{ color: '#171a21', fontWeight: 600 }}>{bold}</strong>
                  <span style={{ color: '#5c6573' }}>{rest}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </Reveal>

        {/* Interactive wishlist card */}
        <Reveal delay={120}>
        <div style={{ background: '#fbfcfe', border: '1px solid #ebedf1', borderRadius: '20px', padding: '8px', boxShadow: '0 1px 2px rgba(20,24,40,.04),0 24px 50px -28px rgba(20,24,40,.2)', transition: 'transform .3s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div style={{ padding: '18px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#171a21' }}>On the wishlist</span>
            <span style={{ fontSize: '12.5px', color: '#8a93a3' }}>Sorted by most wanted</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 8px 8px' }}>
            {WISH_DEFS.map(({ id, title, desc, tag }) => {
              const active = !!voted[id]
              const count = counts[id as keyof typeof counts]
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', border: '1px solid #eef0f3', borderRadius: '14px', padding: '14px 16px' }}>
                  <button
                    onClick={() => toggleVote(id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px',
                      flexShrink: 0, cursor: 'pointer', fontFamily: 'inherit', width: '46px',
                      padding: '8px 0', borderRadius: '11px', transition: 'all .15s',
                      border: active ? '1px solid #394be8' : '1px solid #e7e9ee',
                      background: active ? '#eef1fd' : '#fff',
                      color: active ? '#394be8' : '#8a93a3',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>{count}</span>
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14.5px', color: '#171a21' }}>{title}</div>
                    <div style={{ fontSize: '12.5px', color: '#8a93a3' }}>{desc}</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#5566c9', background: '#eef1fd', padding: '3px 9px', borderRadius: '999px', whiteSpace: 'nowrap' }}>{tag}</span>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderTop: '1px solid #f0f1f4', marginTop: '4px' }}>
            <span style={{ fontSize: '13px', color: '#8a93a3' }}>{totalWants} people waiting across 3 ideas</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#394be8' }}>Tap ▲ to add yours</span>
          </div>
        </div>
        </Reveal>

      </div>
    </section>
  )
}

// ─── Wishlists (dashboard side) ────────────────────────────────────────────────

function WishlistsDashboardSection() {
  const rows = [
    { name: 'Jordan Lee', product: 'Hued for Teams', source: 'Twitter/X' },
    { name: 'Priya Nair', product: 'Public API', source: 'YouTube' },
    { name: 'Sam Okoro', product: 'Hued for Teams', source: 'Newsletter' },
  ]
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  function toggleRow(name: string) {
    setSelected((curr) => ({ ...curr, [name]: !curr[name] }))
  }

  const selectedCount = Object.values(selected).filter(Boolean).length

  return (
    <section id="wishlist" style={{ background: '#fbfbfc' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '96px 28px', display: 'grid', gridTemplateColumns: '1.08fr 0.92fr', gap: '64px', alignItems: 'center' }}>

        <Reveal>
        <DashboardChrome active="wishlists" headerLabel="Wishlists">
          <div className="flex h-full flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Total wishlists', value: '426' },
                { label: 'New this week', value: '+54' },
                { label: 'Conversion', value: '12.4%' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[10px] border border-[#e6e8ec] bg-white px-2.5 py-2">
                  <p className="text-[10px] font-medium text-[#64748B]">{stat.label}</p>
                  <p className="mt-0.5 text-[15px] font-bold text-[#0F172A]">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#e6e8ec] bg-white px-2.5 py-[7px] text-[11px] font-semibold text-[#8b909d]">
                Contact wishlists
                <span className="rounded-full bg-[#fdf3e3] px-1.5 py-[1px] text-[8.5px] font-bold uppercase text-[#92600a]">Soon</span>
              </span>
              <span className="rounded-[8px] bg-[#394be8] px-2.5 py-[7px] text-[11px] font-semibold text-white">Export</span>
            </div>

            <div className="flex-1 overflow-hidden rounded-[10px] border border-[#e6e8ec] bg-white">
              {rows.map((row) => {
                const isSelected = !!selected[row.name]
                return (
                  <button
                    type="button"
                    key={row.name}
                    onClick={() => toggleRow(row.name)}
                    className={`flex w-full items-center gap-2 border-b border-[#f0f1f4] px-2.5 py-2 text-left transition-colors last:border-0 ${isSelected ? 'bg-[#f4f5fe]' : 'hover:bg-[#fafbfd]'}`}
                  >
                    <span className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-[4px] border transition-colors ${isSelected ? 'border-[#394be8] bg-[#394be8]' : 'border-[#c9cdd6] bg-white'}`}>
                      {isSelected && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </span>
                    <span className="inline-grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-[#eef0fd] text-[8px] font-bold text-[#394be8]">
                      {row.name.split(' ').map((p) => p[0]).join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11.5px] font-semibold text-[#15171f]">{row.name}</p>
                      <p className="truncate text-[10px] text-[#8b909d]">{row.product}</p>
                    </div>
                    <span className="flex-shrink-0 rounded-full border border-[#e8eaee] bg-[#f7f8fa] px-1.5 py-[1px] text-[9.5px] font-medium text-[#424754]">
                      {row.source}
                    </span>
                  </button>
                )
              })}
            </div>

            {selectedCount > 0 && (
              <div className="flex items-center justify-between rounded-[8px] bg-[#15171f] px-2.5 py-[7px] text-[10.5px] font-medium text-white">
                <span>{selectedCount} selected</span>
                <span className="rounded-[6px] bg-white/10 px-2 py-[3px] font-semibold">Export selected</span>
              </div>
            )}
          </div>
        </DashboardChrome>
        </Reveal>

        <Reveal delay={120}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <StepBadge n={2} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#394be8', letterSpacing: '0.02em' }}>Wishlists, your side</span>
          </div>
          <h2 style={{ fontFamily: newsreaderStyle, fontSize: '40px', lineHeight: 1.12, letterSpacing: '-0.01em', fontWeight: 500, margin: '12px 0 16px', color: '#171a21' }}>
            Know exactly who to email on launch day.
          </h2>
          <p style={{ fontSize: '16.5px', lineHeight: 1.65, color: '#5c6573', margin: '0 0 26px' }}>
            Every wishlist join lands here with their email, which idea they wanted, and where they came from. Filter by product or source, export the list, and — soon — message everyone directly.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              ['Filter by product or source', ' — find the people who want one specific thing.'],
              ['Export anytime', ' — CSV, ready for your own email tool.'],
              ['Contact wishlists', ' — message everyone on a list directly, coming soon.'],
            ].map(([bold, rest]) => (
              <div key={bold} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '7px', background: '#eef1fd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                  <Check />
                </span>
                <div style={{ fontSize: '15px' }}>
                  <strong style={{ color: '#171a21', fontWeight: 600 }}>{bold}</strong>
                  <span style={{ color: '#5c6573' }}>{rest}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </Reveal>

      </div>
    </section>
  )
}

// ─── Highlights strip (horizontal scroll) ──────────────────────────────────────

const HIGHLIGHTS = [
  {
    title: 'GitHub import',
    desc: 'Pull projects straight from your repos — no manual data entry.',
    icon: <GithubIcon />,
  },
  {
    title: 'Your own domain',
    desc: 'Point a custom domain at your page whenever you’re ready.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#394be8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" /></svg>,
  },
  {
    title: 'Live metrics',
    desc: 'Stars, revenue, and traffic stay in sync automatically, once connected.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#394be8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l5-5 4 4 8-8" /><path d="M15 8h5v5" /></svg>,
  },
  {
    title: 'Email capture',
    desc: 'Every wishlist join comes with an email you can actually reach.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#394be8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>,
  },
  {
    title: 'CSV & JSON export',
    desc: 'Take every list with you, any time. No lock-in, ever.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#394be8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" /></svg>,
  },
  {
    title: 'Multiple roadmaps',
    desc: 'Separate boards for separate releases, betas, or products.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#394be8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="7" height="7" rx="1.5" /><rect x="14" y="4" width="7" height="7" rx="1.5" /><rect x="3" y="15" width="7" height="7" rx="1.5" /><rect x="14" y="15" width="7" height="7" rx="1.5" /></svg>,
  },
  {
    title: 'Source tracking',
    desc: 'See exactly which post, tweet, or link brought someone in.',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#394be8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="2.4" /><circle cx="18" cy="18" r="2.4" /><path d="M7.7 7.7l8.6 8.6" /></svg>,
  },
]

function HighlightsStrip() {
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scrollByCard(dir: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: dir * 264, behavior: 'smooth' })
  }

  return (
    <section style={{ background: '#fff', borderTop: '1px solid #f0f1f4', borderBottom: '1px solid #f0f1f4' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '80px 0 88px' }}>
        <Reveal>
          <div style={{ padding: '0 28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', marginBottom: '36px' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#394be8', letterSpacing: '0.02em' }}>And there&apos;s more</span>
              <h2 style={{ fontFamily: newsreaderStyle, fontSize: '32px', lineHeight: 1.15, letterSpacing: '-0.01em', fontWeight: 500, margin: '10px 0 0', color: '#171a21' }}>
                Small things that add up.
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                aria-label="Scroll left"
                style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #ebedf1', background: '#fff', color: '#5c6573', cursor: 'pointer', fontFamily: 'inherit', fontSize: '16px' }}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                aria-label="Scroll right"
                style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #ebedf1', background: '#fff', color: '#5c6573', cursor: 'pointer', fontFamily: 'inherit', fontSize: '16px' }}
              >
                ›
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div
            ref={scrollerRef}
            className="no-scrollbar"
            style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '4px 28px 10px', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
          >
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.title}
                style={{ flexShrink: 0, width: '236px', scrollSnapAlign: 'start', background: '#fbfcfe', border: '1px solid #eef0f3', borderRadius: '16px', padding: '20px' }}
              >
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eef1fd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  {h.icon}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: '#171a21' }}>{h.title}</h3>
                <p style={{ fontSize: '13px', lineHeight: 1.55, color: '#5c6573', margin: 0 }}>{h.desc}</p>
              </div>
            ))}
            <div style={{ flexShrink: 0, width: '12px' }} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Inbox ──────────────────────────────────────────────────────────────────────

const INBOX_STATUS_TONE: Record<'Open' | 'Replied' | 'Archived', string> = {
  Open: 'text-[#394BE8] border-[#d9ddf9] bg-[#f4f5fe]',
  Replied: 'text-[#1f7a4d] border-[#d2eadd] bg-[#eff8f2]',
  Archived: 'text-[#64748b] border-[#e2e8f0] bg-[#f8fafc]',
}
const INBOX_STATUS_CYCLE: Record<'Open' | 'Replied' | 'Archived', 'Open' | 'Replied' | 'Archived'> = {
  Open: 'Replied',
  Replied: 'Archived',
  Archived: 'Open',
}

function InboxSection() {
  const [messages, setMessages] = useState<Array<{ name: string; text: string; type: string; typeTone: string; status: 'Open' | 'Replied' | 'Archived' }>>([
    { name: 'Alicia Park', text: 'Loved Hued — any plans for a Figma plugin?', type: 'Feedback', typeTone: 'text-[#394BE8] border-[#d9ddf9] bg-[#f4f5fe]', status: 'Open' },
    { name: 'Marcus Webb', text: 'Interested in a sponsorship for the newsletter.', type: 'Partnership', typeTone: 'text-[#0f766e] border-[#cde8e4] bg-[#f0fbfa]', status: 'Replied' },
    { name: 'Dana Iyer', text: 'Export button throws an error on Safari.', type: 'Bug', typeTone: 'text-[#b91c1c] border-[#f2c9c9] bg-[#fff5f5]', status: 'Open' },
  ])

  function cycleStatus(name: string) {
    setMessages((curr) => curr.map((m) => m.name === name ? { ...m, status: INBOX_STATUS_CYCLE[m.status] } : m))
  }

  return (
    <section style={{ background: '#fff' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '96px 28px', display: 'grid', gridTemplateColumns: '0.92fr 1.08fr', gap: '64px', alignItems: 'center' }}>

        <Reveal>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <StepBadge n={3} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#394be8', letterSpacing: '0.02em' }}>Inbox</span>
          </div>
          <h2 style={{ fontFamily: newsreaderStyle, fontSize: '40px', lineHeight: 1.12, letterSpacing: '-0.01em', fontWeight: 500, margin: '12px 0 16px', color: '#171a21' }}>
            Feedback, offers, and bug reports — sorted, not scattered.
          </h2>
          <p style={{ fontSize: '16.5px', lineHeight: 1.65, color: '#5c6573', margin: '0 0 26px' }}>
            Every message from your page lands in one inbox, tagged by type and status — so a sponsorship offer or a bug report doesn&apos;t get buried in your regular email.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              ['Auto-tagged by type', ' — feedback, bugs, offers, and partnerships, sorted on arrival.'],
              ['Track status', ' — open, replied, archived, so you know what still needs you.'],
              ['Export anytime', ' — CSV, whenever you need it elsewhere.'],
            ].map(([bold, rest]) => (
              <div key={bold} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '7px', background: '#eef1fd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                  <Check />
                </span>
                <div style={{ fontSize: '15px' }}>
                  <strong style={{ color: '#171a21', fontWeight: 600 }}>{bold}</strong>
                  <span style={{ color: '#5c6573' }}>{rest}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </Reveal>

        <Reveal delay={120}>
        <DashboardChrome active="inbox" headerLabel="Inbox">
          <div className="flex h-full flex-col gap-3">
            <div className="grid grid-cols-4 gap-2">
              {[['Total', '48'], ['Open', '12'], ['Replied', '29'], ['Archived', '7']].map(([label, value]) => (
                <div key={label} className="rounded-[10px] border border-[#e6e8ec] bg-white px-2 py-2">
                  <p className="text-[9.5px] font-medium text-[#64748B]">{label}</p>
                  <p className="mt-0.5 text-[14px] font-bold text-[#0F172A]">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-hidden rounded-[10px] border border-[#e6e8ec] bg-white">
              {messages.map((m) => (
                <div key={m.name} className="flex items-center gap-2 border-b border-[#f0f1f4] px-2.5 py-2 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-semibold text-[#15171f]">{m.name}</p>
                    <p className="truncate text-[10px] text-[#8b909d]">{m.text}</p>
                  </div>
                  <span className={`flex-shrink-0 rounded-full border px-1.5 py-[1px] text-[9px] font-medium ${m.typeTone}`}>{m.type}</span>
                  <button
                    type="button"
                    onClick={() => cycleStatus(m.name)}
                    title="Click to change status"
                    className={`flex-shrink-0 rounded-full border px-1.5 py-[1px] text-[9px] font-medium transition-colors ${INBOX_STATUS_TONE[m.status]}`}
                  >
                    {m.status}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </DashboardChrome>
        </Reveal>

      </div>
    </section>
  )
}

// ─── Roadmap ────────────────────────────────────────────────────────────────────

const ROADMAP_PRIORITY_TONE: Record<'Low' | 'Medium' | 'High', string> = {
  Low: 'text-[#64748b] border-[#e2e8f0] bg-[#f8fafc]',
  Medium: 'text-[#92600a] border-[#f2e3c4] bg-[#fdf7ec]',
  High: 'text-[#b91c1c] border-[#f2c9c9] bg-[#fff5f5]',
}
const ROADMAP_PRIORITIES: Array<'Low' | 'Medium' | 'High'> = ['Low', 'Medium', 'High']

function RoadmapSection() {
  const [items, setItems] = useState<Array<{ title: string; type: string; typeTone: string; priority: 'Low' | 'Medium' | 'High' }>>([
    { title: 'Creator inbox for feedback', type: 'New feature', typeTone: 'text-[#394BE8] border-[#d9ddf9] bg-[#f4f5fe]', priority: 'High' },
    { title: 'Wishlist source grouping', type: 'Improvement', typeTone: 'text-[#92600a] border-[#f2e3c4] bg-[#fdf7ec]', priority: 'Medium' },
    { title: 'Launch checklist', type: 'New feature', typeTone: 'text-[#394BE8] border-[#d9ddf9] bg-[#f4f5fe]', priority: 'Medium' },
  ])
  const [openRow, setOpenRow] = useState<string | null>(null)

  function setPriority(title: string, priority: 'Low' | 'Medium' | 'High') {
    setItems((curr) => curr.map((item) => item.title === title ? { ...item, priority } : item))
    setOpenRow(null)
  }

  return (
    <section style={{ background: '#fbfbfc' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '96px 28px', display: 'grid', gridTemplateColumns: '1.08fr 0.92fr', gap: '64px', alignItems: 'center' }}>

        <Reveal>
        <DashboardChrome active="roadmap" headerLabel="Roadmap">
          <div className="flex h-full flex-col gap-3">
            <div className="grid grid-cols-4 gap-2">
              {[['Total', '12'], ['Planned', '4'], ['In progress', '3'], ['Shipped', '5']].map(([label, value]) => (
                <div key={label} className="rounded-[10px] border border-[#e6e8ec] bg-white px-2 py-2">
                  <p className="text-[9.5px] font-medium text-[#64748B]">{label}</p>
                  <p className="mt-0.5 text-[14px] font-bold text-[#0F172A]">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex-1 rounded-[10px] border border-[#e6e8ec] bg-white">
              {items.map((item) => {
                const isOpen = openRow === item.title
                return (
                  <div key={item.title} className="flex items-center gap-2 border-b border-[#f0f1f4] px-2.5 py-2 last:border-0">
                    <p className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-[#15171f]">{item.title}</p>
                    <span className={`flex-shrink-0 rounded-full border px-1.5 py-[1px] text-[9px] font-medium ${item.typeTone}`}>{item.type}</span>
                    <span className="relative flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setOpenRow(isOpen ? null : item.title)}
                        className={`rounded-full border px-1.5 py-[1px] text-[9px] font-medium transition-colors ${ROADMAP_PRIORITY_TONE[item.priority]}`}
                      >
                        {item.priority}
                      </button>
                      {isOpen && (
                        <span className="absolute left-0 top-[calc(100%+3px)] z-10 w-[84px] overflow-hidden rounded-[8px] border border-[#e6e8ec] bg-white shadow-[0_8px_20px_rgba(16,24,40,0.14)]">
                          {ROADMAP_PRIORITIES.map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPriority(item.title, p)}
                              className={`block w-full px-2 py-1 text-left text-[9px] font-medium transition-colors ${p === item.priority ? 'bg-[#f4f5fe] text-[#394be8]' : 'text-[#15171f] hover:bg-[#f7f8fa]'}`}
                            >
                              {p}
                            </button>
                          ))}
                        </span>
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </DashboardChrome>
        </Reveal>

        <Reveal delay={120}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <StepBadge n={4} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#394be8', letterSpacing: '0.02em' }}>Roadmap</span>
          </div>
          <h2 style={{ fontFamily: newsreaderStyle, fontSize: '40px', lineHeight: 1.12, letterSpacing: '-0.01em', fontWeight: 500, margin: '12px 0 16px', color: '#171a21' }}>
            Tell people what&apos;s next, and actually ship it.
          </h2>
          <p style={{ fontSize: '16.5px', lineHeight: 1.65, color: '#5c6573', margin: '0 0 26px' }}>
            Track every idea by type, priority, and status. Keep multiple roadmaps for different releases, and let visitors see what&apos;s coming — not just what already shipped.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              ['Type, priority, and status', ' — every item tagged so the board stays scannable.'],
              ['Multiple roadmaps', ' — separate boards for separate releases or products.'],
              ['Mark what ships next', ' — flag items for the next update.'],
            ].map(([bold, rest]) => (
              <div key={bold} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '7px', background: '#eef1fd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                  <Check />
                </span>
                <div style={{ fontSize: '15px' }}>
                  <strong style={{ color: '#171a21', fontWeight: 600 }}>{bold}</strong>
                  <span style={{ color: '#5c6573' }}>{rest}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </Reveal>

      </div>
    </section>
  )
}

// ─── Analytics ──────────────────────────────────────────────────────────────────

const ANALYTICS_METRICS = {
  visitors: { label: 'Visitors', value: '2,418', color: '#394BE8', bars: [38, 52, 46, 64, 58, 78, 100] },
  clicks: { label: 'Link clicks', value: '968', color: '#1893a8', bars: [30, 40, 55, 48, 62, 70, 90] },
  wishlists: { label: 'Wishlists', value: '426', color: '#cf5e88', bars: [20, 35, 30, 45, 40, 60, 82] },
} as const
type AnalyticsMetricKey = keyof typeof ANALYTICS_METRICS

function AnalyticsSection() {
  const sources = [
    { label: 'Twitter/X', conv: 86 },
    { label: 'YouTube', conv: 64 },
    { label: 'Direct', conv: 38 },
  ]
  const [activeMetric, setActiveMetric] = useState<AnalyticsMetricKey>('visitors')
  const metric = ANALYTICS_METRICS[activeMetric]

  return (
    <section style={{ background: '#fff' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '96px 28px', display: 'grid', gridTemplateColumns: '0.92fr 1.08fr', gap: '64px', alignItems: 'center' }}>

        <Reveal>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <StepBadge n={5} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#394be8', letterSpacing: '0.02em' }}>Analytics</span>
          </div>
          <h2 style={{ fontFamily: newsreaderStyle, fontSize: '40px', lineHeight: 1.12, letterSpacing: '-0.01em', fontWeight: 500, margin: '12px 0 16px', color: '#171a21' }}>
            Every visit, click, and conversion — without the spreadsheet.
          </h2>
          <p style={{ fontSize: '16.5px', lineHeight: 1.65, color: '#5c6573', margin: '0 0 26px' }}>
            See where visitors come from, what they click, and which sources actually turn into wishlists — broken down by source, device, and country.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              ['Traffic timeline', ' — visitors, clicks, and wishlists, day by day.'],
              ['Source breakdown', ' — see which channel actually converts.'],
              ['Export to CSV', ' — daily timeline, sources, and country data.'],
            ].map(([bold, rest]) => (
              <div key={bold} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '7px', background: '#eef1fd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                  <Check />
                </span>
                <div style={{ fontSize: '15px' }}>
                  <strong style={{ color: '#171a21', fontWeight: 600 }}>{bold}</strong>
                  <span style={{ color: '#5c6573' }}>{rest}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </Reveal>

        <Reveal delay={120}>
        <DashboardChrome active="analytics" headerLabel="Analytics">
          <div className="flex h-full flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(ANALYTICS_METRICS) as AnalyticsMetricKey[]).map((key) => {
                const m = ANALYTICS_METRICS[key]
                const isActive = key === activeMetric
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveMetric(key)}
                    className="rounded-[10px] border bg-white px-2.5 py-2 text-left transition-colors"
                    style={{ borderColor: isActive ? m.color : '#e6e8ef', boxShadow: isActive ? `0 0 0 1px ${m.color}` : 'none' }}
                  >
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.04em] text-[#6b7484]">{m.label}</p>
                    <p className="mt-1 text-[16px] font-bold tracking-tight" style={{ color: isActive ? m.color : '#1b2230' }}>{m.value}</p>
                  </button>
                )
              })}
            </div>

            <div className="rounded-[10px] border border-[#e6e8ef] bg-white px-3 py-2.5">
              <p className="text-[10.5px] font-semibold text-[#1b2230]">Traffic timeline · {metric.label}</p>
              <div className="mt-2 flex h-[60px] items-end gap-[5px]">
                {metric.bars.map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-[2px] transition-all duration-300" style={{ height: `${h}%`, background: metric.color }} />
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-[10px] border border-[#e6e8ef] bg-white">
              {sources.map((s) => (
                <div key={s.label} className="flex items-center gap-2 border-b border-[#f1f3f7] px-2.5 py-2 last:border-0">
                  <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-[#1b2230]">{s.label}</span>
                  <span className="h-1 w-12 flex-shrink-0 overflow-hidden rounded-[2px] bg-[#edeff5]">
                    <span className="block h-full rounded-[2px] bg-[#394BE8]" style={{ width: `${s.conv}%` }} />
                  </span>
                  <span className="w-9 flex-shrink-0 text-right text-[10.5px] font-mono text-[#1b2230]">{s.conv}%</span>
                </div>
              ))}
            </div>
          </div>
        </DashboardChrome>
        </Reveal>

      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section style={{ background: '#fff', borderTop: '1px solid #f0f1f4', borderBottom: '1px solid #f0f1f4' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '92px 28px' }}>
        <div style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto 56px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#394be8', letterSpacing: '0.02em' }}>How it works</span>
          <h2 style={{ fontFamily: newsreaderStyle, fontSize: '40px', lineHeight: 1.1, letterSpacing: '-0.01em', fontWeight: 500, margin: '12px 0 0', color: '#171a21' }}>
            Up and running before your coffee&apos;s cold.
          </h2>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '27px', left: '16.66%', right: '16.66%', height: '2px', background: 'repeating-linear-gradient(90deg,#cbd3f6 0 7px,transparent 7px 14px)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '36px', position: 'relative' }}>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#394be8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '19px', boxShadow: '0 0 0 8px #fff,0 6px 16px -6px rgba(57,75,232,.6)', marginBottom: '24px' }}>1</div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px', color: '#171a21' }}>Grab your handle</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.55, color: '#5c6573', margin: '0 0 18px', maxWidth: '260px' }}>Pick your vuala.dev name and pull in projects from GitHub.</p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', background: '#fbfcfe', border: '1px solid #eef0f3', borderRadius: '11px', padding: '7px 8px 7px 13px' }}>
                <span style={{ fontSize: '13px', color: '#9aa2b1' }}>vuala.dev/</span>
                <span style={{ fontSize: '13px', color: '#171a21', fontWeight: 600 }}>maya</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff', background: '#394be8', padding: '5px 11px', borderRadius: '7px', marginLeft: '4px' }}>Claim</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#394be8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '19px', boxShadow: '0 0 0 8px #fff,0 6px 16px -6px rgba(57,75,232,.6)', marginBottom: '24px' }}>2</div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px', color: '#171a21' }}>Add shipped &amp; upcoming</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.55, color: '#5c6573', margin: '0 0 18px', maxWidth: '260px' }}>Show what&apos;s live, then post what&apos;s next for people to wishlist.</p>
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '7px', width: '215px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fbfcfe', border: '1px solid #eef0f3', borderRadius: '10px', padding: '8px 11px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: '12.5px', color: '#171a21', fontWeight: 600, flex: 1, textAlign: 'left' }}>Hued</span>
                  <span style={{ fontSize: '11px', color: '#9aa2b1' }}>Shipped</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f6f8fe', border: '1px solid #e6ebfb', borderRadius: '10px', padding: '8px 11px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#394be8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z" /></svg>
                  <span style={{ fontSize: '12.5px', color: '#171a21', fontWeight: 600, flex: 1, textAlign: 'left' }}>Hued for Teams</span>
                  <span style={{ fontSize: '11px', color: '#5566c9' }}>Next</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#394be8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '19px', boxShadow: '0 0 0 8px #fff,0 6px 16px -6px rgba(57,75,232,.6)', marginBottom: '24px' }}>3</div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px', color: '#171a21' }}>Share &amp; watch it grow</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.55, color: '#5c6573', margin: '0 0 18px', maxWidth: '260px' }}>Drop your link anywhere and let the wishlist fill up.</p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', background: '#fbfcfe', border: '1px solid #eef0f3', borderRadius: '11px', padding: '10px 14px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700, fontSize: '14px', color: '#16a34a' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                  +12
                </span>
                <span style={{ fontSize: '12.5px', color: '#5c6573' }}>new wishes this week</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function PricingSection() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')
  const annual = billing === 'annual'

  function segStyle(active: boolean) {
    return {
      appearance: 'none' as const, border: 'none', cursor: 'pointer', padding: '8px 18px',
      borderRadius: '8px', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
      transition: 'all .15s',
      background: active ? '#394be8' : 'transparent',
      color: active ? '#fff' : '#5c6573',
    }
  }

  const features = {
    free: ['Your vuala.dev page', 'Up to 5 projects', '1 wishlist idea', 'GitHub import'],
    pro: ['Everything in Free, plus', 'Unlimited projects', 'Unlimited wishlists + email capture', 'Custom domain & live metrics', 'Full analytics'],
    studio: ['Everything in Pro, plus', 'Up to 5 team profiles', 'Collaborator roles', 'API access & webhooks', 'Priority support'],
  }

  return (
    <section id="pricing" style={{ background: '#fbfbfc' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '96px 28px' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 36px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#394be8', letterSpacing: '0.02em' }}>Pricing</span>
          <h2 style={{ fontFamily: newsreaderStyle, fontSize: '42px', lineHeight: 1.1, letterSpacing: '-0.01em', fontWeight: 500, margin: '12px 0 14px', color: '#171a21' }}>
            Start free. Grow when you&apos;re ready.
          </h2>
          <p style={{ fontSize: '17px', lineHeight: 1.6, color: '#5c6573', margin: 0 }}>
            No sales calls, no pressure. Move up only when your work outgrows the free plan.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', background: '#fff', border: '1px solid #e4e7ec', borderRadius: '11px', padding: '4px', gap: '3px' }}>
            <button onClick={() => setBilling('monthly')} style={segStyle(!annual)}>Monthly</button>
            <button onClick={() => setBilling('annual')} style={segStyle(annual)}>Annual</button>
          </div>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#2f3bb5', background: '#eef1fd', padding: '4px 10px', borderRadius: '999px' }}>2 months free</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px', alignItems: 'start' }}>

          {/* Free */}
          <div style={{ background: '#fff', border: '1px solid #ebedf1', borderRadius: '18px', padding: '30px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#171a21', marginBottom: '6px' }}>Free</div>
            <p style={{ fontSize: '13.5px', color: '#8a93a3', margin: '0 0 22px', lineHeight: 1.5 }}>For getting your first projects out there.</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '22px' }}>
              <span style={{ fontFamily: newsreaderStyle, fontSize: '44px', fontWeight: 500, color: '#171a21' }}>$0</span>
              <span style={{ fontSize: '14px', color: '#9aa2b1' }}>/ forever</span>
            </div>
            <a href="/register" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', border: '1px solid #e4e7ec', color: '#1b1f27', fontWeight: 600, fontSize: '14px', padding: '11px', borderRadius: '10px', marginBottom: '24px' }}>
              Create your page
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {features.free.map(f => (
                <div key={f} style={{ display: 'flex', gap: '9px', alignItems: 'center', fontSize: '14px', color: '#5c6573' }}>
                  <Check />{f}
                </div>
              ))}
            </div>
          </div>

          {/* Pro — highlighted */}
          <div style={{ background: '#fff', border: '1.5px solid #394be8', borderRadius: '18px', padding: '30px', position: 'relative', boxShadow: '0 1px 2px rgba(20,24,40,.04),0 24px 50px -28px rgba(57,75,232,.4)' }}>
            <span style={{ position: 'absolute', top: '-12px', left: '30px', background: '#394be8', color: '#fff', fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.03em', padding: '5px 12px', borderRadius: '999px' }}>Most popular</span>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#2f3bb5', marginBottom: '6px' }}>Pro</div>
            <p style={{ fontSize: '13.5px', color: '#8a93a3', margin: '0 0 22px', lineHeight: 1.5 }}>For makers collecting real demand.</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '2px' }}>
              <span style={{ fontFamily: newsreaderStyle, fontSize: '44px', fontWeight: 500, color: '#171a21' }}>${annual ? '7' : '9'}</span>
              <span style={{ fontSize: '14px', color: '#9aa2b1' }}>/ mo</span>
            </div>
            <div style={{ fontSize: '12.5px', color: '#9aa2b1', marginBottom: '18px' }}>{annual ? 'billed annually' : 'billed monthly'}</div>
            <a href={`/register?plan=pro&cycle=${billing}`} style={{ display: 'block', textAlign: 'center', textDecoration: 'none', background: '#394be8', color: '#fff', fontWeight: 600, fontSize: '14px', padding: '12px', borderRadius: '10px', marginBottom: '24px', boxShadow: '0 1px 2px rgba(57,75,232,.25)' }}>
              Start 14-day trial
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {features.pro.map((f, i) => (
                <div key={f} style={{ display: 'flex', gap: '9px', alignItems: 'center', fontSize: '14px', color: i === 0 ? '#171a21' : '#5c6573', fontWeight: i === 0 ? 600 : 400 }}>
                  <Check />{f}
                </div>
              ))}
            </div>
          </div>

          {/* Studio */}
          <div style={{ background: '#fff', border: '1px solid #ebedf1', borderRadius: '18px', padding: '30px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#171a21', marginBottom: '6px' }}>Studio</div>
            <p style={{ fontSize: '13.5px', color: '#8a93a3', margin: '0 0 22px', lineHeight: 1.5 }}>For small teams shipping together.</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '2px' }}>
              <span style={{ fontFamily: newsreaderStyle, fontSize: '44px', fontWeight: 500, color: '#171a21' }}>${annual ? '23' : '29'}</span>
              <span style={{ fontSize: '14px', color: '#9aa2b1' }}>/ mo</span>
            </div>
            <div style={{ fontSize: '12.5px', color: '#9aa2b1', marginBottom: '18px' }}>{annual ? 'billed annually' : 'billed monthly'}</div>
            <a href={`/register?plan=studio&cycle=${billing}`} style={{ display: 'block', textAlign: 'center', textDecoration: 'none', border: '1px solid #e4e7ec', color: '#1b1f27', fontWeight: 600, fontSize: '14px', padding: '11px', borderRadius: '10px', marginBottom: '24px' }}>
              Start free trial
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {features.studio.map((f, i) => (
                <div key={f} style={{ display: 'flex', gap: '9px', alignItems: 'center', fontSize: '14px', color: i === 0 ? '#171a21' : '#5c6573', fontWeight: i === 0 ? 600 : 400 }}>
                  <Check />{f}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  { q: 'What exactly is a wishlist?', a: 'Post an idea you might build, and visitors can upvote it and leave an email. You learn what people actually want, and you get a warm list to notify the day it ships.' },
  { q: 'Is there really a free plan?', a: 'Yes. The Free plan gives you a public page, up to five projects, and one wishlist idea — no credit card, ever. Upgrade only if you outgrow it.' },
  { q: 'Can I use my own domain?', a: 'On Pro and Studio you can point any custom domain at your page. SSL and link previews are handled automatically.' },
  { q: 'How do the live metrics work?', a: 'Connect GitHub, Stripe, or your analytics once and Vuala keeps stars, revenue, and traffic current on your page. You choose what stays public.' },
  { q: 'Can I export my data?', a: 'Always. Export your page, projects, wishlist votes, and captured emails as CSV or JSON whenever you like. No lock-in.' },
  { q: 'Who is Vuala for?', a: 'Indie developers, designers, and small studios — anyone who ships things and wants a calm place to show them and gauge what to build next.' },
]

function FaqSection() {
  const [open, setOpen] = useState<number>(0)

  return (
    <section id="faq" style={{ background: '#fff', borderTop: '1px solid #f0f1f4' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '96px 28px', display: 'grid', gridTemplateColumns: '0.74fr 1.26fr', gap: '60px', alignItems: 'start' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#394be8', letterSpacing: '0.02em' }}>FAQ</span>
          <h2 style={{ fontFamily: newsreaderStyle, fontSize: '36px', lineHeight: 1.12, letterSpacing: '-0.01em', fontWeight: 500, margin: '12px 0 14px', color: '#171a21' }}>Good questions.</h2>
          <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#8a93a3', margin: 0 }}>
            Email <span style={{ color: '#394be8', fontWeight: 600 }}>hey@vuala.dev</span> and a real person replies.
          </p>
        </div>
        <div style={{ borderTop: '1px solid #f0f1f4' }}>
          {FAQ_ITEMS.map(({ q, a }, i) => (
            <div key={q} style={{ borderBottom: '1px solid #f0f1f4' }}>
              <button
                onClick={() => setOpen(o => o === i ? -1 : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', background: 'none', border: 'none', cursor: 'pointer', padding: '21px 0', textAlign: 'left', fontFamily: 'inherit' }}
              >
                <span style={{ fontSize: '16.5px', fontWeight: 600, color: '#171a21' }}>{q}</span>
                <span style={{ flexShrink: 0, color: '#9aa2b1' }}>
                  <PlusMinusIcon open={open === i} />
                </span>
              </button>
              {open === i && (
                <p style={{ margin: 0, padding: '0 0 22px', fontSize: '14.5px', lineHeight: 1.65, color: '#5c6573', maxWidth: '640px' }}>{a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCta() {
  const router = useRouter()
  const [username, setUsername] = useState('')

  const claimIt = (e: React.FormEvent) => {
    e.preventDefault()
    const params = username.trim() ? `?username=${encodeURIComponent(username.trim())}` : ''
    router.push(`/register${params}`)
  }

  return (
    <section id="cta" style={{ background: '#fbfbfc' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '30px 28px 100px' }}>
        <div style={{ background: 'linear-gradient(160deg,#f3f5fd 0%,#eef1fd 100%)', border: '1px solid #e3e8fb', borderRadius: '24px', padding: '72px 40px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: newsreaderStyle, fontSize: '46px', lineHeight: 1.08, letterSpacing: '-0.015em', fontWeight: 500, margin: '0 0 16px', color: '#171a21' }}>
            Give your work a calm home.
          </h2>
          <p style={{ fontSize: '18px', lineHeight: 1.6, color: '#5c6573', margin: '0 auto 32px', maxWidth: '500px' }}>
            Showcase what you&apos;ve built, collect wishlists for what&apos;s next, and share one link. Free to start.
          </p>
          <form onSubmit={claimIt} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#fff', border: '1px solid #e0e5fb', borderRadius: '13px', padding: '6px 6px 6px 16px', maxWidth: '430px', margin: '0 auto', boxShadow: '0 1px 2px rgba(20,24,40,.04),0 14px 36px -18px rgba(57,75,232,.3)' }}>
            <span style={{ fontSize: '15px', color: '#9aa2b1', whiteSpace: 'nowrap' }}>vuala.dev/</span>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourname" style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '15px', color: '#1b1f27', padding: '9px 0', fontWeight: 500 }} />
            <button type="submit" style={{ border: 'none', background: '#394be8', color: '#fff', fontFamily: 'inherit', fontWeight: 600, fontSize: '14px', padding: '11px 18px', borderRadius: '9px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Claim it
            </button>
          </form>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '22px', marginTop: '22px', fontSize: '13px', color: '#8a93a3', flexWrap: 'wrap' }}>
            {['Free forever plan', 'No credit card', 'Export anytime'].map(item => (
              <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div style={{ fontFamily: "var(--font-plus-jakarta, 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif)", color: '#1b1f27', background: '#fbfbfc', WebkitFontSmoothing: 'antialiased', lineHeight: 1.55 }}>
      <SiteHeader />
      <HeroSection />
      <PageSection />
      <WishlistsDashboardSection />
      <WishlistSpotlight />
      <HighlightsStrip />
      <InboxSection />
      <RoadmapSection />
      <AnalyticsSection />
      <HowItWorks />
      <PricingSection />
      <FaqSection />
      <FinalCta />
      <SiteFooter />
    </div>
  )
}
