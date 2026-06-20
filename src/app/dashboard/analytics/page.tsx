'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import api from '@/lib/api'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChevronDown, Download, MousePointerClick, Star } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface BreakdownItem { label: string; count: number }
interface ReferrerItem extends BreakdownItem { domain: string }
interface TopLink { product_id: string | null; title: string; clicks: number; visitors: number }
interface TopWishlist { product_id: string | null; title: string; wishlists: number }
interface SourceConversion { source: string; visitors: number; clicks: number; wishlists: number; conversion_rate: number }
interface UtmCampaign { source: string; medium: string; campaign: string; visitors: number; clicks: number; wishlists: number; conversion_rate: number }
interface ProductFunnel { product_id: string; title: string; visitors: number; clicks: number; wishlists: number; conversion_rate: number }
interface LiveVisitor { visitor_id: string; page: string; source: string; device: string; country: string; last_seen: string }
interface WishlistInsights {
  visitor_to_wishlist_rate: number; click_to_wishlist_rate: number
  best_converting_source: { label: string; conversion_rate: number } | null
  best_converting_product: { label: string; conversion_rate: number } | null
}
interface TrendMetric { label: string; current: number; previous: number; change: number; suffix: string }
interface Analytics {
  range: { label: string; start_date: string; end_date: string }
  summary: { total_visitors: number; live_visitors: number; product_views: number; leads_collected: number; wishlists: number; purchases: number; revenue: number }
  daily_revenue: Array<{ date: string; revenue: string; orders: number }>
  daily_visitors: Array<{ date: string; visitors: number }>
  daily_link_clicks: Array<{ date: string; clicks: number }>
  daily_wishlists: Array<{ date: string; wishlists: number }>
  breakdowns: {
    sources: BreakdownItem[]; countries: BreakdownItem[]; devices: BreakdownItem[]
    browsers: BreakdownItem[]; wishlist_sources: BreakdownItem[]; link_devices: BreakdownItem[]
    utm_sources: BreakdownItem[]; utm_mediums: BreakdownItem[]; utm_campaigns: BreakdownItem[]
    referrers: ReferrerItem[]
  }
  source_conversions: SourceConversion[]
  utm_campaigns: UtmCampaign[]
  product_funnels: ProductFunnel[]
  live_visitors: LiveVisitor[]
  wishlist_insights: WishlistInsights
  conversion_alerts: string[]
  trend_comparison: { previous_range: { start_date: string; end_date: string }; metrics: TrendMetric[] }
  top_countries: BreakdownItem[]
  top_links: TopLink[]
  top_wishlists: TopWishlist[]
}

type DateRangeKey = 'today' | '7d' | '30d' | 'custom'
type SortDir = 1 | -1
interface SortState { key: string; dir: SortDir }

// ─── Constants ───────────────────────────────────────────────────────────────

const CARD = 'rounded-[10px] border border-[#e6e8ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]'

const SRC_COLOR: Record<string, string> = {
  YouTube: '#cd4a4a', Instagram: '#bd549c', Direct: '#7c8596',
  'X (Twitter)': '#2a3038', TikTok: '#1d96a3', Substack: '#d08140', Google: '#4a7fc9',
}

const SERIES_COLOR = { visitors: '#394BE8', clicks: '#1893a8', wishlists: '#cf5e88' }

const DEVICE_COLOR = ['#394BE8', '#1893a8', '#cf5e88', '#7c8596']
const BROWSER_COLOR = ['#394BE8', '#1893a8', '#cf5e88', '#d08140', '#7c8596']
const COUNTRY_COLOR = '#394BE8'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function csvValue(value: string | number) {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows.map((row) => row.map(csvValue).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = filename; link.click()
  URL.revokeObjectURL(url)
}

function sortRows<T>(rows: T[], sort: SortState): T[] {
  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sort.key]
    const bv = (b as Record<string, unknown>)[sort.key]
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sort.dir
    return String(av).localeCompare(String(bv)) * sort.dir
  })
}

function mkPct(items: BreakdownItem[]) {
  const total = items.reduce((s, i) => s + i.count, 0)
  return (count: number) => total > 0 ? Math.round((count / total) * 100) : 0
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SortHeader({ label, sortKey, sort, onSort, align = 'right' }: {
  label: string; sortKey: string; sort: SortState
  onSort: (k: string) => void; align?: 'left' | 'right'
}) {
  const active = sort.key === sortKey
  const arrow = active ? (sort.dir === -1 ? ' ↓' : ' ↑') : ''
  return (
    <div
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 px-[10px] py-2 text-[10.5px] font-bold uppercase tracking-[0.5px] cursor-pointer select-none whitespace-nowrap ${active ? 'text-[#394BE8]' : 'text-[#6b7484]'} ${align === 'right' ? 'justify-end' : ''}`}
    >
      {label}<span className="text-[10px]">{arrow}</span>
    </div>
  )
}

function BreakdownBar({ items, colors }: { items: BreakdownItem[]; colors: string[] }) {
  const pct = mkPct(items)
  return (
    <div className="flex flex-col gap-[10px] mt-3">
      {items.map((item, i) => (
        <div key={item.label} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[12.5px] font-semibold text-[#303849]">{item.label}</span>
            <span className="flex gap-2 items-baseline">
              <span className="font-mono text-[12px] text-[#1b2230]">{item.count.toLocaleString()}</span>
              <span className="font-mono text-[11px] text-[#9aa2b1] min-w-[34px] text-right">{pct(item.count)}%</span>
            </span>
          </div>
          <div className="h-[5px] rounded-[3px] bg-[#edeff5] overflow-hidden">
            <div className="h-full rounded-[3px]" style={{ width: `${pct(item.count)}%`, background: colors[i % colors.length] }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<DateRangeKey>('30d')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const [seriesOn, setSeriesOn] = useState({ visitors: true, clicks: true, wishlists: true })
  const [srcSort, setSrcSort] = useState<SortState>({ key: 'visitors', dir: -1 })
  const [funSort, setFunSort] = useState<SortState>({ key: 'visitors', dir: -1 })
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const params = new URLSearchParams({ range })
    if (range === 'custom' && customStart && customEnd) {
      params.set('start_date', customStart)
      params.set('end_date', customEnd)
    }
    api.get(`/analytics?${params.toString()}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [range, customStart, customEnd])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const timelineData = useMemo(() => {
    const rows = new Map<string, { date: string; visitors: number; clicks: number; wishlists: number }>()
    data?.daily_visitors.forEach((item) => rows.set(item.date, { date: item.date, visitors: item.visitors, clicks: 0, wishlists: 0 }))
    data?.daily_link_clicks.forEach((item) => {
      const row = rows.get(item.date) ?? { date: item.date, visitors: 0, clicks: 0, wishlists: 0 }
      row.clicks = item.clicks; rows.set(item.date, row)
    })
    data?.daily_wishlists.forEach((item) => {
      const row = rows.get(item.date) ?? { date: item.date, visitors: 0, clicks: 0, wishlists: 0 }
      row.wishlists = item.wishlists; rows.set(item.date, row)
    })
    return Array.from(rows.values()).sort((a, b) => a.date.localeCompare(b.date)).map((item) => ({ ...item, date: formatDate(item.date) }))
  }, [data])

  const sortedSources = useMemo(() => sortRows(data?.source_conversions ?? [], srcSort), [data, srcSort])
  const sortedFunnels = useMemo(() => sortRows(data?.product_funnels ?? [], funSort), [data, funSort])

  function toggleSort(setter: (s: SortState) => void, current: SortState, key: string) {
    setter(current.key === key ? { key, dir: (current.dir * -1) as SortDir } : { key, dir: -1 })
  }

  // Export helpers
  function exportTimeline() {
    if (!data) return
    const dates = new Map<string, { visitors: number; clicks: number; wishlists: number }>()
    data.daily_visitors.forEach((item) => dates.set(item.date, { visitors: item.visitors, clicks: 0, wishlists: 0 }))
    data.daily_link_clicks.forEach((item) => { const row = dates.get(item.date) ?? { visitors: 0, clicks: 0, wishlists: 0 }; row.clicks = item.clicks; dates.set(item.date, row) })
    data.daily_wishlists.forEach((item) => { const row = dates.get(item.date) ?? { visitors: 0, clicks: 0, wishlists: 0 }; row.wishlists = item.wishlists; dates.set(item.date, row) })
    downloadCsv('vuala-daily-timeline.csv', [['Date', 'Visitors', 'Link clicks', 'Wishlists'], ...Array.from(dates.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, row]) => [date, row.visitors, row.clicks, row.wishlists])])
  }
  function exportSources() {
    if (!data) return
    downloadCsv('vuala-source-performance.csv', [['Source', 'Visitors', 'Link clicks', 'Wishlists', 'Conversion rate'], ...data.source_conversions.map((s) => [s.source, s.visitors, s.clicks, s.wishlists, `${s.conversion_rate}%`])])
  }
  function exportProductFunnel() {
    if (!data) return
    downloadCsv('vuala-product-funnel.csv', [['Product', 'Visitors', 'Link clicks', 'Wishlists', 'Conversion rate'], ...data.product_funnels.map((p) => [p.title, p.visitors, p.clicks, p.wishlists, `${p.conversion_rate}%`])])
  }
  function exportCountries() {
    if (!data) return
    downloadCsv('vuala-country-breakdown.csv', [['Country', 'Visitors'], ...data.top_countries.map((c) => [c.label, c.count])])
  }

  if (loading && !data) {
    return (
      <div className="min-h-full bg-[#FCFCFD] flex items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#394BE8] border-t-transparent" />
      </div>
    )
  }

  const srcMaxConv = Math.max(...(data?.source_conversions.map((s) => s.conversion_rate) ?? [1]))
  const cntTotal = data?.top_countries.reduce((s, c) => s + c.count, 0) ?? 1

  return (
    <div className="min-h-full bg-[#FCFCFD] p-[18px_24px_44px_24px]">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-3">

        {/* ── Date range bar ───────────────────────────── */}
        <div className={`${CARD} px-3 py-[9px] flex items-center flex-wrap gap-3`}>
          <div className="flex bg-[#f0f2f6] rounded-[9px] p-[3px] gap-[2px]">
            {([
              { key: 'today' as DateRangeKey, label: 'Today' },
              { key: '7d' as DateRangeKey, label: '7 days' },
              { key: '30d' as DateRangeKey, label: '30 days' },
              { key: 'custom' as DateRangeKey, label: 'Custom' },
            ]).map((o) => (
              <button key={o.key} type="button" onClick={() => setRange(o.key)}
                className={`border-none rounded-[7px] px-3 py-[6px] text-[12.5px] font-semibold cursor-pointer transition-colors ${range === o.key ? 'bg-white text-[#1b2230] shadow-[0_1px_3px_rgba(15,23,42,0.1)]' : 'bg-transparent text-[#6b7484] hover:text-[#303849]'}`}>
                {o.label}
              </button>
            ))}
          </div>
          {range === 'custom' && (
            <div className="flex items-center gap-[6px]">
              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
                className="border border-[#dcdfe8] rounded-[7px] px-2 py-[5px] text-[12px] font-medium text-[#303849] bg-white outline-none focus:border-[#394BE8]" />
              <span className="text-[12px] text-[#8a93a3]">to</span>
              <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
                className="border border-[#dcdfe8] rounded-[7px] px-2 py-[5px] text-[12px] font-medium text-[#303849] bg-white outline-none focus:border-[#394BE8]" />
            </div>
          )}
          <div className="w-px h-[22px] bg-[#e7e9ef]" />
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-[#1b2230]">{data?.range.label}</span>
            <span className="text-[11.5px] text-[#8a93a3]">vs {data?.trend_comparison.previous_range.start_date} – {data?.trend_comparison.previous_range.end_date}</span>
          </div>
          <div className="ml-auto relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => setExportOpen((o) => !o)}
              className="flex items-center gap-[7px] bg-white border border-[#d9dde6] rounded-[8px] px-[12px] py-[7px] text-[12.5px] font-semibold text-[#303849] cursor-pointer hover:border-[#b9c0d4] hover:bg-[#fafbfd] transition-colors"
            >
              <Download className="w-[13px] h-[13px]" />
              Export
              <ChevronDown className="w-[9px] h-[9px]" />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-[252px] bg-white border border-[#e3e6ee] rounded-[10px] shadow-[0_10px_28px_rgba(15,23,42,0.13)] p-[6px] z-50">
                <div className="text-[10.5px] font-bold tracking-[0.6px] uppercase text-[#8a93a3] px-2 py-[6px] pb-1">Export analytics · CSV</div>
                {[
                  { label: 'Daily timeline', sub: 'Visitors, clicks, wishlists by day', onClick: exportTimeline },
                  { label: 'Source performance', sub: 'Traffic & conversion by source', onClick: exportSources },
                  { label: 'Product funnel', sub: 'Per-product conversion steps', onClick: exportProductFunnel },
                  { label: 'Country breakdown', sub: 'Visitors by country', onClick: exportCountries },
                ].map((item) => (
                  <button key={item.label} type="button" onClick={() => { item.onClick(); setExportOpen(false) }}
                    className="flex flex-col items-start gap-[1px] w-full text-left bg-transparent border-none rounded-[7px] px-2 py-[7px] cursor-pointer hover:bg-[#f3f5fa] transition-colors">
                    <span className="text-[12.5px] font-semibold text-[#1b2230]">{item.label}</span>
                    <span className="text-[11px] text-[#8a93a3]">{item.sub}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Summary cards ─────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          {[
            {
              label: 'VISITORS', value: data?.summary.total_visitors.toLocaleString() ?? '—', sub: `${data?.range.label ?? ''}`,
              icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#394BE8" strokeWidth="1.6" strokeLinecap="round"><circle cx="8" cy="5.2" r="2.6"/><path d="M2.8 13.8c.6-2.8 2.6-4.3 5.2-4.3s4.6 1.5 5.2 4.3"/></svg>,
              iconBg: '#eef0fd',
            },
            {
              label: 'LINK CLICKS', value: data?.summary.product_views.toLocaleString() ?? '—', sub: `${data?.range.label ?? ''}`,
              icon: <MousePointerClick className="w-[13px] h-[13px] text-[#15808f]" />,
              iconBg: '#e7f4f6',
            },
            {
              label: 'WISHLISTS', value: data?.summary.wishlists.toLocaleString() ?? '—', sub: `${data?.range.label ?? ''}`,
              icon: <Star className="w-[13px] h-[13px] text-[#c2547e]" fill="#c2547e" />,
              iconBg: '#fbeef3',
            },
          ].map((card) => (
            <div key={card.label} className={`${CARD} flex-1 min-w-[160px] px-[14px] py-3`}>
              <div className="flex items-center gap-2">
                <span className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center flex-none" style={{ background: card.iconBg }}>{card.icon}</span>
                <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-[#6b7484]">{card.label}</span>
              </div>
              <div className="mt-2 text-[23px] font-bold tracking-tight tabular-nums" style={{ color: (card as { valueColor?: string }).valueColor }}>{card.value}</div>
              <div className="mt-[1px] text-[11.5px] text-[#8a93a3]">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Timeline chart + insights ─────────────────── */}
        <div className="flex flex-wrap gap-3 items-stretch">
          <div className={`${CARD} flex-[3] min-w-0 px-4 py-[14px]`} style={{ minWidth: 0, flexBasis: 520 }}>
            <div className="flex items-start justify-between flex-wrap gap-[10px]">
              <div>
                <div className="text-[14px] font-semibold">Traffic timeline</div>
                <div className="text-[11.5px] text-[#8a93a3] mt-[1px]">Visitors, link clicks and wishlist joins</div>
              </div>
              <div className="flex gap-1 flex-wrap">
                {(Object.entries(seriesOn) as Array<[keyof typeof seriesOn, boolean]>).map(([key, on]) => (
                  <button key={key} type="button"
                    onClick={() => setSeriesOn((s) => ({ ...s, [key]: !s[key] }))}
                    className="flex items-center gap-[6px] bg-transparent border border-[#eceef3] rounded-full px-[10px] py-1 cursor-pointer hover:bg-[#f7f8fb] transition-colors text-[11.5px] font-semibold"
                    style={{ color: on ? SERIES_COLOR[key] : '#9aa2b1' }}>
                    <span className="w-2 h-2 rounded-full border-2 inline-block" style={{ background: on ? SERIES_COLOR[key] : 'transparent', borderColor: on ? SERIES_COLOR[key] : '#c5c9d4' }} />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-[10px]">
              {timelineData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-[13px] text-[#8a93a3]">No traffic data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9aa2b1' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9aa2b1' }} tickLine={false} axisLine={false} width={40} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e3e6ee', background: '#fff', color: '#1b2230', boxShadow: '0 10px 28px rgba(15,23,42,0.13)' }} labelStyle={{ color: '#6b7484', fontSize: 10.5 }} />
                    {seriesOn.visitors && <Line type="monotone" dataKey="visitors" stroke={SERIES_COLOR.visitors} strokeWidth={2} dot={false} />}
                    {seriesOn.clicks && <Line type="monotone" dataKey="clicks" stroke={SERIES_COLOR.clicks} strokeWidth={2} dot={false} />}
                    {seriesOn.wishlists && <Line type="monotone" dataKey="wishlists" stroke={SERIES_COLOR.wishlists} strokeWidth={2} dot={false} />}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className={`${CARD} flex flex-col px-4 py-[14px]`} style={{ flex: '1 1 280px', minWidth: 260 }}>
            <div className="text-[14px] font-semibold">Insights</div>
            <div className="text-[11.5px] text-[#8a93a3] mt-[1px]">What the data is telling you</div>
            <div className="mt-3 flex flex-col gap-2">
              {(data?.conversion_alerts.length ?? 0) === 0 ? (
                <div className="h-40 flex items-center justify-center text-[13px] text-[#8a93a3]">No insights yet</div>
              ) : data?.conversion_alerts.map((alert) => (
                <div key={alert} className="flex items-start gap-2 rounded-[9px] border border-[#e7eaf0] bg-[#fafbff] px-3 py-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#394BE8] flex-none" />
                  <p className="text-[12.5px] leading-snug text-[#303849]">{alert}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Traffic sources + wishlist insights ────────── */}
        <div className="flex flex-wrap gap-3 items-stretch">
          <div className={`${CARD} px-4 py-[14px]`} style={{ flex: '3 1 520px', minWidth: 0 }}>
            <div className="text-[14px] font-semibold">Top traffic sources</div>
            <div className="text-[11.5px] text-[#8a93a3] mt-[1px]">Click a column to sort</div>
            <div className="overflow-x-auto mt-2">
              <div style={{ minWidth: 580 }}>
                <div className="grid border-b border-[#e7e9ef]" style={{ gridTemplateColumns: 'minmax(150px,1.5fr) minmax(84px,1fr) minmax(84px,1fr) minmax(84px,1fr) minmax(126px,1.15fr)' }}>
                  <div className="px-[10px] py-2 text-[10.5px] font-bold uppercase tracking-[0.5px] text-[#6b7484]">Source</div>
                  <SortHeader label="Visitors" sortKey="visitors" sort={srcSort} onSort={(k) => toggleSort(setSrcSort, srcSort, k)} />
                  <SortHeader label="Clicks" sortKey="clicks" sort={srcSort} onSort={(k) => toggleSort(setSrcSort, srcSort, k)} />
                  <SortHeader label="Wishlists" sortKey="wishlists" sort={srcSort} onSort={(k) => toggleSort(setSrcSort, srcSort, k)} />
                  <SortHeader label="Conversion" sortKey="conversion_rate" sort={srcSort} onSort={(k) => toggleSort(setSrcSort, srcSort, k)} />
                </div>
                {sortedSources.length === 0 ? (
                  <div className="h-36 flex items-center justify-center text-[13px] text-[#8a93a3]">No source data yet</div>
                ) : sortedSources.map((s) => (
                  <div key={s.source} className="grid items-center border-b border-[#f1f3f7] hover:bg-[#fafbfd] transition-colors" style={{ gridTemplateColumns: 'minmax(150px,1.5fr) minmax(84px,1fr) minmax(84px,1fr) minmax(84px,1fr) minmax(126px,1.15fr)' }}>
                    <div className="flex items-center gap-2 px-[10px] py-[9px]">
                      <span className="w-2 h-2 rounded-[3px] flex-none" style={{ background: SRC_COLOR[s.source] ?? '#7c8596' }} />
                      <span className="text-[12.5px] font-semibold text-[#1b2230]">{s.source}</span>
                    </div>
                    <div className="px-[10px] py-[9px] text-right font-mono text-[12px] text-[#303849]">{s.visitors.toLocaleString()}</div>
                    <div className="px-[10px] py-[9px] text-right font-mono text-[12px] text-[#303849]">{s.clicks.toLocaleString()}</div>
                    <div className="px-[10px] py-[9px] text-right font-mono text-[12px] text-[#303849]">{s.wishlists.toLocaleString()}</div>
                    <div className="flex items-center justify-end gap-2 px-[10px] py-[9px]">
                      <span className="w-11 h-1 rounded-[2px] bg-[#edeff5] overflow-hidden inline-block">
                        <span className="block h-full rounded-[2px] bg-[#394BE8]" style={{ width: `${srcMaxConv > 0 ? Math.round((s.conversion_rate / srcMaxConv) * 100) : 0}%` }} />
                      </span>
                      <span className="font-mono text-[12px] font-semibold text-[#1b2230] min-w-[44px] text-right">{s.conversion_rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`${CARD} px-4 py-[14px]`} style={{ flex: '1.2 1 300px', minWidth: 280 }}>
            <div className="text-[14px] font-semibold">Wishlist conversion</div>
            <div className="text-[11.5px] text-[#8a93a3] mt-[1px]">How browsing turns into demand</div>
            <div className="grid grid-cols-2 gap-2 mt-[10px]">
              {data && [
                { label: 'Visitors → wishlist', value: `${data.wishlist_insights.visitor_to_wishlist_rate}%`, sub: 'Storefront visitors who joined' },
                { label: 'Clicks → wishlist', value: `${data.wishlist_insights.click_to_wishlist_rate}%`, sub: 'Link clicks that became joins' },
                { label: 'Best source', value: data.wishlist_insights.best_converting_source?.label ?? 'No data', sub: data.wishlist_insights.best_converting_source ? `${data.wishlist_insights.best_converting_source.conversion_rate}% conv.` : 'Needs more data' },
                { label: 'Best product', value: data.wishlist_insights.best_converting_product?.label ?? 'No data', sub: data.wishlist_insights.best_converting_product ? `${data.wishlist_insights.best_converting_product.conversion_rate}% conv.` : 'Needs more data' },
              ].map((ins) => (
                <div key={ins.label} className="bg-[#f7f8fe] border border-[#e3e7fa] rounded-[9px] px-3 py-[10px]">
                  <div className="text-[10.5px] font-bold tracking-[0.4px] uppercase text-[#6b7484]">{ins.label}</div>
                  <div className="text-[15.5px] font-bold tracking-tight text-[#1b2230] mt-[5px] truncate">{ins.value}</div>
                  <div className="text-[11px] text-[#8a93a3] mt-[2px]">{ins.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Product funnel ─────────────────────────────── */}
        <div className={`${CARD} px-4 py-[14px]`}>
          <div className="flex items-start justify-between flex-wrap gap-[10px]">
            <div>
              <div className="text-[14px] font-semibold">Product funnel</div>
              <div className="text-[11.5px] text-[#8a93a3] mt-[1px]">Visitors → link clicks → wishlists, per product</div>
            </div>
          </div>
          <div className="overflow-x-auto mt-2">
            <div style={{ minWidth: 720 }}>
              <div className="grid border-b border-[#e7e9ef]" style={{ gridTemplateColumns: 'minmax(190px,2fr) minmax(92px,1fr) minmax(92px,1fr) minmax(104px,1fr) minmax(104px,1fr)' }}>
                <div className="px-[10px] py-2 text-[10.5px] font-bold uppercase tracking-[0.5px] text-[#6b7484]">Product</div>
                <SortHeader label="Visitors" sortKey="visitors" sort={funSort} onSort={(k) => toggleSort(setFunSort, funSort, k)} />
                <SortHeader label="Clicks" sortKey="clicks" sort={funSort} onSort={(k) => toggleSort(setFunSort, funSort, k)} />
                <SortHeader label="Wishlists" sortKey="wishlists" sort={funSort} onSort={(k) => toggleSort(setFunSort, funSort, k)} />
                <SortHeader label="Conversion" sortKey="conversion_rate" sort={funSort} onSort={(k) => toggleSort(setFunSort, funSort, k)} />
              </div>
              {sortedFunnels.length === 0 ? (
                <div className="h-36 flex items-center justify-center text-[13px] text-[#8a93a3]">No funnel data yet</div>
              ) : sortedFunnels.map((p) => {
                const convColor = p.conversion_rate >= 10 ? '#157347' : p.conversion_rate >= 5 ? '#d08140' : '#5b6472'
                const convBg = p.conversion_rate >= 10 ? '#e4f5ec' : p.conversion_rate >= 5 ? '#fef3e2' : '#f0f2f6'
                return (
                  <div key={p.product_id} className="grid items-center border-b border-[#f1f3f7] hover:bg-[#fafbfd] transition-colors" style={{ gridTemplateColumns: 'minmax(190px,2fr) minmax(92px,1fr) minmax(92px,1fr) minmax(104px,1fr) minmax(104px,1fr)' }}>
                    <div className="px-[10px] py-[9px]">
                      <div className="text-[12.5px] font-semibold text-[#1b2230] truncate">{p.title}</div>
                    </div>
                    <div className="px-[10px] py-[9px] text-right font-mono text-[12px] text-[#303849]">{p.visitors.toLocaleString()}</div>
                    <div className="px-[10px] py-[9px] text-right font-mono text-[12px] text-[#303849]">{p.clicks.toLocaleString()}</div>
                    <div className="px-[10px] py-[9px] text-right font-mono text-[12px] text-[#303849]">{p.wishlists.toLocaleString()}</div>
                    <div className="flex justify-end px-[10px] py-[9px]">
                      <span className="font-mono text-[11.5px] font-semibold rounded-full px-2 py-[3px]" style={{ color: convColor, background: convBg }}>{p.conversion_rate}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Devices / Browsers / Countries ─────────────── */}
        <div className="flex flex-wrap gap-3 items-stretch">
          <div className={`${CARD} px-4 py-[14px]`} style={{ flex: '1 1 280px', minWidth: 250 }}>
            <div className="text-[14px] font-semibold">Devices</div>
            <BreakdownBar items={data?.breakdowns.devices ?? []} colors={DEVICE_COLOR} />
          </div>
          <div className={`${CARD} px-4 py-[14px]`} style={{ flex: '1 1 280px', minWidth: 250 }}>
            <div className="text-[14px] font-semibold">Browsers</div>
            <BreakdownBar items={data?.breakdowns.browsers ?? []} colors={BROWSER_COLOR} />
          </div>
          <div className={`${CARD} px-4 py-[14px]`} style={{ flex: '1 1 280px', minWidth: 250 }}>
            <div className="text-[14px] font-semibold">Top countries</div>
            <div className="flex flex-col gap-2 mt-3">
              {(data?.top_countries.length ?? 0) === 0 ? (
                <div className="h-32 flex items-center justify-center text-[13px] text-[#8a93a3]">No data yet</div>
              ) : data?.top_countries.map((c) => {
                const pct = Math.round((c.count / cntTotal) * 100)
                const code = c.label.slice(0, 2).toUpperCase()
                return (
                  <div key={c.label} className="flex items-center gap-[9px]">
                    <span className="font-mono text-[10px] font-bold text-[#5b6472] bg-[#f0f2f6] rounded-[4px] px-[5px] py-[2px] flex-none">{code}</span>
                    <span className="flex-1 text-[12.5px] font-medium text-[#303849] truncate">{c.label}</span>
                    <span className="w-14 h-1 rounded-[2px] bg-[#edeff5] overflow-hidden flex-none">
                      <span className="block h-full rounded-[2px]" style={{ width: `${pct}%`, background: COUNTRY_COLOR }} />
                    </span>
                    <span className="font-mono text-[12px] text-[#1b2230] min-w-[46px] text-right">{c.count.toLocaleString()}</span>
                    <span className="font-mono text-[11px] text-[#9aa2b1] min-w-[32px] text-right">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── UTM campaigns + referrers ─────────────────── */}
        <div className="flex flex-wrap gap-3 items-stretch">
          <div className={`${CARD} px-4 py-[14px]`} style={{ flex: '3 1 540px', minWidth: 0 }}>
            <div className="text-[14px] font-semibold">UTM campaigns</div>
            <div className="text-[11.5px] text-[#8a93a3] mt-[1px]">Tagged links across channels</div>
            <div className="overflow-x-auto mt-2">
              <div style={{ minWidth: 740 }}>
                <div className="grid border-b border-[#e7e9ef]" style={{ gridTemplateColumns: 'minmax(92px,1fr) minmax(92px,1fr) minmax(150px,1.5fr) minmax(76px,.9fr) minmax(76px,.9fr) minmax(80px,.9fr) minmax(86px,.9fr)' }}>
                  {['utm_source', 'utm_medium', 'utm_campaign', 'Visitors', 'Clicks', 'Wishlists', 'Conv. rate'].map((col, i) => (
                    <div key={col} className={`px-[10px] py-2 text-[10.5px] font-bold uppercase tracking-[0.5px] text-[#6b7484] ${i > 2 ? 'text-right' : ''}`}>{col}</div>
                  ))}
                </div>
                {(data?.utm_campaigns.length ?? 0) === 0 ? (
                  <div className="h-36 flex items-center justify-center text-[13px] text-[#8a93a3]">No UTM data yet</div>
                ) : data?.utm_campaigns.map((u) => (
                  <div key={`${u.source}-${u.medium}-${u.campaign}`} className="grid items-center border-b border-[#f1f3f7] hover:bg-[#fafbfd] transition-colors" style={{ gridTemplateColumns: 'minmax(92px,1fr) minmax(92px,1fr) minmax(150px,1.5fr) minmax(76px,.9fr) minmax(76px,.9fr) minmax(80px,.9fr) minmax(86px,.9fr)' }}>
                    <div className="px-[10px] py-[9px] font-mono text-[11.5px] font-semibold text-[#1b2230]">{u.source}</div>
                    <div className="px-[10px] py-[9px] font-mono text-[11.5px] text-[#5b6472]">{u.medium}</div>
                    <div className="px-[10px] py-[9px] font-mono text-[11.5px] text-[#5b6472] truncate overflow-hidden">{u.campaign}</div>
                    <div className="px-[10px] py-[9px] text-right font-mono text-[12px] text-[#303849]">{u.visitors.toLocaleString()}</div>
                    <div className="px-[10px] py-[9px] text-right font-mono text-[12px] text-[#303849]">{u.clicks.toLocaleString()}</div>
                    <div className="px-[10px] py-[9px] text-right font-mono text-[12px] text-[#303849]">{u.wishlists.toLocaleString()}</div>
                    <div className="px-[10px] py-[9px] text-right font-mono text-[12px] font-semibold text-[#1b2230]">{u.conversion_rate}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`${CARD} px-4 py-[14px]`} style={{ flex: '1.2 1 300px', minWidth: 280 }}>
            <div className="text-[14px] font-semibold">Referrers</div>
            <div className="text-[11.5px] text-[#8a93a3] mt-[1px]">Where visitors arrive from</div>
            {(data?.breakdowns.referrers.length ?? 0) === 0 ? (
              <div className="h-36 flex items-center justify-center text-[13px] text-[#8a93a3]">No referrer data yet</div>
            ) : (
              <div className="flex flex-col mt-[6px]">
                {data?.breakdowns.referrers.map((f) => {
                  const letter = f.domain.charAt(0).toUpperCase()
                  const refTotal = data.breakdowns.referrers.reduce((s, r) => s + r.count, 0)
                  const pct = refTotal > 0 ? Math.round((f.count / refTotal) * 100) : 0
                  return (
                    <div key={f.label} className="flex items-center gap-[10px] py-[7px] border-b border-[#f1f3f7]">
                      <span className="w-[22px] h-[22px] rounded-[6px] bg-[#f0f2f6] text-[#5b6472] flex items-center justify-center font-mono text-[11px] font-bold flex-none">{letter}</span>
                      <span className="flex-1 text-[12.5px] font-medium text-[#303849] truncate">{f.domain}</span>
                      <span className="font-mono text-[12px] text-[#1b2230]">{f.count.toLocaleString()}</span>
                      <span className="font-mono text-[11px] text-[#9aa2b1] min-w-[34px] text-right">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
