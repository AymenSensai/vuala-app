'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAuth } from '@/lib/auth'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import ProductForm from '@/components/ProductForm'
import { Plus, Pencil, Trash2, Rocket, Share2, Video, X, ImageIcon, GripVertical, Package, UserCircle2, Monitor, Tablet, Smartphone } from 'lucide-react'
import { FaInstagram, FaTiktok, FaYoutube, FaLinkedin, FaGithub, FaProductHunt, FaDiscord, FaDribbble } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

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

const SOCIAL_PLATFORMS = Object.keys(socialIcon)

const SOCIAL_COLORS: Record<string, string> = {
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

const PLATFORM_DOMAINS: Record<string, string[]> = {
  'GitHub':       ['github.com'],
  'Twitter/X':    ['twitter.com', 'x.com'],
  'LinkedIn':     ['linkedin.com'],
  'YouTube':      ['youtube.com', 'youtu.be'],
  'Instagram':    ['instagram.com'],
  'TikTok':       ['tiktok.com'],
  'Product Hunt': ['producthunt.com'],
  'Discord':      ['discord.gg', 'discord.com'],
  'Dribbble':     ['dribbble.com'],
}

function validateSocialUrl(platform: string, url: string): string | null {
  if (!url.trim()) return null
  const domains = PLATFORM_DOMAINS[platform]
  if (!domains) return null
  try {
    const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '')
    if (!domains.some(d => host === d || host.endsWith(`.${d}`))) {
      return `Please enter a ${platform} link (${domains[0]})`
    }
  } catch {
    return 'Please enter a valid URL'
  }
  return null
}

interface SocialLink { platform: string; url: string }
type PageThemePreset = 'minimal' | 'midnight' | 'cream' | 'neon' | 'rose'
type PageCardStyle = 'soft' | 'solid' | 'glass'
type PageButtonStyle = 'rounded' | 'pill' | 'square'
type PageLayout = 'compact' | 'spacious'

interface PageThemeConfig {
  preset: PageThemePreset
  accent_color: string
  background_color: string
  card_color: string
  text_color: string
  card_style: PageCardStyle
  button_style: PageButtonStyle
  layout: PageLayout
}

interface StorefrontProfile {
  display_name: string
  bio: string
  avatar_url: string
  social_links: SocialLink[]
  theme_config: PageThemeConfig
}

interface Product {
  id: string
  title: string
  description: string | null
  price: number
  type: 'project' | 'social' | 'media'
  is_active: boolean
  cover_image_url: string | null
  file_url?: string | null
  app_store_url?: string | null
  play_store_url?: string | null
  wishlist_enabled?: boolean
  launch_date?: string | null
  beta_access_url?: string | null
  product_hunt_url?: string | null
  sort_order: number
  created_at: string
}

const typeIcon = { project: Rocket, social: Share2, media: Video }

type PreviewDevice = 'web' | 'tablet' | 'mobile'

const DEVICE_SIZES: Record<PreviewDevice, { width: number; height: number }> = {
  web: { width: 1440, height: 900 },
  tablet: { width: 834, height: 1194 },
  mobile: { width: 390, height: 844 },
}

const DEVICE_OPTIONS: { key: PreviewDevice; label: string; icon: typeof Monitor }[] = [
  { key: 'web', label: 'Web', icon: Monitor },
  { key: 'tablet', label: 'Tablet', icon: Tablet },
  { key: 'mobile', label: 'Mobile', icon: Smartphone },
]

const PROFILE_BIO_MAX_LENGTH = 100

const DEFAULT_PAGE_THEME: PageThemeConfig = {
  preset: 'minimal',
  accent_color: '#394BE8',
  background_color: '#F8FAFC',
  card_color: '#FFFFFF',
  text_color: '#0F172A',
  card_style: 'soft',
  button_style: 'rounded',
  layout: 'compact',
}

const normalizePageTheme = (theme?: Partial<PageThemeConfig> | null): PageThemeConfig => ({
  ...DEFAULT_PAGE_THEME,
  ...(theme ?? {}),
})

// ─── Sortable product row ────────────────────────────────────────────────────

interface ProductRowProps {
  product: Product
  uploadingId: string | null
  onToggleActive: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onUploadClick: (id: string) => void
}

function SortableProductRow({
  product,
  uploadingId,
  onToggleActive,
  onEdit,
  onDelete,
  onUploadClick,
}: ProductRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = typeIcon[product.type]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
        tabIndex={-1}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Icon — click to upload */}
      <button
        type="button"
        onClick={() => onUploadClick(product.id)}
        title="Upload image"
        className="group relative w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0"
      >
        {uploadingId === product.id ? (
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        ) : product.cover_image_url ? (
          <img src={product.cover_image_url} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <Icon className="w-5 h-5 text-slate-300" />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <ImageIcon className="w-3.5 h-3.5 text-white" />
        </div>
      </button>

      {/* Title + description */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{product.title}</p>
        <p className="text-sm text-slate-400 truncate mt-0.5">{product.description || 'No description'}</p>
      </div>

      {/* Price */}
      {product.type !== 'social' && product.type !== 'project' && (
        <div className="text-right flex-shrink-0">
          <p className="font-semibold text-slate-900">{formatCurrency(product.price)}</p>
        </div>
      )}

      {/* Toggle switch */}
      <button
        onClick={() => onToggleActive(product)}
        title={product.is_active ? 'Disable' : 'Enable'}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
          product.is_active ? 'bg-indigo-600' : 'bg-slate-200'
        }`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          product.is_active ? 'translate-x-4' : 'translate-x-0.5'
        }`} />
      </button>

      {/* Actions */}
      <button
        type="button"
        onClick={() => onEdit(product)}
        title="Edit project"
        aria-label={`Edit ${product.title}`}
        className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors flex-shrink-0"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(product.id)}
        title="Remove project"
        aria-label={`Remove ${product.title}`}
        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [previewKey, setPreviewKey] = useState(0)
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('web')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Profile
  const [profile, setProfile] = useState<StorefrontProfile | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState<StorefrontProfile | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [newSocialPlatform, setNewSocialPlatform] = useState('')
  const [newSocialUrl, setNewSocialUrl] = useState('')

  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadTargetId = useRef<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const id = uploadTargetId.current
    if (!file || !id) return
    setUploadingId(id)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = res.data.url
      await api.put(`/products/${id}`, { cover_image_url: url })
      setProducts(prev => prev.map(p => p.id === id ? { ...p, cover_image_url: url } : p))
      setPreviewKey(k => k + 1)
    } finally {
      setUploadingId(null)
      e.target.value = ''
    }
  }, [])

  useEffect(() => {
    api.get('/products').then((r) => setProducts(r.data)).finally(() => setLoading(false))
    api.get('/storefront').then((r) => {
      const s = r.data
      setProfile({
        display_name: s.display_name || '',
        bio: s.bio || '',
        avatar_url: s.avatar_url || '',
        social_links: s.social_links || [],
        theme_config: normalizePageTheme(s.theme_config),
      })
    })
  }, [])

  const startEditProfile = () => {
    setEditForm(profile ? { ...profile, theme_config: normalizePageTheme(profile.theme_config) } : { display_name: '', bio: '', avatar_url: '', social_links: [], theme_config: DEFAULT_PAGE_THEME })
    setNewSocialPlatform('')
    setNewSocialUrl('')
    setEditingProfile(true)
  }

  const addSocialLink = () => {
    if (!editForm || !newSocialPlatform || !newSocialUrl.trim()) return
    if (validateSocialUrl(newSocialPlatform, newSocialUrl)) return
    const url = newSocialUrl.trim().startsWith('http') ? newSocialUrl.trim() : `https://${newSocialUrl.trim()}`
    const already = editForm.social_links.some(l => l.platform === newSocialPlatform)
    if (already) {
      setEditForm({ ...editForm, social_links: editForm.social_links.map(l => l.platform === newSocialPlatform ? { ...l, url } : l) })
    } else {
      setEditForm({ ...editForm, social_links: [...editForm.social_links, { platform: newSocialPlatform, url }] })
    }
    setNewSocialPlatform('')
    setNewSocialUrl('')
  }

  const saveProfile = async () => {
    if (!editForm) return
    const profilePayload = {
      ...editForm,
      bio: editForm.bio.slice(0, PROFILE_BIO_MAX_LENGTH),
      theme_config: normalizePageTheme(editForm.theme_config),
    }
    setSavingProfile(true)
    try {
      await api.put('/storefront', profilePayload)
      setProfile(profilePayload)
      setEditingProfile(false)
      setPreviewKey(k => k + 1)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editForm) return
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setEditForm(f => f ? { ...f, avatar_url: res.data.url } : f)
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }, [editForm])

  const toggleActive = async (product: Product) => {
    const patch = { is_active: !product.is_active }
    await api.put(`/products/${product.id}`, patch)
    setProducts(products.map(p => p.id === product.id ? { ...p, ...patch } : p))
    setPreviewKey(k => k + 1)
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/products/${id}`)
    setProducts(products.filter(p => p.id !== id))
    setPreviewKey(k => k + 1)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = products.findIndex(p => p.id === active.id)
    const newIndex = products.findIndex(p => p.id === over.id)
    const reordered = arrayMove(products, oldIndex, newIndex)
    setProducts(reordered)
    setPreviewKey(k => k + 1)

    await api.post('/products/reorder', { ids: reordered.map(p => p.id) })
  }

  const handleAddSuccess = () => {
    setDrawerOpen(false)
    api.get('/products').then(r => setProducts(r.data))
    setPreviewKey(k => k + 1)
  }

  const handleEditSuccess = () => {
    setSelectedProduct(null)
    api.get('/products').then(r => setProducts(r.data))
    setPreviewKey(k => k + 1)
  }

  const PREVIEW_FRAME_HEIGHT = 540
  const { width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT } = DEVICE_SIZES[previewDevice]
  const scale = PREVIEW_FRAME_HEIGHT / PREVIEW_HEIGHT
  const previewFrameWidth = Math.round(PREVIEW_WIDTH * scale)

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <>
      <div className="px-6 py-6">
        <div className="flex gap-6 items-start">
          {/* Left: item management */}
          <div className="flex-1 min-w-0">

            {/* Profile section */}
            {profile && (
              <div className="mb-7 pb-7 border-b border-slate-100">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-400">Profile</p>
                <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 flex items-center gap-4 shadow-sm">
                  <div className="h-14 w-14 flex-shrink-0 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                    {profile.avatar_url
                      ? <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                      : <UserCircle2 className="w-7 h-7 text-slate-300" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{profile.display_name || 'No display name'}</p>
                    {profile.bio && <p className="text-sm text-slate-400 truncate mt-0.5">{profile.bio}</p>}
                    {profile.social_links.length > 0 && (
                      <div className="flex items-center gap-2.5 mt-1.5">
                        {profile.social_links.map(({ platform }) => {
                          const Icon = socialIcon[platform]
                          if (!Icon) return null
                          return <Icon key={platform} size={15} color={SOCIAL_COLORS[platform] ?? '#64748b'} />
                        })}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={startEditProfile}
                    className="flex-shrink-0 flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                </div>
              </div>
            )}

            {/* Items section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-400">
                  Items · {products.length}
                </p>
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> New project
                </button>
              </div>

              {products.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
                  <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="font-medium text-slate-600">No items yet</p>
                  <p className="text-sm text-slate-400 mt-1 mb-4">Add your first project to your store.</p>
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add project
                  </button>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    <div className="grid gap-3">
                      {products.map((product) => (
                        <SortableProductRow
                          key={product.id}
                          product={product}
                          uploadingId={uploadingId}
                          onToggleActive={toggleActive}
                          onEdit={setSelectedProduct}
                          onDelete={deleteProduct}
                          onUploadClick={(id) => { uploadTargetId.current = id; fileInputRef.current?.click() }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>

          {/* Right: live storefront preview */}
          {user?.storefront && (
            <div className="flex-shrink-0 sticky top-20">
              <div className="mb-3 mx-auto flex w-32 items-center justify-center gap-0.5 rounded-lg bg-slate-100 p-[3px]">
                {DEVICE_OPTIONS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPreviewDevice(key)}
                    title={`${label} preview`}
                    aria-label={`${label} preview`}
                    className="flex h-7 flex-1 items-center justify-center rounded-md transition-colors"
                    style={{
                      background: previewDevice === key ? '#FFFFFF' : 'transparent',
                      color: previewDevice === key ? '#0F172A' : '#64748B',
                      boxShadow: previewDevice === key ? '0 1px 2px rgba(15,23,42,0.12)' : 'none',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
              <div
                className="rounded-xl overflow-hidden border border-slate-100 transition-[width] duration-200"
                style={{ width: previewFrameWidth, height: PREVIEW_FRAME_HEIGHT }}
              >
                <iframe
                  key={previewKey}
                  src={`/${user.storefront.username}`}
                  title="Storefront preview"
                  scrolling="no"
                  style={{
                    width: PREVIEW_WIDTH,
                    height: PREVIEW_HEIGHT,
                    border: 'none',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

      {/* Edit profile modal */}
      {editingProfile && editForm && (
        <>
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30" onClick={() => setEditingProfile(false)} />
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden" style={{ maxHeight: 'min(680px, calc(100vh - 32px))' }}>

              {/* Header */}
              <div className="flex items-center justify-between px-7 pt-6 pb-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Edit profile</h2>
                  <p className="text-xs text-slate-400 mt-0.5">How you appear on your public store</p>
                </div>
                <button type="button" onClick={() => setEditingProfile(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-1 min-h-0 border-t border-slate-100">
                {/* Left: avatar + info */}
                <div className="flex flex-col gap-5 p-7 border-r border-slate-100" style={{ width: '52%' }}>
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="group relative h-20 w-20 flex-shrink-0 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center"
                    >
                      {uploadingAvatar ? (
                        <div className="w-5 h-5 border-2 border-[#394BE8] border-t-transparent rounded-full animate-spin" />
                      ) : editForm.avatar_url ? (
                        <img src={editForm.avatar_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <UserCircle2 className="w-9 h-9 text-slate-300" />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5">
                        <ImageIcon className="w-4 h-4 text-white" />
                        <span className="text-[9px] font-semibold text-white tracking-wide uppercase">Change</span>
                      </div>
                    </button>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700">{editForm.display_name || 'Your name'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Click photo to change</p>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-4 flex-1">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold tracking-wide uppercase text-slate-400">Name</label>
                      <input
                        value={editForm.display_name}
                        onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#394BE8] focus:bg-white focus:ring-4 focus:ring-[#EEF1FF]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold tracking-wide uppercase text-slate-400">Bio</label>
                      <textarea
                        rows={5}
                        value={editForm.bio}
                        maxLength={PROFILE_BIO_MAX_LENGTH}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value.slice(0, PROFILE_BIO_MAX_LENGTH) })}
                        placeholder="A short description about you or your work…"
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#394BE8] focus:bg-white focus:ring-4 focus:ring-[#EEF1FF]"
                      />
                      <p className="text-right text-[11px] text-slate-400">{editForm.bio.length}/{PROFILE_BIO_MAX_LENGTH}</p>
                    </div>
                  </div>
                </div>

                {/* Right: socials */}
                <div className="flex flex-col flex-1 min-w-0 p-7 gap-4 overflow-y-auto">
                  <p className="text-[11px] font-semibold tracking-wide uppercase text-slate-400">Social links</p>

                  {/* Platform grid */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {SOCIAL_PLATFORMS.filter(p => !editForm.social_links.some(l => l.platform === p)).map(p => {
                      const Icon = socialIcon[p]
                      const isSelected = newSocialPlatform === p
                      const brandColor = SOCIAL_COLORS[p] ?? '#475569'
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewSocialPlatform(isSelected ? '' : p)}
                          className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {Icon && <Icon size={13} color={isSelected ? '#fff' : brandColor} />}
                          <span className="truncate">{p}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* URL input — only when platform selected */}
                  {newSocialPlatform && (() => {
                    const urlError = newSocialUrl.trim() ? validateSocialUrl(newSocialPlatform, newSocialUrl) : null
                    const isValid = newSocialUrl.trim() && !urlError
                    return (
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={newSocialUrl}
                            onChange={(e) => setNewSocialUrl(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && isValid) { e.preventDefault(); addSocialLink() } }}
                            placeholder={`${PLATFORM_DOMAINS[newSocialPlatform]?.[0] ?? newSocialPlatform + ' URL'}…`}
                            autoFocus
                            className={`flex-1 rounded-xl border px-3.5 py-2 text-sm outline-none transition focus:ring-4 ${
                              urlError
                                ? 'border-red-300 bg-red-50 focus:ring-red-100'
                                : 'border-[#394BE8] bg-[#EEF1FF]/40 focus:ring-[#EEF1FF]'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={addSocialLink}
                            disabled={!isValid}
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#394BE8] text-white transition hover:bg-[#2D3BC2] disabled:opacity-40"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {urlError && (
                          <p className="text-[11px] text-red-500 px-1">{urlError}</p>
                        )}
                      </div>
                    )
                  })()}

                  {/* Added links */}
                  {editForm.social_links.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold tracking-wide uppercase text-slate-400">Added</p>
                      {editForm.social_links.map((link, i) => {
                        const Icon = socialIcon[link.platform]
                        const brandColor = SOCIAL_COLORS[link.platform] ?? '#334155'
                        return (
                          <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm">
                              {Icon && <Icon size={13} color={brandColor} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-700">{link.platform}</p>
                              <p className="text-[11px] text-slate-400 truncate">{link.url.replace(/^https?:\/\//, '')}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditForm({ ...editForm, social_links: editForm.social_links.filter((_, idx) => idx !== i) })}
                              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-slate-300 hover:bg-red-50 hover:text-red-400 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {editForm.social_links.length === 0 && !newSocialPlatform && (
                    <p className="text-xs text-slate-400 text-center py-2">Pick a platform above to add a link</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 px-7 py-4 border-t border-slate-100 bg-slate-50/60">
                <button type="button" onClick={() => setEditingProfile(false)} className="h-9 rounded-xl px-4 text-sm font-medium text-slate-500 transition hover:text-slate-700">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#394BE8] px-5 text-sm font-semibold text-white shadow-sm shadow-[#394BE8]/30 transition hover:bg-[#2D3BC2] disabled:opacity-60"
                >
                  {savingProfile ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add item modal */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute right-4 top-4 z-10 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex-1 overflow-y-auto py-4">
                <ProductForm onSuccess={handleAddSuccess} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit item modal */}
      {selectedProduct && (
        <>
          <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setSelectedProduct(null)} />
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute right-4 top-4 z-10 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex-1 overflow-y-auto py-4">
                <ProductForm
                  productId={selectedProduct.id}
                  initialData={{
                    title: selectedProduct.title,
                    description: selectedProduct.description || '',
                    price: String(selectedProduct.price),
                    type: selectedProduct.type,
                    cover_image_url: selectedProduct.cover_image_url || '',
                    file_url: selectedProduct.file_url || '',
                    app_store_url: selectedProduct.app_store_url || '',
                    play_store_url: selectedProduct.play_store_url || '',
                    wishlist_enabled: Boolean(selectedProduct.wishlist_enabled ?? true),
                    launch_date: (selectedProduct.launch_date || '').slice(0, 10),
                    beta_access_url: selectedProduct.beta_access_url || '',
                    product_hunt_url: selectedProduct.product_hunt_url || '',
                    is_active: selectedProduct.is_active,
                  }}
                  onSuccess={handleEditSuccess}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
