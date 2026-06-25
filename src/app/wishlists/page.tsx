'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { ArrowBigUpDash, ArrowUpRight, CalendarDays, Heart } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/SiteChrome'

interface WishlistProject {
  id: string
  title: string
  description: string | null
  cover_image_url: string | null
  launch_date: string | null
  beta_access_url: string | null
  wishlist_count: number
  creator: {
    name: string
    username: string
    avatar_url: string | null
  }
}

function formatLaunchDate(date: string | null) {
  if (!date) return null
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date.slice(0, 10)}T00:00:00`))
}

export default function WishlistsPage() {
  const [projects, setProjects] = useState<WishlistProject[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlistMenuProductId, setWishlistMenuProductId] = useState<string | null>(null)
  const [wishlistForms, setWishlistForms] = useState<Record<string, string>>({})
  const [wishlistSubmitted, setWishlistSubmitted] = useState<Record<string, 'joined' | 'already'>>({})
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null)

  useEffect(() => {
    api.get('/wishlists')
      .then((res) => setProjects(res.data.products ?? []))
      .finally(() => setLoading(false))
  }, [])

  const wishlistMenuProject = wishlistMenuProductId
    ? projects.find((project) => project.id === wishlistMenuProductId) ?? null
    : null

  const handleWishlistSubmit = async (e: React.FormEvent, project: WishlistProject) => {
    e.preventDefault()
    const email = wishlistForms[project.id]?.trim()
    if (!email) return

    setWishlistLoading(project.id)
    try {
      const res = await api.post(`/storefront/${project.creator.username}/leads`, { email, product_id: project.id })
      const alreadyJoined = Boolean(res.data?.already_joined)
      setWishlistSubmitted((current) => ({ ...current, [project.id]: alreadyJoined ? 'already' : 'joined' }))
      setWishlistForms((current) => ({ ...current, [project.id]: '' }))
      setWishlistMenuProductId(null)
      if (!alreadyJoined) {
        setProjects((current) => current.map((p) => (
          p.id === project.id ? { ...p, wishlist_count: p.wishlist_count + 1 } : p
        )))
      }
    } catch {
      alert('Failed to join the wishlist. Please try again.')
    } finally {
      setWishlistLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <SiteHeader logoHref="/" sectionPrefix="/" />

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div>
          <h1 className="max-w-2xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            The most wanted upcoming projects.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-[15px]">
            Ranked by wishlist count. Open a creator page, join the list, or request beta access.
          </p>
        </div>

        <div className="mt-9">
          {loading ? (
            <div className="flex h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#394BE8] border-t-transparent" />
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <Heart className="mx-auto h-10 w-10 text-slate-200" />
              <p className="mt-3 text-lg font-bold text-slate-900">No wishlist projects found</p>
              <p className="mt-1 text-sm text-slate-500">Check back after more creators publish wishlists.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project, index) => {
                const launchDate = formatLaunchDate(project.launch_date)
                return (
                  <article key={project.id} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-center">
                    <div className="flex items-center gap-3 sm:block">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white sm:mx-auto">
                        {index + 1}
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 sm:mt-2 sm:text-center">Rank</p>
                    </div>

                    <div className="min-w-0">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          {project.cover_image_url ? (
                            <img src={project.cover_image_url} alt={project.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#394BE8]">
                              <Heart className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-bold text-slate-950">{project.title}</h2>
                          {project.description && <p className="mt-0.5 truncate text-sm text-slate-500">{project.description}</p>}
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <Link href={`/${project.creator.username}`} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700 transition hover:bg-slate-200">
                              {project.creator.avatar_url && <img src={project.creator.avatar_url} alt="" className="h-4 w-4 rounded-full object-cover" />}
                              {project.creator.name}
                            </Link>
                            {launchDate && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                                <CalendarDays className="h-3 w-3" />
                                {launchDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 sm:justify-end">
                      <div className="flex items-center gap-2">
                        {project.beta_access_url && (
                          <a href={project.beta_access_url} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                            Beta <ArrowUpRight className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      {wishlistSubmitted[project.id] ? (
                        <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                          {wishlistSubmitted[project.id] === 'already' ? 'Already on the wishlist' : 'You are on the list'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setWishlistMenuProductId(project.id)}
                          className="flex h-8 items-center gap-1.5 rounded-xl bg-[#394BE8] px-3 text-xs font-medium text-white transition-colors hover:bg-[#2f3fd1]"
                        >
                          Wishlist
                          {project.wishlist_count > 0 && <span>{project.wishlist_count}</span>}
                          <ArrowBigUpDash className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
      <SiteFooter />

      {wishlistMenuProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4" onClick={() => setWishlistMenuProductId(null)}>
          <form
            onSubmit={(e) => handleWishlistSubmit(e, wishlistMenuProject)}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-900">{wishlistMenuProject.title}</p>
              <p className="mt-1 text-sm text-slate-500">Join the wishlist for launch updates.</p>
            </div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
            <input
              type="email"
              required
              autoFocus
              value={wishlistForms[wishlistMenuProject.id] ?? ''}
              onChange={(e) => setWishlistForms((current) => ({ ...current, [wishlistMenuProject.id]: e.target.value }))}
              placeholder="you@example.com"
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWishlistMenuProductId(null)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={wishlistLoading === wishlistMenuProject.id}
                className="h-9 rounded-lg bg-[#394BE8] px-3 text-sm font-medium text-white transition-colors hover:bg-[#2f3fd1] disabled:opacity-60"
              >
                {wishlistLoading === wishlistMenuProject.id ? 'Joining...' : 'Join wishlist'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}
