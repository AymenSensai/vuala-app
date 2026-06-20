'use client'

import { useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface BreakdownItem {
  label: string
  count: number
}

interface TrendMetric {
  label: string
  current: number
  previous: number
  change: number
  suffix: string
}

interface SourceConversion {
  source: string
  visitors: number
  clicks: number
  wishlists: number
  conversion_rate: number
}

interface ProductFunnel {
  product_id: string
  title: string
  visitors: number
  clicks: number
  wishlists: number
  purchases: number
  conversion_rate: number
}

interface RecentActivity {
  type: 'wishlist' | 'purchase' | 'click' | 'visit' | 'checkout'
  title: string
  detail: string
  created_at: string
}

interface WishlistInsights {
  visitor_to_wishlist_rate: number
  click_to_wishlist_rate: number
  best_converting_source: { label: string; conversion_rate: number } | null
  best_converting_product: { label: string; conversion_rate: number } | null
}

interface Analytics {
  range: { label: string; start_date: string; end_date: string }
  summary: {
    total_visitors: number
    live_visitors: number
    product_views: number
    leads_collected: number
    wishlists: number
    purchases: number
    revenue: number
  }
  daily_revenue: Array<{ date: string; revenue: string; orders: number }>
  daily_visitors: Array<{ date: string; visitors: number }>
  daily_link_clicks: Array<{ date: string; clicks: number }>
  daily_wishlists: Array<{ date: string; wishlists: number }>
  breakdowns: {
    sources: BreakdownItem[]
    countries: BreakdownItem[]
    devices: BreakdownItem[]
    browsers: BreakdownItem[]
  }
  source_conversions: SourceConversion[]
  product_funnels: ProductFunnel[]
  recent_activity: RecentActivity[]
  wishlist_insights: WishlistInsights
  trend_comparison: {
    previous_range: { start_date: string; end_date: string }
    metrics: TrendMetric[]
  }
}

interface Product {
  id: string
  title: string
  type: 'project' | 'social' | 'media'
  wishlist_count?: number
  price: number
  is_active: boolean
  wishlist_enabled: boolean
  cover_image_url: string | null
  beta_access_url: string | null
  launch_date: string | null
}

interface Storefront {
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  social_links?: Array<{ platform: string; url: string }>
}

type AudienceTab = 'Source' | 'Country' | 'Browser' | 'Device'
type RangeKey = '7d' | '14d' | '28d'

type DashboardData = {
  analytics: Analytics | null
  products: Product[]
  storefront: Storefront | null
}

const productSwatches = [
  { bg: '#EEF0FE', fg: '#394BE8' },
  { bg: '#E0F2FE', fg: '#0369A1' },
  { bg: '#FEF3C7', fg: '#B45309' },
  { bg: '#F1F5F9', fg: '#475569' },
]

const activityChip: Record<string, [string, string]> = {
  purchase: ['#ECFDF5', '#047857'],
  wishlist: ['#EEF0FE', '#394BE8'],
  checkout: ['#FFFBEB', '#B45309'],
  click: ['#F1F5F9', '#475569'],
  visit: ['#F1F5F9', '#475569'],
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.max(1, Math.round(diff / 60000))
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

function getTrendValue(metrics: TrendMetric[], label: string) {
  return metrics.find((m) => m.label === label)
}

function PulseDot({ color = '#16A34A' }: { color?: string }) {
  return (
    <span className="relative flex h-[7px] w-[7px] flex-shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: color }} />
      <span className="relative inline-flex h-[7px] w-[7px] rounded-full" style={{ background: color }} />
    </span>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({ analytics: null, products: [], storefront: null })
  const [loading, setLoading] = useState(true)
  const [visitorRange, setVisitorRange] = useState<RangeKey>('7d')
  const [audienceTab, setAudienceTab] = useState<AudienceTab>('Source')

  useEffect(() => {
    Promise.all([
      api.get('/analytics?range=28d'),
      api.get('/products'),
      api.get('/storefront'),
    ])
      .then(([analyticsRes, productsRes, storefrontRes]) => {
        setData({ analytics: analyticsRes.data, products: productsRes.data, storefront: storefrontRes.data })
      })
      .finally(() => setLoading(false))
  }, [])

  // "Live right now" decays server-side as visitor heartbeats go stale — repoll
  // periodically so it actually reflects that instead of freezing at first load.
  useEffect(() => {
    const interval = window.setInterval(() => {
      api.get('/analytics?range=28d')
        .then((res) => setData((current) => ({ ...current, analytics: res.data })))
        .catch(() => {})
    }, 20000)
    return () => window.clearInterval(interval)
  }, [])

  const analytics = data.analytics
  const liveVisitors = analytics?.summary.live_visitors ?? 0
  const totalVisitors = analytics?.summary.total_visitors ?? 0

  const dailyVisitors = useMemo(() => analytics?.daily_visitors ?? [], [analytics?.daily_visitors])
  const dailyClicks = useMemo(() => analytics?.daily_link_clicks ?? [], [analytics?.daily_link_clicks])
  const dailyWishlists = useMemo(() => analytics?.daily_wishlists ?? [], [analytics?.daily_wishlists])

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const todayVisitors = dailyVisitors.find((d) => d.date === todayKey)?.visitors ?? 0
  const todayClicks = dailyClicks.find((d) => d.date === todayKey)?.clicks ?? 0
  const todayWishlists = dailyWishlists.find((d) => d.date === todayKey)?.wishlists ?? 0

  const productMap = useMemo(() => new Map(data.products.map((p) => [p.id, p])), [data.products])
  const productRows = useMemo(
    () =>
      (analytics?.product_funnels ?? [])
        .map((item) => ({ ...item, product: productMap.get(item.product_id) }))
        .sort((a, b) => b.wishlists - a.wishlists)
        .slice(0, 4),
    [analytics, productMap],
  )

  const trend = analytics?.trend_comparison.metrics ?? []
  const visitorsTrend = getTrendValue(trend, 'Visitors')
  const wishlistsTrend = getTrendValue(trend, 'Wishlists')
  const linkClicksTrend = getTrendValue(trend, 'Link clicks')

  const visitorChartData = useMemo(() => {
    const limit = visitorRange === '7d' ? 7 : visitorRange === '14d' ? 14 : 28
    return dailyVisitors
      .slice(-limit)
      .map((d) => ({ date: fmtDate(d.date), visitors: d.visitors }))
  }, [dailyVisitors, visitorRange])

  const audienceData: Record<AudienceTab, BreakdownItem[]> = {
    Country: analytics?.breakdowns.countries ?? [],
    Browser: analytics?.breakdowns.browsers ?? [],
    Device: analytics?.breakdowns.devices ?? [],
    Source: analytics?.breakdowns.sources ?? [],
  }

  const card = 'rounded-xl border border-[#E7EAF0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] py-4 px-[18px]'
  const sectionTitle = 'text-[13px] font-semibold text-[#0F172A]'

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#394BE8] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#FCFCFD] p-[18px_24px_36px_24px]">
      <div className="grid grid-cols-12 gap-3.5">

        {/* ── Today's highlights ───────────── col 1-12 */}
        <section className={`col-span-12 ${card} flex flex-col`}>
          <div className="mb-2.5 flex items-center justify-between">
            <span className={sectionTitle}>Today</span>
            <span className="text-[11.5px] text-[#94A3B8]">Updated just now</span>
          </div>
          <div className="flex-1 grid grid-cols-4">
            {[
              { label: 'New wishlists', value: todayWishlists, trend: wishlistsTrend, accent: false },
              { label: 'New visitors', value: todayVisitors, trend: visitorsTrend, accent: false },
              { label: 'Link clicks', value: todayClicks, trend: linkClicksTrend, accent: false },
              { label: 'Live right now', value: liveVisitors, pct: 0, accent: false, isLive: true },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`flex flex-col gap-0.5 px-3 py-2.5 ${i > 0 ? 'border-l border-[#F1F5F9]' : ''}`}
              >
                <span className="text-[11.5px] font-medium text-[#64748B]">{item.label}</span>
                {item.isLive ? (
                  <div className="flex items-center gap-2">
                    <PulseDot />
                    <span className="text-[23px] font-bold leading-none tabular-nums text-[#0F172A]">{liveVisitors}</span>
                  </div>
                ) : (
                  <span className={`text-[23px] font-bold leading-none tabular-nums ${item.accent ? 'text-[#394BE8]' : 'text-[#0F172A]'}`}>
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </span>
                )}
                {item.isLive ? (
                  <span className="text-[11.5px] font-medium text-[#64748B]">visitors on your storefront</span>
                ) : (
                  <>
                    <span className={`text-[11.5px] font-semibold ${(item.trend?.change ?? 0) >= 5 ? 'text-[#16A34A]' : (item.trend?.change ?? 0) < -5 ? 'text-[#DC2626]' : 'text-[#64748B]'}`}>
                      {(item.trend?.change ?? 0) >= 0 ? '+' : ''}{(item.trend?.change ?? 0).toFixed(1)}% vs last week
                    </span>
                    <span className="text-[11px] text-[#94A3B8]">
                      Last week: {(item.trend?.previous ?? 0).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Visitors chart ───────────────── col 1-8 */}
        <section className={`col-span-8 ${card} flex flex-col gap-2`}>
          <div className="flex items-start gap-3">
            <div className="flex flex-col gap-0.5">
              <span className={sectionTitle}>Visitors</span>
              <div className="flex items-baseline gap-2">
                <span className="text-[24px] font-bold tabular-nums leading-tight tracking-[-0.02em] text-[#0F172A]">{totalVisitors.toLocaleString()}</span>
                <span className={`text-[12px] font-semibold ${(visitorsTrend?.change ?? 0) >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  {(visitorsTrend?.change ?? 0) >= 0 ? '+' : ''}{(visitorsTrend?.change ?? 0).toFixed(1)}% vs prev period
                </span>
              </div>
            </div>
            <div className="ml-auto flex gap-0.5 rounded-lg bg-[#F1F5F9] p-[3px]">
              {(['7d', '14d', '28d'] as RangeKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setVisitorRange(key)}
                  className="h-6 rounded-md px-2.5 text-[11.5px] font-semibold transition-colors"
                  style={{
                    background: visitorRange === key ? '#FFFFFF' : 'transparent',
                    color: visitorRange === key ? '#0F172A' : '#64748B',
                    boxShadow: visitorRange === key ? '0 1px 2px rgba(15,23,42,0.12)' : 'none',
                  }}
                >
                  {key.replace('d', 'D')}
                </button>
              ))}
            </div>
          </div>
          {visitorChartData.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-[12px] text-[#94A3B8]">No visitor data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={visitorChartData}>
                <defs>
                  <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#394BE8" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#394BE8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10.5, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <YAxis width={28} tick={{ fontSize: 10.5, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 7, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(15,23,42,0.1)' }}
                />
                <Area type="monotone" dataKey="visitors" stroke="#394BE8" fill="url(#visitGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* ── Recent activity ──────────────── col 9-12 */}
        <section className={`col-span-4 ${card} flex flex-col gap-2`}>
          <div className="flex items-center justify-between">
            <span className={sectionTitle}>Recent activity</span>
          </div>
          <div className="flex flex-col">
            {(analytics?.recent_activity ?? []).slice(0, 5).map((item, i) => {
              const [chipBg, chipColor] = activityChip[item.type] ?? ['#F1F5F9', '#475569']
              const tag = item.type === 'click' ? 'Click' : item.type === 'purchase' ? 'Purchase' : item.type === 'wishlist' ? 'Wishlist' : item.type === 'checkout' ? 'Checkout' : 'Visit'
              return (
                <div
                  key={`${item.type}-${item.created_at}-${i}`}
                  className="mx-[-18px] flex items-start gap-2.5 rounded-lg px-[18px] py-2"
                  style={{ background: i === 0 ? '#FAFBFF' : 'transparent' }}
                >
                  <span className="mt-0.5 flex-shrink-0 rounded-md px-1.5 py-[3px] text-[10px] font-semibold min-w-[52px] text-center"
                    style={{ background: chipBg, color: chipColor }}>{tag}</span>
                  <p className="flex-1 min-w-0 text-[12.5px] leading-snug text-[#334155]">{item.detail}</p>
                  <span className="flex-shrink-0 mt-0.5 text-[10.5px] text-[#94A3B8] tabular-nums">{timeAgo(item.created_at)}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Top products ─────────────────── col 1-8 */}
        <section className={`col-span-8 ${card} flex flex-col gap-1.5`}>
          <div className="mb-1 flex items-center justify-between">
            <span className={sectionTitle}>Top products</span>
          </div>
          <div className="grid gap-2 pb-1.5 border-b border-[#F1F5F9]"
            style={{ gridTemplateColumns: 'minmax(0,3fr) 1fr 1fr 1fr' }}>
            {['Product', 'Clicks', 'Wishlists'].map((h, i) => (
              <div key={h} className={`text-[10.5px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8] ${i > 0 ? 'text-right' : ''}`}>{h}</div>
            ))}
          </div>
          {productRows.map((product, index) => {
            const swatch = productSwatches[index % productSwatches.length]
            const title = product.product?.title ?? product.title
            const initials = title.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
            return (
              <div
                key={product.product_id}
                className="grid items-center gap-2 rounded-md border-b border-[#F6F8FA] py-2 last:border-0 hover:bg-[#FAFBFC] transition-colors"
                style={{ gridTemplateColumns: 'minmax(0,3fr) 1fr 1fr 1fr' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
                    style={{ background: swatch.bg, color: swatch.fg }}>{initials}</div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[#0F172A]">{title}</p>
                    <p className="text-[11px] text-[#94A3B8] capitalize">{product.product?.type ?? 'product'}</p>
                  </div>
                </div>
                <div className="text-right text-[12.5px] font-semibold tabular-nums text-[#0F172A]">{product.clicks.toLocaleString()}</div>
                <div className="text-right text-[12.5px] font-semibold tabular-nums text-[#0F172A]">{product.wishlists.toLocaleString()}</div>
              </div>
            )
          })}
        </section>

        {/* ── Audience ─────────────────────── col 9-12 */}
        <section className={`col-span-4 ${card} flex flex-col gap-2.5`}>
          <span className={sectionTitle}>Audience</span>
          <div className="flex gap-0.5 rounded-lg bg-[#F1F5F9] p-[3px]">
            {(['Source', 'Country', 'Browser', 'Device'] as AudienceTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setAudienceTab(tab)}
                className="flex-1 h-6 rounded-md text-[11px] font-semibold transition-colors"
                style={{
                  background: audienceTab === tab ? '#FFFFFF' : 'transparent',
                  color: audienceTab === tab ? '#0F172A' : '#64748B',
                  boxShadow: audienceTab === tab ? '0 1px 2px rgba(15,23,42,0.12)' : 'none',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            {(() => {
              const rows = audienceData[audienceTab]
              const total = rows.reduce((s, r) => s + r.count, 0)
              const max = Math.max(...rows.map((r) => r.count), 1)
              return rows.slice(0, 5).map((row) => {
                const pct = Math.round((row.count / Math.max(total, 1)) * 100)
                const barPct = Math.round((row.count / max) * 100)
                return (
                  <div key={row.label} className="flex items-center gap-2.5">
                    <span className="w-24 flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-semibold text-[#334155]">{row.label}</span>
                    <div className="flex-1 h-[5px] rounded-full bg-[#EEF1F5]">
                      <div className="h-[5px] rounded-full bg-[#394BE8]" style={{ width: `${Math.max(8, barPct)}%` }} />
                    </div>
                    <span className="w-9 text-right text-[12px] font-semibold tabular-nums text-[#475569]">{pct}%</span>
                  </div>
                )
              })
            })()}
          </div>
        </section>

      </div>
    </div>
  )
}
