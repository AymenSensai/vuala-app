'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { Copy, Check } from 'lucide-react'

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M15.024 22C16.2771 22 17.3524 21.9342 18.2508 21.7345C19.1607 21.5323 19.9494 21.1798 20.5646 20.5646C21.1798 19.9494 21.5323 19.1607 21.7345 18.2508C21.9342 17.3524 22 16.2771 22 15.024V12C22 10.8954 21.1046 10 20 10H12C10.8954 10 10 10.8954 10 12V20C10 21.1046 10.8954 22 12 22H15.024Z" fill="currentColor" />
      <path d="M2 15.024C2 16.2771 2.06584 17.3524 2.26552 18.2508C2.46772 19.1607 2.82021 19.9494 3.43543 20.5646C4.05065 21.1798 4.83933 21.5323 5.74915 21.7345C5.83628 21.7538 5.92385 21.772 6.01178 21.789C7.09629 21.9985 8 21.0806 8 19.976L8 12C8 10.8954 7.10457 10 6 10H4C2.89543 10 2 10.8954 2 12V15.024Z" fill="currentColor" />
      <path d="M8.97597 2C7.72284 2 6.64759 2.06584 5.74912 2.26552C4.8393 2.46772 4.05062 2.82021 3.4354 3.43543C2.82018 4.05065 2.46769 4.83933 2.26549 5.74915C2.24889 5.82386 2.23327 5.89881 2.2186 5.97398C2.00422 7.07267 2.9389 8 4.0583 8H19.976C21.0806 8 21.9985 7.09629 21.789 6.01178C21.772 5.92385 21.7538 5.83628 21.7345 5.74915C21.5322 4.83933 21.1798 4.05065 20.5645 3.43543C19.9493 2.82021 19.1606 2.46772 18.2508 2.26552C17.3523 2.06584 16.2771 2 15.024 2H8.97597Z" fill="currentColor" />
    </svg>
  )
}

function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" className={className}>
      <path fill="currentColor" fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6zm10 2a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0V8zm-4 3a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0v-5zm8 3a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2z" clipRule="evenodd" />
    </svg>
  )
}

function LeadsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" className={className}>
      <path d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z" />
    </svg>
  )
}

function StoreIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" className={className}>
      <path d="M465.4 192L431.1 144L209 144L174.7 192L465.4 192zM96 212.5C96 199.2 100.2 186.2 107.9 175.3L156.9 106.8C168.9 90 188.3 80 208.9 80L431 80C451.7 80 471.1 90 483.1 106.8L532 175.3C539.8 186.2 543.9 199.2 543.9 212.5L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 212.5z" />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
    </svg>
  )
}

function InboxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" className={className}>
      <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M12 10.75C12.1989 10.75 12.3897 10.671 12.5303 10.5303L15.5303 7.53033C15.8232 7.23744 15.8232 6.76256 15.5303 6.46967C15.2374 6.17678 14.7626 6.17678 14.4697 6.46967L12.75 8.18934V2C12.75 1.58579 12.4142 1.25 12 1.25C11.5858 1.25 11.25 1.58579 11.25 2V8.18934L9.53033 6.46967C9.23744 6.17678 8.76256 6.17678 8.46967 6.46967C8.17678 6.76256 8.17678 7.23744 8.46967 7.53033L11.4697 10.5303C11.6103 10.671 11.8011 10.75 12 10.75Z" />
      <path fill="currentColor" d="M3.46447 20.5355C4.92893 22 7.28595 22 12 22C16.714 22 19.0711 22 20.5355 20.5355C21.8063 19.2647 21.9744 17.3219 21.9966 13.75H18.8397C17.8659 13.75 17.6113 13.766 17.3975 13.8644C17.1838 13.9627 17.0059 14.1456 16.3722 14.8849L15.6794 15.6933C15.1773 16.2803 14.7796 16.7453 14.2292 16.9984C13.6789 17.2515 13.067 17.2509 12.2945 17.2501H11.7055C10.933 17.2509 10.3211 17.2515 9.77076 16.9984C9.22038 16.7453 8.82271 16.2803 8.32058 15.6933L7.62784 14.8849C6.9941 14.1456 6.81622 13.9627 6.60245 13.8644C6.38869 13.766 6.13407 13.75 5.16026 13.75H2.00339C2.02561 17.3219 2.19367 19.2647 3.46447 20.5355Z" />
      <path fill="currentColor" d="M22 12C22 7.28595 22 4.92893 20.5355 3.46447C19.3253 2.25428 17.5056 2.04415 14.25 2.00767V4.87812C15.0415 4.59899 15.9579 4.77595 16.591 5.40901C17.4697 6.28769 17.4697 7.71231 16.591 8.59099L13.591 11.591C13.169 12.0129 12.5967 12.25 12 12.25C11.4033 12.25 10.831 12.0129 10.409 11.591L7.40901 8.59099C6.53033 7.71231 6.53033 6.28769 7.40901 5.40901C8.04207 4.77595 8.95851 4.59899 9.75 4.87813V2.00767C6.49436 2.04415 4.67466 2.25428 3.46447 3.46447C2 4.92893 2 7.28595 2 12L2.00001 12.25L5.29454 12.2499C6.06705 12.2491 6.67886 12.2485 7.22924 12.5016C7.77961 12.7547 8.17729 13.2197 8.67941 13.8067L9.37216 14.6151C10.0059 15.3544 10.1838 15.5373 10.3975 15.6356C10.6113 15.734 10.8659 15.75 11.8397 15.75H12.1603C13.1341 15.75 13.3887 15.734 13.6025 15.6356C13.8162 15.5373 13.9941 15.3544 14.6278 14.6151L15.3206 13.8067C15.8227 13.2197 16.2204 12.7547 16.7708 12.5016C17.3211 12.2485 17.933 12.2491 18.7055 12.2499L22 12.25L22 12Z" />
    </svg>
  )
}

function RoadmapIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className}>
      <path d="M439.4 96L448 96C483.3 96 512 124.7 512 160L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 160C128 124.7 156.7 96 192 96L200.6 96C211.6 76.9 232.3 64 256 64L384 64C407.7 64 428.4 76.9 439.4 96zM376 176C389.3 176 400 165.3 400 152C400 138.7 389.3 128 376 128L264 128C250.7 128 240 138.7 240 152C240 165.3 250.7 176 264 176L376 176zM256 320C256 302.3 241.7 288 224 288C206.3 288 192 302.3 192 320C192 337.7 206.3 352 224 352C241.7 352 256 337.7 256 320zM288 320C288 333.3 298.7 344 312 344L424 344C437.3 344 448 333.3 448 320C448 306.7 437.3 296 424 296L312 296C298.7 296 288 306.7 288 320zM288 448C288 461.3 298.7 472 312 472L424 472C437.3 472 448 461.3 448 448C448 434.7 437.3 424 424 424L312 424C298.7 424 288 434.7 288 448zM224 480C241.7 480 256 465.7 256 448C256 430.3 241.7 416 224 416C206.3 416 192 430.3 192 448C192 465.7 206.3 480 224 480z" />
    </svg>
  )
}

function PageDesignIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" className={className}>
      <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75c.616 0 1.116-.5 1.116-1.116 0-.286-.108-.55-.286-.755a1.115 1.115 0 0 1-.27-.73c0-.616.5-1.107 1.116-1.107h1.3c2.764 0 5.004-2.24 5.004-5.004 0-4.832-4.365-8.788-9.78-8.788Zm-5.4 7.65a1.35 1.35 0 1 1 0-2.7 1.35 1.35 0 0 1 0 2.7Zm3.6-3.6a1.35 1.35 0 1 1 0-2.7 1.35 1.35 0 0 1 0 2.7Zm5.4 0a1.35 1.35 0 1 1 0-2.7 1.35 1.35 0 0 1 0 2.7Zm3 4.5a1.35 1.35 0 1 1 0-2.7 1.35 1.35 0 0 1 0 2.7Z" />
    </svg>
  )
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: DashboardIcon },
  { href: '/dashboard/products', label: 'My Page', icon: StoreIcon },
  { href: '/dashboard/page-design', label: 'Page design', icon: PageDesignIcon },
  { href: '/dashboard/leads', label: 'Wishlists', icon: LeadsIcon },
  { href: '/dashboard/messages', label: 'Inbox', icon: InboxIcon },
  { href: '/dashboard/features', label: 'Roadmap', icon: RoadmapIcon },
  { href: '/dashboard/analytics', label: 'Analytics', icon: AnalyticsIcon },
  { href: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)

  const copyStoreLink = () => {
    if (!user?.storefront) return
    navigator.clipboard.writeText(`${window.location.origin}/${user.storefront.username}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#FCFCFD]">
      {/* Sidebar */}
      <aside className="w-14 bg-[#F9FAFB] border-r border-slate-100 flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="flex h-16 items-center justify-center">
          <Link href="/dashboard" title="Vuala" className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden">
            <img src="/logo.png" alt="Vuala" className="h-full w-full object-cover" />
          </Link>
        </div>

        <nav className="flex flex-1 flex-col items-center space-y-3 px-3 pb-3 pt-8">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                title={label}
                aria-label={label}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                  active
                    ? 'border border-slate-200 bg-white text-[#394BE8] shadow-sm'
                    : 'text-[#797E93] hover:text-[#394BE8]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </Link>
            )
          })}
        </nav>

        <div className="flex flex-col items-center space-y-2 p-3">
          <div
            title={user.name}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF1FF] text-sm font-black text-[#394BE8]"
          >
            {user.name[0].toUpperCase()}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-14 h-screen overflow-hidden">
        {/* Top bar */}
        <header className="bg-[#F9FAFB] border-b border-slate-100 px-6 h-14 flex items-center justify-between fixed top-0 right-0 left-14 z-20">
          <h1 className="text-base font-semibold text-slate-800">
            {navItems.find((item) => item.href === pathname)?.label ?? 'Overview'}
          </h1>
          {user.storefront && (
            <div className="flex items-center gap-1.5">
              <img src="/icon-mark.png" alt="" className="w-5 h-5 flex-shrink-0" />
              <Link
                href={`/${user.storefront.username}`}
                target="_blank"
                className="text-sm text-[#394BE8] hover:text-[#2D3BC2] font-medium transition-colors"
              >
                vuala.dev/{user.storefront.username}
              </Link>
              <button
                onClick={copyStoreLink}
                title="Copy link"
                className="ml-1 p-1 rounded text-[#394BE8] hover:text-[#2D3BC2] hover:bg-[#EEF1FF] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </header>

        <main className="h-full overflow-y-auto pt-14">
          {children}
        </main>
      </div>
    </div>
  )
}
