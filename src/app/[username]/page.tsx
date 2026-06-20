'use client'

import { type CSSProperties, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import api, { getVisitorId } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { ExternalLink, MessageSquareText, Rocket, Send, Share2, Video, X } from 'lucide-react'
import { FaInstagram, FaTiktok, FaYoutube, FaLinkedin, FaGithub, FaProductHunt, FaDiscord, FaDribbble, FaApple, FaGooglePlay, FaChrome, FaFirefox } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

interface StorefrontData {
  display_name: string
  bio: string | null
  avatar_url: string | null
  social_links: { platform: string; url: string }[]
  theme_config: Partial<PageThemeConfig> | null
  feedback_enabled: boolean
  feedback_greeting: string | null
  feedback_title: string | null
  feedback_subtitle: string | null
  feedback_types: MessageType[] | null
}

type PageSection = 'products' | 'roadmap'

type PageThemeConfig = {
  preset: 'minimal' | 'midnight' | 'cream' | 'neon' | 'rose'
  accent_color: string
  background_color: string
  card_color: string
  text_color: string
  card_style: 'soft' | 'solid' | 'glass'
  button_style: 'rounded' | 'pill' | 'square'
  layout: 'compact' | 'spacious'
  font_family: 'sans' | 'serif' | 'mono' | 'rounded'
  heading_weight: 'bold' | 'black'
  shadow_style: 'none' | 'soft' | 'bold'
  background_style: 'solid' | 'gradient'
  gradient_to: string
  gradient_angle: number
  section_order: PageSection[]
  section_visibility: { roadmap: boolean; social_links: boolean }
}

interface Product {
  id: string
  title: string
  description: string | null
  price: number
  type: 'project' | 'social' | 'media'
  cover_image_url: string | null
  file_url: string | null
  app_store_url: string | null
  play_store_url: string | null
  wishlist_enabled: boolean
  launch_date: string | null
  beta_access_url: string | null
  product_hunt_url: string | null
  wishlist_count: number
}

type RoadmapStatus = 'planned' | 'in_progress' | 'blocked' | 'shipped'

interface RoadmapItem {
  id: string
  title: string
  status: RoadmapStatus
  next_update: boolean
  target: string
  notes: string
}

interface RoadmapBoard {
  id: string
  product_id: string
  product: Pick<Product, 'id' | 'title' | 'description' | 'type'> | null
  items: RoadmapItem[]
}

const typeIcon = { project: Rocket, social: Share2, media: Video }

const roadmapStatusMeta: Record<RoadmapStatus, { label: string; cls: string }> = {
  planned: { label: 'Planned', cls: 'border-slate-200 bg-slate-50 text-slate-600' },
  in_progress: { label: 'In progress', cls: 'border-indigo-200 bg-indigo-50 text-indigo-700' },
  blocked: { label: 'Blocked', cls: 'border-amber-200 bg-amber-50 text-amber-700' },
  shipped: { label: 'Shipped', cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
}

const MESSAGE_TYPES = [
  { value: 'feedback', label: 'Feedback' },
  { value: 'feature_request', label: 'Feature request' },
  { value: 'offer', label: 'Offer' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'bug', label: 'Bug' },
  { value: 'question', label: 'Question' },
  { value: 'other', label: 'Other' },
] as const
type MessageType = (typeof MESSAGE_TYPES)[number]['value']
const MESSAGE_MAX_LENGTH = 2000

const socialIcon: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  'GitHub':       FaGithub,
  'Twitter/X':    FaXTwitter,
  'LinkedIn':     FaLinkedin,
  'YouTube':      FaYoutube,
  'Instagram':    FaInstagram,
  'TikTok':       FaTiktok,
  'Product Hunt': FaProductHunt,
  'Discord':      FaDiscord,
  'Dribbble':     FaDribbble,
}

const socialColor: Record<string, string> = {
  'GitHub':       '#24292e',
  'Twitter/X':    '#000000',
  'LinkedIn':     '#0A66C2',
  'YouTube':      '#FF0000',
  'Instagram':    '#E1306C',
  'TikTok':       '#000000',
  'Product Hunt': '#DA552F',
  'Discord':      '#5865F2',
  'Dribbble':     '#EA4C89',
}

const DEFAULT_PAGE_THEME: PageThemeConfig = {
  preset: 'minimal',
  accent_color: '#394BE8',
  background_color: '#F8FAFC',
  card_color: '#FFFFFF',
  text_color: '#0F172A',
  card_style: 'soft',
  button_style: 'rounded',
  layout: 'compact',
  font_family: 'sans',
  heading_weight: 'bold',
  shadow_style: 'soft',
  background_style: 'solid',
  gradient_to: '#E2E8F0',
  gradient_angle: 135,
  section_order: ['products', 'roadmap'],
  section_visibility: { roadmap: true, social_links: true },
}

const normalizePageTheme = (theme?: Partial<PageThemeConfig> | null): PageThemeConfig => ({
  ...DEFAULT_PAGE_THEME,
  ...(theme ?? {}),
  section_order: theme?.section_order?.length ? theme.section_order : DEFAULT_PAGE_THEME.section_order,
  section_visibility: { ...DEFAULT_PAGE_THEME.section_visibility, ...(theme?.section_visibility ?? {}) },
})

const radiusForButton = (style: PageThemeConfig['button_style']) => (
  style === 'pill' ? '999px' : style === 'square' ? '8px' : '12px'
)

const radiusForCard = (style: PageThemeConfig['card_style']) => (
  style === 'solid' ? '10px' : style === 'glass' ? '20px' : '14px'
)

const FONT_STACKS: Record<PageThemeConfig['font_family'], string> = {
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  rounded: '"SF Pro Rounded", "Varela Round", Verdana, sans-serif',
}

const HEADING_WEIGHTS: Record<PageThemeConfig['heading_weight'], number> = {
  bold: 700,
  black: 900,
}

const SHADOWS: Record<PageThemeConfig['shadow_style'], string> = {
  none: 'none',
  soft: '0 14px 40px -30px rgba(15,23,42,0.38)',
  bold: '0 20px 45px -12px rgba(15,23,42,0.45)',
}

const backgroundFor = (theme: PageThemeConfig) => (
  theme.background_style === 'gradient'
    ? `linear-gradient(${theme.gradient_angle}deg, ${theme.background_color}, ${theme.gradient_to})`
    : theme.background_color
)

export default function StorefrontPage() {
  const { username } = useParams()
  const [storefront, setStorefront] = useState<StorefrontData | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [roadmaps, setRoadmaps] = useState<RoadmapBoard[]>([])
  const [wishlistForms, setWishlistForms] = useState<Record<string, string>>({})
  const [wishlistSubmitted, setWishlistSubmitted] = useState<Record<string, boolean>>({})
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null)
  const [wishlistMenuProductId, setWishlistMenuProductId] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [messageOpen, setMessageOpen] = useState(false)
  const [messageName, setMessageName] = useState('')
  const [messageEmail, setMessageEmail] = useState('')
  const [messageType, setMessageType] = useState<MessageType>('feedback')
  const [messageBody, setMessageBody] = useState('')
  const [messageSending, setMessageSending] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  const [messageError, setMessageError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // The dashboard's Page builder embeds this same route in a live preview
  // <iframe>. That preview isn't a real visitor, so don't track it — otherwise
  // it shows up as a permanently "live" visitor and inflates traffic stats
  // every time someone opens their own page editor.
  const isEmbeddedPreview = typeof window !== 'undefined' && window.self !== window.top
  const [previewThemeOverride, setPreviewThemeOverride] = useState<Partial<PageThemeConfig> | null>(null)

  useEffect(() => {
    if (!isEmbeddedPreview) return

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== 'vuala-theme-preview') return
      setPreviewThemeOverride(event.data.theme ?? null)
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [isEmbeddedPreview])

  const clientAnalyticsMetadata = () => {
    const params = new URLSearchParams(window.location.search)

    return {
      referrer: document.referrer || undefined,
      path: window.location.pathname,
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
    }
  }

  useEffect(() => {
    api.get(`/storefront/${username}`)
      .then((r) => {
        setStorefront(r.data.storefront)
        setProducts(r.data.products)
        setRoadmaps(r.data.roadmaps ?? [])
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [username])

  useEffect(() => {
    if (isEmbeddedPreview) return

    const sendHeartbeat = () => {
      if (document.visibilityState !== 'visible') return

      api.post('/events/track', {
        username,
        event_type: 'storefront_view',
        visitor_id: getVisitorId(),
        metadata: { ...clientAnalyticsMetadata(), action: 'presence_heartbeat' },
      }).catch(() => {})
    }

    sendHeartbeat()
    const interval = window.setInterval(sendHeartbeat, 25000)
    document.addEventListener('visibilitychange', sendHeartbeat)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', sendHeartbeat)
    }
  }, [username, isEmbeddedPreview])

  const trackLinkClick = (productId: string) => {
    if (isEmbeddedPreview) return

    api.post('/events/track', {
      username,
      event_type: 'product_view',
      product_id: productId,
      visitor_id: getVisitorId(),
      metadata: { ...clientAnalyticsMetadata(), action: 'link_clicked' },
    }).catch(() => {})
  }

  const handleCheckout = async (productId: string) => {
    setCheckoutLoading(productId)
    try {
      const res = await api.post(`/checkout/${productId}`)
      window.location.assign(res.data.url)
    } catch {
      alert('Checkout failed. Please try again.')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleWishlistSubmit = async (e: React.FormEvent, productId: string) => {
    e.preventDefault()
    const email = wishlistForms[productId]?.trim()
    if (!email) return

    setWishlistLoading(productId)
    try {
      await api.post(`/storefront/${username}/leads`, { email, product_id: productId })
      setWishlistSubmitted((current) => ({ ...current, [productId]: true }))
      setWishlistForms((current) => ({ ...current, [productId]: '' }))
      setWishlistMenuProductId(null)
      setProducts((current) => current.map((product) => (
        product.id === productId
          ? { ...product, wishlist_count: product.wishlist_count + 1 }
          : product
      )))
    } catch {
      alert('Failed to join the wishlist. Please try again.')
    } finally {
      setWishlistLoading(null)
    }
  }

  const openMessageComposer = () => {
    const allowedTypes = storefront?.feedback_types?.length ? storefront.feedback_types : MESSAGE_TYPES.map((t) => t.value)
    setMessageOpen(true)
    setMessageBody('')
    setMessageName('')
    setMessageEmail('')
    setMessageType(allowedTypes[0] ?? 'feedback')
    setMessageSent(false)
    setMessageError(null)
  }

  const closeMessageComposer = () => {
    setMessageOpen(false)
    setMessageError(null)
  }

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageBody.trim() || !messageName.trim() || !messageEmail.trim()) return

    setMessageSending(true)
    setMessageError(null)
    try {
      await api.post(`/storefront/${username}/messages`, {
        name: messageName.trim(),
        email: messageEmail.trim(),
        message_type: messageType,
        message: messageBody.trim(),
        page_path: window.location.pathname,
        visitor_id: getVisitorId(),
        ...clientAnalyticsMetadata(),
      })
      setMessageSent(true)
      setMessageBody('')
    } catch (err: unknown) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setMessageError(apiMessage || 'Could not send your message. Please try again.')
    } finally {
      setMessageSending(false)
    }
  }

  const formatLaunchDate = (date: string | null) => {
    if (!date) return null
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date.slice(0, 10)}T00:00:00`))
  }

  const wishlistMenuProduct = wishlistMenuProductId
    ? products.find((product) => product.id === wishlistMenuProductId) ?? null
    : null
  const pageTheme = normalizePageTheme(previewThemeOverride ?? storefront?.theme_config)
  const pageSpacing = pageTheme.layout === 'spacious' ? 'space-y-10' : 'space-y-8'
  const cardBorderColor = pageTheme.card_style === 'glass' ? 'rgba(255,255,255,0.34)' : 'rgba(15,23,42,0.10)'

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-4xl mb-3">🤔</p>
      <h1 className="text-xl font-semibold text-slate-900">Store not found</h1>
      <p className="text-slate-500 mt-1 mb-6">vuala.dev/{username} doesn&apos;t exist</p>
      <Link href="/" className="text-indigo-600 font-medium hover:underline">← Back to home</Link>
    </div>
  )

  return (
    <div
      className="storefront-page min-h-screen"
      style={{
        '--sf-bg': backgroundFor(pageTheme),
        '--sf-card': pageTheme.card_color,
        '--sf-text': pageTheme.text_color,
        '--sf-accent': pageTheme.accent_color,
        '--sf-card-radius': radiusForCard(pageTheme.card_style),
        '--sf-button-radius': radiusForButton(pageTheme.button_style),
        '--sf-border': cardBorderColor,
        '--sf-shadow': SHADOWS[pageTheme.shadow_style],
        '--sf-font': FONT_STACKS[pageTheme.font_family],
        '--sf-heading-weight': HEADING_WEIGHTS[pageTheme.heading_weight],
      } as CSSProperties}
    >
      <style>{`
        .storefront-page {
          background: var(--sf-bg);
          color: var(--sf-text);
          font-family: var(--sf-font);
        }
        .storefront-page h1,
        .storefront-page h2 {
          font-weight: var(--sf-heading-weight);
        }
        .storefront-page .sf-card {
          background: var(--sf-card);
          border-color: var(--sf-border);
          border-radius: var(--sf-card-radius);
          box-shadow: var(--sf-shadow);
          ${pageTheme.card_style === 'glass' ? 'backdrop-filter: blur(18px); background: color-mix(in srgb, var(--sf-card) 74%, transparent);' : ''}
        }
        .storefront-page .sf-action {
          background: var(--sf-accent);
          border-color: var(--sf-accent);
          border-radius: var(--sf-button-radius);
          color: #fff;
        }
        .storefront-page .sf-action:hover {
          filter: brightness(0.94);
        }
        .storefront-page .text-slate-900,
        .storefront-page .text-slate-800,
        .storefront-page .text-slate-700 {
          color: var(--sf-text);
        }
        .storefront-page .text-indigo-600,
        .storefront-page .text-indigo-500 {
          color: var(--sf-accent);
        }
      `}</style>
      <div className={`flex max-w-2xl flex-col mx-auto px-4 py-8 ${pageSpacing}`}>

        {/* Profile header */}
        {storefront && (
          <div className="flex flex-col items-center text-center gap-3 pt-4" style={{ order: -10 }}>
            {storefront.avatar_url && (
              <img src={storefront.avatar_url} alt={storefront.display_name} className="h-28 w-28 rounded-full object-cover" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{storefront.display_name}</h1>
              {storefront.bio && (
                <p className="mt-1 text-base text-slate-700">{storefront.bio}</p>
              )}
            </div>
            {pageTheme.section_visibility.social_links && storefront.social_links.length > 0 && (
              <div className="flex items-center gap-5 mt-1">
                {storefront.social_links.map(({ platform, url }) => {
                  const Icon = socialIcon[platform]
                  if (!Icon) return null
                  return (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-60" aria-label={platform}>
                      <Icon size={28} color={socialColor[platform] ?? '#0f172a'} />
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Products */}
        {products.length > 0 && (
          <section style={{ order: pageTheme.section_order.indexOf('products') }}>
            <div className="space-y-3">
              {products.map((product) => {
                const Icon = typeIcon[product.type]

                // Social links
                if (product.type === 'social') {
                  const PlatformIcon = socialIcon[product.title]
                  return (
                    <a
                      key={product.id}
                      href={product.file_url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackLinkClick(product.id)}
                      className="sf-card border p-4 flex items-center gap-3 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.cover_image_url
                          ? <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover" />
                          : PlatformIcon
                            ? <PlatformIcon size={22} color={socialColor[product.title] ?? '#0f172a'} />
                            : <Share2 className="w-5 h-5 text-slate-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900">{product.title}</p>
                        {product.description && (
                          <p className="text-sm text-slate-400 truncate">{product.description}</p>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    </a>
                  )
                }

                // Project cards
                if (product.type === 'project') {
                  return (
                    <div
                      key={product.id}
                      className="sf-card border overflow-hidden flex hover:shadow-sm transition-shadow"
                    >
                      <div className="w-24 flex-shrink-0 self-stretch overflow-hidden bg-slate-50 relative flex items-center justify-center">
                        {product.cover_image_url
                          ? <img src={product.cover_image_url} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
                          : <Rocket className="w-6 h-6 text-slate-200" />
                        }
                      </div>
                      <div className="flex-1 p-4 flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-4">
                          <p className="font-semibold text-slate-900 truncate">{product.title}</p>
                          {product.description && (
                            <p className="text-sm text-slate-500 truncate">{product.description}</p>
                          )}
                          {!product.file_url && !product.app_store_url && !product.play_store_url && (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              {product.launch_date && <span>Launches {formatLaunchDate(product.launch_date)}</span>}
                              {product.wishlist_count > 0 && <span>{product.wishlist_count} joined</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex max-w-xs flex-shrink-0 flex-wrap justify-end gap-2">
                          {(() => {
                            const isLive = product.app_store_url || product.play_store_url || product.file_url
                            const isApple = product.app_store_url?.includes('apple.com') ?? true
                            const isGooglePlay = product.play_store_url?.includes('google.com') ?? true

                            if (isLive) return (
                              <div className="flex items-center gap-2">
                                {product.file_url && (
                                  <a href={product.file_url} target="_blank" rel="noopener noreferrer" onClick={() => trackLinkClick(product.id)}
                                    className="flex items-center gap-1.5 border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                    style={{ borderRadius: radiusForButton(pageTheme.button_style) }}>
                                    Visit website <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {product.app_store_url && (
                                  <a href={product.app_store_url} target="_blank" rel="noopener noreferrer" onClick={() => trackLinkClick(product.id)}
                                    title={isApple ? 'App Store' : 'Chrome Web Store'}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700">
                                    {isApple ? <FaApple size={18} /> : <FaChrome size={17} />}
                                  </a>
                                )}
                                {product.play_store_url && (
                                  <a href={product.play_store_url} target="_blank" rel="noopener noreferrer" onClick={() => trackLinkClick(product.id)}
                                    title={isGooglePlay ? 'Google Play' : 'Firefox Add-ons'}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700">
                                    {isGooglePlay ? <FaGooglePlay size={16} /> : <FaFirefox size={17} />}
                                  </a>
                                )}
                                {product.product_hunt_url && (
                                  <a href={product.product_hunt_url} target="_blank" rel="noopener noreferrer" onClick={() => trackLinkClick(product.id)}
                                    title="Product Hunt"
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition hover:opacity-85"
                                    style={{ backgroundColor: '#DA552F' }}>
                                    <FaProductHunt size={17} />
                                  </a>
                                )}
                              </div>
                            )

                            return (
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                {product.beta_access_url && (
                                  <a href={product.beta_access_url} target="_blank" rel="noopener noreferrer" onClick={() => trackLinkClick(product.id)}
                                    className="flex items-center gap-1.5 border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                                    style={{ borderRadius: radiusForButton(pageTheme.button_style) }}>
                                    Request beta <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {product.product_hunt_url && (
                                  <a href={product.product_hunt_url} target="_blank" rel="noopener noreferrer" onClick={() => trackLinkClick(product.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors hover:opacity-90"
                                    style={{ backgroundColor: '#DA552F' }}>
                                    <FaProductHunt size={11} color="#fff" /> Product Hunt
                                  </a>
                                )}
                                {product.wishlist_enabled ? (
                                  wishlistSubmitted[product.id] ? (
                                    <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">You are on the list</span>
                                  ) : (
                                    <button type="button" onClick={() => setWishlistMenuProductId(product.id)}
                                      className="sf-action h-8 px-3 text-xs font-medium transition-colors">
                                      Wishlist
                                    </button>
                                  )
                                ) : (
                                  <span className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">Coming soon</span>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  )
                }

                if (product.type === 'media') {
                  return (
                    <a
                      key={product.id}
                      href={product.file_url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackLinkClick(product.id)}
                      className="sf-card border overflow-hidden flex hover:shadow-sm transition-all"
                    >
                      <div className="w-24 flex-shrink-0 self-stretch overflow-hidden bg-slate-50 relative flex items-center justify-center">
                        {product.cover_image_url
                          ? <img src={product.cover_image_url} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
                          : <Video className="w-6 h-6 text-slate-200" />
                        }
                      </div>
                      <div className="flex-1 p-4 flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-4">
                          <p className="font-semibold text-slate-900 truncate">{product.title}</p>
                          {product.description && (
                            <p className="text-sm text-slate-500 truncate">{product.description}</p>
                          )}
                        </div>
                        <span className="sf-action flex flex-shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-medium">
                          View <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </a>
                  )
                }

                return (
                  <div
                    key={product.id}
                    className="sf-card border overflow-hidden flex hover:shadow-sm transition-shadow"
                  >
                    <div className="w-24 flex-shrink-0 self-stretch overflow-hidden bg-slate-50 relative flex items-center justify-center">
                      {product.cover_image_url
                        ? <img src={product.cover_image_url} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
                        : <Icon className="w-6 h-6 text-slate-200" />
                      }
                    </div>
                    <div className="flex-1 p-4 flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="font-semibold text-slate-900 truncate">{product.title}</p>
                        {product.description && (
                          <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className="font-bold text-slate-900">{formatCurrency(product.price)}</p>
                        <button
                          onClick={() => handleCheckout(product.id)}
                          disabled={checkoutLoading === product.id}
                          className="sf-action text-xs font-medium px-3 py-1.5 transition-colors disabled:opacity-60"
                        >
                          {checkoutLoading === product.id ? '…' : 'Buy now'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Shared roadmaps */}
        {pageTheme.section_visibility.roadmap && roadmaps.length > 0 && (
          <section className="space-y-3" style={{ order: pageTheme.section_order.indexOf('roadmap') }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Coming next</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">Public roadmap</h2>
            </div>

            <div className="space-y-3">
              {roadmaps.map((roadmap) => (
                <div key={roadmap.id} className="sf-card border p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{roadmap.product?.title ?? 'Roadmap'}</p>
                      {roadmap.product?.description && (
                        <p className="mt-0.5 text-sm text-slate-500">{roadmap.product.description}</p>
                      )}
                    </div>
                    <Rocket className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" />
                  </div>

                  <div className="space-y-2">
                    {roadmap.items.map((item) => {
                      const status = roadmapStatusMeta[item.status ?? 'planned']
                      return (
                        <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                              {item.notes && <p className="mt-0.5 text-sm text-slate-500">{item.notes}</p>}
                            </div>
                            <div className="flex flex-shrink-0 flex-wrap items-center gap-1.5">
                              {item.next_update && (
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">Next update</span>
                              )}
                              <span className={`rounded-full border px-2 py-1 text-[11px] font-medium ${status.cls}`}>{status.label}</span>
                            </div>
                          </div>
                          {item.target && <p className="mt-2 text-xs text-slate-400">Target {item.target}</p>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Powered by */}
        <div className="text-center" style={{ order: 10 }}>
          <Link href="/" className="text-xs text-slate-300 hover:text-slate-400 transition-colors">
            Powered by Vuala
          </Link>
        </div>
      </div>

      {storefront?.feedback_enabled !== false && (
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        {!messageOpen && (
          <span className="pointer-events-none feedback-badge rounded-full border border-slate-200 bg-white px-3 py-1 text-[12px] font-medium text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
            {storefront?.feedback_greeting || `Connect with ${username}!`}
          </span>
        )}
        <button
          type="button"
          onClick={() => (messageOpen ? closeMessageComposer() : openMessageComposer())}
          className="sf-action flex h-14 w-14 items-center justify-center rounded-full shadow-[0_14px_34px_rgba(57,75,232,0.24)] transition-transform hover:scale-[1.03]"
          aria-label="Open message form"
          >
            {messageOpen ? <X className="h-5 w-5" /> : <MessageSquareText className="h-5 w-5" />}
        </button>
      </div>
      )}

      {storefront?.feedback_enabled !== false && messageOpen && (
        <div className="fixed inset-0 z-50 bg-transparent px-4 py-4" onClick={closeMessageComposer}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="sf-card absolute bottom-20 right-4 flex w-full max-w-[390px] flex-col overflow-hidden border shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-base font-semibold text-slate-900">{storefront?.feedback_title || 'Message the creator'}</p>
                <p className="mt-1 text-sm text-slate-500">{storefront?.feedback_subtitle || 'Leave feedback, suggestions, offers, or bugs.'}</p>
              </div>
              <button
                type="button"
                onClick={closeMessageComposer}
                className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 px-4 py-4">
              {messageSent ? (
                <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-5 text-center">
                  <p className="text-base font-semibold text-emerald-900">Thanks, we&apos;ll review this.</p>
                  <p className="mt-1 text-sm text-emerald-700">Your message is now in the creator inbox.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setMessageOpen(false)
                      setMessageSent(false)
                    }}
                    className="sf-action mt-4 inline-flex h-9 items-center justify-center px-4 text-sm font-medium transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMessageSubmit} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Name</span>
                      <input
                        type="text"
                        value={messageName}
                        onChange={(e) => setMessageName(e.target.value)}
                        placeholder="Your name"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:ring-0"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
                      <input
                        type="email"
                        value={messageEmail}
                        onChange={(e) => setMessageEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:ring-0"
                      />
                    </label>
                  </div>

                  <div>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Type</span>
                    <div className="flex flex-wrap gap-1.5">
                      {MESSAGE_TYPES.filter((t) => !storefront?.feedback_types?.length || storefront.feedback_types.includes(t.value)).map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setMessageType(t.value)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            messageType === t.value
                              ? 'sf-action text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="block">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Message</span>
                      <span className={`text-xs ${messageBody.length >= MESSAGE_MAX_LENGTH ? 'text-rose-500' : 'text-slate-400'}`}>
                        {messageBody.length} / {MESSAGE_MAX_LENGTH}
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      maxLength={MESSAGE_MAX_LENGTH}
                      placeholder="Type your feedback, suggestion, offer, or question..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:ring-0"
                    />
                  </label>

                  {messageError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {messageError}
                    </div>
                  )}

                  <div className="flex justify-end pt-0.5">
                    <button
                      type="submit"
                      disabled={messageSending || !messageBody.trim() || !messageName.trim() || !messageEmail.trim()}
                      className="sf-action inline-flex h-9 items-center gap-1.5 px-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {messageSending ? (
                        <>
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                          Sending
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Send
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {wishlistMenuProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4" onClick={() => setWishlistMenuProductId(null)}>
          <form
            onSubmit={(e) => handleWishlistSubmit(e, wishlistMenuProduct.id)}
            onClick={(e) => e.stopPropagation()}
            className="sf-card w-full max-w-sm border p-4 shadow-xl"
          >
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-900">{wishlistMenuProduct.title}</p>
              <p className="mt-1 text-sm text-slate-500">Join the wishlist for launch updates.</p>
            </div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
            <input
              type="email"
              required
              autoFocus
              value={wishlistForms[wishlistMenuProduct.id] ?? ''}
              onChange={(e) => setWishlistForms((current) => ({ ...current, [wishlistMenuProduct.id]: e.target.value }))}
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
                disabled={wishlistLoading === wishlistMenuProduct.id}
                className="sf-action h-9 px-3 text-sm font-medium transition-colors disabled:opacity-60"
              >
                {wishlistLoading === wishlistMenuProduct.id ? 'Joining...' : 'Join wishlist'}
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx>{`
        .feedback-badge {
          animation: feedbackPulse 7.5s ease-in-out infinite;
        }

        @keyframes feedbackPulse {
          0%, 18%, 100% {
            opacity: 0;
            transform: translateX(4px) scale(0.98);
          }
          28%, 82% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
