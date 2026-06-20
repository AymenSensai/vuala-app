'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth'
import {
  Check, Copy, Download, Heart,
  ChevronDown, Mail, Plus, Search, Send, Star, TrendingUp, Trophy, X,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lead {
  id: string
  name: string
  email: string
  contact_status?: ContactStatus
  joined_source?: string
  product: { id: string; title: string; type: string } | null
  created_at: string
}

interface Analytics {
  summary: { total_visitors: number; wishlists: number }
}

type ContactStatus = 'new' | 'contacted' | 'invited'
interface FacetItem { key: string; label: string; count: number; dot?: string }

// ─── Constants ────────────────────────────────────────────────────────────────

const SOURCE_META: Record<string, { label: string; dot: string }> = {
  twitter:    { label: 'Twitter/X',  dot: '#0f1419' },
  youtube:    { label: 'YouTube',    dot: '#e0382f' },
  direct:     { label: 'Direct',     dot: '#394be8' },
  newsletter: { label: 'Newsletter', dot: '#0e9f6e' },
  instagram:  { label: 'Instagram',  dot: '#c2418f' },
}

function getSourceMeta(source?: string): { label: string; dot: string } {
  if (!source) return SOURCE_META.direct
  const low = source.toLowerCase()
  if (low.includes('twitter') || low.includes('x.com') || low === 'x') return SOURCE_META.twitter
  if (low.includes('youtube')) return SOURCE_META.youtube
  if (low.includes('newsletter') || low.includes('substack')) return SOURCE_META.newsletter
  if (low.includes('instagram')) return SOURCE_META.instagram
  if (low === 'direct') return SOURCE_META.direct
  return { label: source, dot: '#8b909d' }
}

const STATUS_META: Record<ContactStatus, { label: string; cls: string; dotCls: string }> = {
  new:       { label: 'New',       cls: 'text-[#394be8] border-[#d9ddf9] bg-[#f4f5fe]', dotCls: 'bg-[#394be8]' },
  contacted: { label: 'Contacted', cls: 'text-[#92600a] border-[#f2e3c4] bg-[#fdf7ec]', dotCls: 'bg-[#dd9a14]' },
  invited:   { label: 'Invited',   cls: 'text-[#1f7a4d] border-[#d2eadd] bg-[#eff8f2]', dotCls: 'bg-[#27a567]' },
}
const AVATAR_TONES = ['#eef0fd', '#fdf0ee', '#eef7f1', '#f7f1ee', '#f0eefa', '#eef5f7']
const AVATAR_INKS  = ['#394be8', '#c2542f', '#1f7a4d', '#8a5a2f', '#6b46c1', '#2f7a8a']
const WISHLIST_PAGE_SIZE = 10
const RECENT_CUTOFF = Date.now() - 7 * 24 * 60 * 60 * 1000

function getAvatar(name: string) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997
  const idx = h % AVATAR_TONES.length
  return { initials, bg: AVATAR_TONES[idx], color: AVATAR_INKS[idx] }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const { initials, bg, color } = getAvatar(name)
  return (
    <span
      className="inline-grid place-items-center w-6 h-6 rounded-full text-[9.5px] font-bold mr-2 shrink-0 align-middle"
      style={{ background: bg, color }}
    >
      {initials}
    </span>
  )
}

function SourceBadge({ source }: { source?: string }) {
  const meta = getSourceMeta(source)
  return (
    <span className="inline-flex items-center gap-[6px] text-[12px] font-medium px-[9px] py-[2px] rounded-full border bg-[#f7f8fa] border-[#e8eaee] text-[#424754]">
      <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: meta.dot }} />
      {meta.label}
    </span>
  )
}

function FacetDropdown({
  label,
  emptyLabel,
  items,
  activeKey,
  onSelect,
}: {
  label: string
  emptyLabel: string
  items: FacetItem[]
  activeKey: string | null
  onSelect: (key: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const selected = items.find((item) => item.key === activeKey)

  useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  return (
    <div ref={rootRef} className="relative w-[232px] min-w-[232px] max-[960px]:w-full max-[960px]:min-w-0">
        <button
          type="button"
          onClick={() => setOpen((curr) => !curr)}
          aria-expanded={open}
        className="w-full h-[32px] flex items-center justify-between gap-2 rounded-[8px] border border-[#e6e8ec] bg-white px-[10px] text-left text-[13px] text-[#15171f] outline-none"
        >
        <span className="min-w-0 truncate">{selected?.label ?? label}</span>
        <ChevronDown className={`w-[14px] h-[14px] text-[#8b909d] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 w-full overflow-hidden rounded-[10px] border border-[#e6e8ec] bg-white shadow-[0_12px_32px_rgba(16,24,40,0.12)]">
          <button
            type="button"
            onClick={() => { onSelect(null); setOpen(false) }}
            className={`flex w-full items-center justify-between gap-2 px-[10px] py-[9px] text-left text-[13px] transition-colors ${activeKey == null ? 'bg-[#f4f5fe] text-[#394be8]' : 'text-[#15171f] hover:bg-[#f7f8fa]'}`}
          >
            <span className="truncate">{emptyLabel}</span>
            {activeKey == null && <Check className="w-[13px] h-[13px] text-[#394be8] shrink-0" />}
          </button>

          <div className="max-h-[260px] overflow-auto border-t border-[#eef0f3]">
            {items.map((item) => {
              const active = activeKey === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => { onSelect(item.key); setOpen(false) }}
                  className={`flex w-full items-center justify-between gap-2 px-[10px] py-[9px] text-left text-[13px] transition-colors ${active ? 'bg-[#f4f5fe] text-[#394be8]' : 'text-[#15171f] hover:bg-[#f7f8fa]'}`}
                >
                  <span className="flex min-w-0 items-center gap-[7px] truncate">
                    {item.dot && <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: item.dot }} />}
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[11px] text-[#8b909d]">{item.count}</span>
                    {active && <Check className="w-[13px] h-[13px] text-[#394be8]" />}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function BulkBar({ count, onClear, onContacted, onInvited, onExport }: {
  count: number; onClear: () => void; onContacted: () => void; onInvited: () => void; onExport: () => void
}) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[900] bg-[#15171f] text-white rounded-[12px] px-[10px] py-2 flex items-center gap-2 flex-wrap shadow-[0_12px_32px_rgba(16,24,40,0.28)] text-[12.5px] max-w-[calc(100vw-24px)]">
      <span className="font-semibold px-1 whitespace-nowrap">{count} selected</span>
      <button type="button" onClick={onClear}
        className="inline-flex items-center gap-1 border-0 bg-transparent cursor-pointer text-[#a3a8b8] text-[12px] px-[6px] py-1 rounded-[6px] hover:text-white transition-colors">
        <X className="w-3 h-3" /> Clear
      </button>
      <span className="w-px h-4 bg-white/20" />
      <button type="button" onClick={onContacted}
        className="inline-flex items-center gap-[6px] bg-white/[0.08] border border-white/10 text-white rounded-[8px] px-[10px] py-[5px] text-[12.5px] font-medium cursor-pointer hover:bg-white/[0.15] transition-colors whitespace-nowrap">
        <Mail className="w-[13px] h-[13px]" /> Mark contacted
      </button>
      <button type="button" onClick={onInvited}
        className="inline-flex items-center gap-[6px] bg-white/[0.08] border border-white/10 text-white rounded-[8px] px-[10px] py-[5px] text-[12.5px] font-medium cursor-pointer hover:bg-white/[0.15] transition-colors whitespace-nowrap">
        <Send className="w-[13px] h-[13px]" /> Mark invited
      </button>
      <button type="button" onClick={onExport}
        className="inline-flex items-center gap-[6px] bg-[#394be8] border border-[#394be8] text-white rounded-[8px] px-[10px] py-[5px] text-[12.5px] font-medium cursor-pointer hover:bg-[#4a5bf0] transition-colors whitespace-nowrap">
        <Download className="w-[13px] h-[13px]" /> Export selected
      </button>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function WishlistsPage() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [productFilter, setProductFilter] = useState<string | null>(null)
  const [sourceFilter, setSourceFilter] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    Promise.all([api.get('/leads'), api.get('/analytics')])
      .then(([leadsRes, analyticsRes]) => {
        setLeads(leadsRes.data)
        setAnalytics(analyticsRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }

  // ── Filter pipeline ────────────────────────────────────────────────────────

  const q = search.trim().toLowerCase()
  const matchSearch = (r: Lead) =>
    !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) ||
    (r.product?.title ?? '').toLowerCase().includes(q) ||
    getSourceMeta(r.joined_source).label.toLowerCase().includes(q)

  const matchProduct = (r: Lead, p: string | null) => p == null || r.product?.title === p
  const matchSource  = (r: Lead, s: string | null) => s == null || getSourceMeta(r.joined_source).label === s

  type FilterOpts = Partial<{ product: string | null; source: string | null }>
  const filterWith = (opts: FilterOpts) =>
    leads.filter((r) =>
      matchSearch(r) &&
      matchProduct(r,'product'in opts ? opts.product!: productFilter) &&
      matchSource(r, 'source' in opts ? opts.source! : sourceFilter)
    )

  const visible = filterWith({}).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  const totalPages = Math.max(1, Math.ceil(visible.length / WISHLIST_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * WISHLIST_PAGE_SIZE
  const pageRows = visible.slice(startIndex, startIndex + WISHLIST_PAGE_SIZE)

  // Facet items
  const productBase = filterWith({ product: null })
  const productFacets: FacetItem[] = Array.from(
    productBase.reduce((map, r) => {
      if (!r.product) return map
      map.set(r.product.title, (map.get(r.product.title) ?? 0) + 1)
      return map
    }, new Map<string, number>())
  ).map(([key, count]) => ({ key, label: key, count })).sort((a, b) => b.count - a.count)

  const sourceBase = filterWith({ source: null })
  const sourceFacets: FacetItem[] = Array.from(
    sourceBase.reduce((map, r) => {
      const m = getSourceMeta(r.joined_source)
      const prev = map.get(m.label) ?? { count: 0, dot: m.dot }
      map.set(m.label, { count: prev.count + 1, dot: m.dot })
      return map
    }, new Map<string, { count: number; dot: string }>())
  ).map(([key, { count, dot }]) => ({ key, label: key, count, dot })).sort((a, b) => b.count - a.count)

  // Summary stats
  const newThisWeek = leads.filter((r) => new Date(r.created_at).getTime() >= RECENT_CUTOFF).length
  const byProduct: Record<string, number> = {}
  leads.forEach((r) => { if (r.product) byProduct[r.product.title] = (byProduct[r.product.title] ?? 0) + 1 })
  const topProduct = Object.entries(byProduct).sort((a, b) => b[1] - a[1])[0]
  const totalVisitors = analytics?.summary.total_visitors ?? 0
  const conversionRate = totalVisitors > 0 ? Math.round((leads.length / totalVisitors) * 1000) / 10 : 0

  // Selection
  const visibleIds = pageRows.map((r) => r.id)
  const allSelected  = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someSelected = visibleIds.some((id) => selected.has(id))
  const toggleRow = (id: string, on: boolean) => setSelected((prev) => {
    const next = new Set(prev); if (on) next.add(id); else next.delete(id); return next
  })
  const toggleAll = (on: boolean) => setSelected(on ? new Set(visibleIds) : new Set())

  const bulkUpdateStatus = async (status: Exclude<ContactStatus, 'new'>) => {
    if (selected.size === 0) return
    const ids = Array.from(selected)
    const prev = leads
    setLeads((curr) => curr.map((r) => selected.has(r.id) ? { ...r, contact_status: status } : r))
    showToast(`Marked ${selected.size} as ${STATUS_META[status].label.toLowerCase()}`)
    setSelected(new Set())
    try { await api.patch('/leads/status', { ids, contact_status: status }) }
    catch { setLeads(prev) }
  }

  // CSV export
  const csvVal = (v: string | number) => {
    const s = String(v); return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
  }
  const exportWishlists = (rows: Lead[]) => {
    const data = [
      ['Name', 'Email', 'Wishlist item', 'Source', 'Contact status', 'Joined date'],
      ...rows.map((r) => [
        r.name, r.email, r.product?.title ?? 'General subscriber',
        getSourceMeta(r.joined_source).label,
        STATUS_META[r.contact_status ?? 'new'].label,
        new Date(r.created_at).toISOString(),
      ]),
    ]
    const csv = data.map((row) => row.map(csvVal).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'wishlists.csv'; a.click()
    URL.revokeObjectURL(url)
    showToast(`Exported ${rows.length} wishlist${rows.length !== 1 ? 's' : ''} to CSV`)
  }

  const copyStorefrontLink = () => {
    if (!user?.storefront) return
    navigator.clipboard.writeText(`${window.location.origin}/${user.storefront.username}`)
    showToast('Storefront link copied')
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-full bg-[#FCFCFD] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#394be8] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isEmpty = leads.length === 0

  return (
    <div className="min-h-full bg-[#FCFCFD] p-[18px_24px_44px_24px]">
      <div className="max-w-[1440px] mx-auto">

        {/* ── Page header ─────────────────────────────── */}
        <header className="mb-3" />

        {isEmpty ? (
          /* ── Empty state ────────────────────────────── */
          <div className="bg-white border border-[#e6e8ec] rounded-[12px] px-6 py-16 text-center">
            <div className="w-12 h-12 rounded-[12px] bg-[#eef0fd] text-[#394be8] flex items-center justify-center mx-auto mb-[18px]">
              <Heart className="w-[22px] h-[22px]" />
            </div>
            <h2 className="text-[18px] font-semibold tracking-tight text-[#15171f] mb-2">No wishlists yet</h2>
            <p className="text-[13.5px] text-[#5b606e] leading-[1.55] max-w-[420px] mx-auto">
              Create a coming-soon item, turn on wishlists, and share your storefront.
              When visitors wishlist something, they&apos;ll show up here so you know who to contact at launch.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-[22px]">
              <Link href="/dashboard/products/new"
                className="inline-flex items-center gap-[6px] text-[13px] font-semibold px-[11px] py-[6px] rounded-[8px] bg-[#394be8] text-white hover:bg-[#2f3fd1] transition-colors no-underline">
                <Plus className="w-[14px] h-[14px]" /> Create a coming-soon item
              </Link>
              <Link href="/dashboard/products"
                className="inline-flex items-center gap-[6px] text-[13px] font-semibold px-[11px] py-[6px] rounded-[8px] border border-[#e6e8ec] bg-white text-[#15171f] hover:bg-[#f4f5f7] transition-colors no-underline">
                <Heart className="w-[14px] h-[14px]" /> Enable wishlist
              </Link>
              <button type="button" onClick={copyStorefrontLink}
                className="inline-flex items-center gap-[6px] text-[13px] font-semibold px-[11px] py-[6px] rounded-[8px] border-0 bg-transparent text-[#5b606e] cursor-pointer hover:bg-[#eceef2] hover:text-[#15171f] transition-colors">
                <Copy className="w-[14px] h-[14px]" /> Copy storefront link
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Summary cards ──────────────────────────── */}
            <section className="grid grid-cols-4 gap-[10px] mb-3 max-[1100px]:grid-cols-2 max-[620px]:grid-cols-1" aria-label="Summary">
              {[
                { icon: <Heart className="w-[14px] h-[14px]" />, label: 'Total wishlists', value: String(leads.length), detail: `across ${productFacets.length} products` },
                { icon: <Star className="w-[14px] h-[14px]" />, label: 'New this week', value: `+${newThisWeek}`, detail: 'vs. last week' },
                { icon: <Trophy className="w-[14px] h-[14px]" />, label: 'Top wishlisted item', value: topProduct?.[0] ?? '—', detail: topProduct ? `${topProduct[1]} wishlists` : '', small: true },
                { icon: <TrendingUp className="w-[14px] h-[14px]" />, label: 'Visitor conversion', value: `${conversionRate}%`, detail: 'of storefront visitors wishlist' },
              ].map((card) => (
                <div key={card.label} className="bg-white rounded-[10px] border border-[#e6e8ec] px-3 py-[10px] flex gap-[10px] items-start min-w-0">
                  <div className="w-[26px] h-[26px] rounded-[7px] bg-[#eef0fd] text-[#394be8] flex items-center justify-center shrink-0">{card.icon}</div>
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-medium text-[#5b606e] mb-[1px]">{card.label}</div>
                    <div className={`font-semibold tracking-tight text-[#15171f] leading-tight ${card.small ? 'text-[13px] truncate max-w-full' : 'text-[17px]'}`}>{card.value}</div>
                    {card.detail && <div className="text-[11.5px] text-[#8b909d] mt-[1px]">{card.detail}</div>}
                  </div>
                </div>
              ))}
            </section>

            {/* ── Toolbar ─────────────────────────────────── */}
            <div className="flex items-start gap-2 flex-wrap mb-[10px]">
              <div className="relative flex-1 min-w-[220px] max-w-[320px]">
                <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#8b909d] pointer-events-none" />
                <input
                  type="text" value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search name, email, product, source…"
                  className="w-full h-[32px] pl-[30px] pr-[30px] rounded-[8px] border border-[#e6e8ec] bg-white text-[13px] text-[#15171f] placeholder:text-[#8b909d] outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => { setSearch(''); setPage(1) }}
                    aria-label="Clear search"
                    className="absolute right-[8px] top-1/2 -translate-y-1/2 border-0 bg-transparent cursor-pointer text-[#394be8] p-1 rounded-[6px]"
                  >
                    <X className="w-[13px] h-[13px]" />
                  </button>
                )}
              </div>
              <FacetDropdown
                label="Wishlist by product"
                emptyLabel="All products"
                items={productFacets}
                activeKey={productFilter}
                onSelect={(key) => { setProductFilter(key); setPage(1) }}
              />
              <FacetDropdown
                label="Wishlist by source"
                emptyLabel="All sources"
                items={sourceFacets}
                activeKey={sourceFilter}
                onSelect={(key) => { setSourceFilter(key); setPage(1) }}
              />
              {!isEmpty && (
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    disabled
                    title="Direct messaging to your wishlists is coming soon"
                    className="inline-flex items-center gap-[7px] h-[32px] text-[13px] font-semibold px-[11px] rounded-[8px] border border-[#e6e8ec] bg-white text-[#8b909d] cursor-not-allowed whitespace-nowrap"
                  >
                    <Mail className="w-[14px] h-[14px]" />
                    Contact wishlists
                    <span className="inline-flex items-center rounded-full bg-[#fdf3e3] text-[#92600a] text-[10px] font-bold uppercase tracking-[0.04em] px-[7px] py-[2px] leading-none">
                      Coming soon
                    </span>
                  </button>
                  <button type="button" onClick={() => exportWishlists(visible)}
                    className="inline-flex items-center gap-[6px] h-[32px] text-[13px] font-semibold px-[11px] rounded-[8px] border-0 cursor-pointer bg-[#394be8] text-white hover:bg-[#2f3fd1] transition-colors whitespace-nowrap">
                    <Download className="w-[14px] h-[14px]" /> Export wishlists
                  </button>
                </div>
              )}
            </div>

            {/* ── Table card ─────────────────────────────── */}
            <div className="w-full bg-white border border-[#e6e8ec] rounded-[10px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse" style={{ minWidth: 960 }}>
                  <thead>
                    <tr>
                      <th className="w-9 pl-3 pr-[2px] py-[7px] bg-[#fafbfc] border-b border-[#e6e8ec]">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={someSelected && !allSelected ? 'mixed' : allSelected}
                          onClick={() => toggleAll(!allSelected)}
                          className={`w-4 h-4 rounded-[5px] border-[1.5px] inline-grid place-items-center cursor-pointer transition-colors align-middle ${allSelected || (someSelected && !allSelected) ? 'bg-[#394be8] border-[#394be8] text-white' : 'border-[#c9cdd6] bg-white hover:border-[#394be8]'}`}
                        >
                          {someSelected && !allSelected
                            ? <span className="w-2 h-[2px] rounded-[1px] bg-white block" />
                            : allSelected ? <Check className="w-[11px] h-[11px] stroke-[3]" /> : null}
                        </button>
                      </th>
                      {['Name', 'Email', 'Wishlist item', 'Source', 'Joined'].map((col) => (
                        <th key={col} className="text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8b909d] px-3 py-[7px] bg-[#fafbfc] border-b border-[#e6e8ec] whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((lead) => (
                      <tr key={lead.id} className={`transition-colors hover:bg-[#fafbfd] ${selected.has(lead.id) ? 'bg-[#f3f4fe]' : ''}`}>
                        <td className="pl-3 pr-[2px] py-[6px] border-b border-[#f0f1f4]">
                          <button type="button" role="checkbox" aria-checked={selected.has(lead.id)}
                            onClick={(e) => { e.stopPropagation(); toggleRow(lead.id, !selected.has(lead.id)) }}
                            className={`w-4 h-4 rounded-[5px] border-[1.5px] inline-grid place-items-center cursor-pointer transition-colors align-middle ${selected.has(lead.id) ? 'bg-[#394be8] border-[#394be8] text-white' : 'border-[#c9cdd6] bg-white hover:border-[#394be8]'}`}>
                            {selected.has(lead.id) && <Check className="w-[11px] h-[11px] stroke-[3]" />}
                          </button>
                        </td>
                        <td className="px-3 py-[6px] border-b border-[#f0f1f4] text-[13px] font-semibold text-[#15171f] whitespace-nowrap">
                          <Avatar name={lead.name} />{lead.name}
                        </td>
                        <td className="px-3 py-[6px] border-b border-[#f0f1f4] font-mono text-[11.5px] text-[#5b606e] whitespace-nowrap">{lead.email}</td>
                        <td className="px-3 py-[6px] border-b border-[#f0f1f4] text-[13px] text-[#5b606e] max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {lead.product?.title ?? <span className="text-[#8b909d]">General subscriber</span>}
                        </td>
                        <td className="px-3 py-[6px] border-b border-[#f0f1f4] whitespace-nowrap"><SourceBadge source={lead.joined_source} /></td>
                        <td className="px-3 py-[6px] border-b border-[#f0f1f4] text-[12.5px] text-[#8b909d] whitespace-nowrap">
                          {new Date(lead.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                    {visible.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center px-4 py-9 text-[#8b909d] text-[13px]">
                          No wishlists match — try clearing a filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-[14px] py-2 text-[12px] text-[#8b909d] border-t border-[#f0f1f4] bg-[#fafbfc]">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span>
                    {visible.length === 0
                      ? 'Showing 0 wishlists'
                      : `Showing ${startIndex + 1}-${Math.min(startIndex + pageRows.length, visible.length)} of ${visible.length} wishlists`}
                  </span>
                  {visible.length > WISHLIST_PAGE_SIZE && (
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPage((curr) => Math.max(1, curr - 1))}
                        disabled={currentPage === 1}
                        className="h-[26px] px-[9px] rounded-[6px] border border-[#e6e8ec] bg-white text-[12px] font-medium text-[#15171f] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f7f8fa] transition-colors"
                      >
                        Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .reduce<Array<number | 'ellipsis'>>((acc, p, idx, arr) => {
                          const prev = arr[idx - 1]
                          if (idx > 0 && typeof prev === 'number' && p - prev > 1) acc.push('ellipsis')
                          acc.push(p)
                          return acc
                        }, [])
                        .map((item, idx) => (
                          item === 'ellipsis' ? (
                            <span key={`ellipsis-${idx}`} className="px-1 text-[#8b909d]">…</span>
                          ) : (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setPage(item)}
                              className={`min-w-[26px] h-[26px] px-[8px] rounded-[6px] border text-[12px] font-medium transition-colors ${currentPage === item ? 'bg-[#394be8] border-[#394be8] text-white' : 'border-[#e6e8ec] bg-white text-[#15171f] hover:bg-[#f7f8fa]'}`}
                            >
                              {item}
                            </button>
                          )
                        ))}
                      <button
                        type="button"
                        onClick={() => setPage((curr) => Math.min(totalPages, curr + 1))}
                        disabled={currentPage === totalPages}
                        className="h-[26px] px-[9px] rounded-[6px] border border-[#e6e8ec] bg-white text-[12px] font-medium text-[#15171f] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f7f8fa] transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <BulkBar
          count={selected.size}
          onClear={() => setSelected(new Set())}
          onContacted={() => bulkUpdateStatus('contacted')}
          onInvited={() => bulkUpdateStatus('invited')}
          onExport={() => exportWishlists(leads.filter((r) => selected.has(r.id)))}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1100] bg-[#15171f] text-white rounded-[8px] px-[14px] py-2 text-[12.5px] font-medium shadow-[0_8px_24px_rgba(16,24,40,0.24)]">
          {toast}
        </div>
      )}
    </div>
  )
}
