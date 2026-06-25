'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Globe2,
  ImageIcon,
  MonitorSmartphone,
  Puzzle,
  Upload,
} from 'lucide-react'
import api from '@/lib/api'

export type ProductType = 'project' | 'social' | 'media'
type ProjectCategory = 'mobile' | 'web' | 'extension' | 'other'

interface ProductData {
  title: string
  description: string
  price: string
  type: ProductType
  cover_image_url: string
  file_url: string
  app_store_url: string
  play_store_url: string
  wishlist_enabled: boolean
  launch_date: string
  beta_access_url: string
  product_hunt_url: string
  is_active: boolean
}

interface Props {
  initialData?: Partial<ProductData>
  productId?: string
  onSuccess?: () => void
}

const defaultData: ProductData = {
  title: '',
  description: '',
  price: '0',
  type: 'project',
  cover_image_url: '',
  file_url: '',
  app_store_url: '',
  play_store_url: '',
  wishlist_enabled: true,
  launch_date: '',
  beta_access_url: '',
  product_hunt_url: '',
  is_active: true,
}

const projectCategories = [
  { key: 'mobile' as const, icon: MonitorSmartphone, label: 'Mobile app' },
  { key: 'web' as const, icon: Globe2, label: 'Web app' },
  { key: 'extension' as const, icon: Puzzle, label: 'Extension' },
  { key: 'other' as const, icon: Box, label: 'Other' },
]

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#394BE8] focus:ring-4 focus:ring-[#EEF1FF]'
const labelCls = 'block text-xs font-medium text-slate-400'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

function CharacterCount({ length, className = '' }: { length: number; className?: string }) {
  return (
    <span className={`pointer-events-none absolute bottom-2 right-3 text-[11px] ${length >= 30 ? 'text-red-500' : 'text-slate-300'} ${className}`}>
      {length}/30
    </span>
  )
}

export default function ProductForm({ initialData, productId, onSuccess }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<ProductData>({ ...defaultData, ...initialData })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [projectLive, setProjectLive] = useState(Boolean(initialData?.file_url || initialData?.app_store_url || initialData?.play_store_url))
  const [projectCategory, setProjectCategory] = useState<ProjectCategory>('mobile')

  const switchCategory = (cat: ProjectCategory) => {
    setProjectCategory(cat)
    setForm({ ...defaultData, type: 'project' })
    setProjectLive(false)
    setErrors({})
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setForm((c) => ({ ...c, cover_image_url: res.data.url }))
      setErrors((prev) => { const { cover_image_url, ...rest } = prev; return rest })
    } finally {
      setImageUploading(false)
      e.target.value = ''
    }
  }

  const saveProduct = async (isActive: boolean) => {
    setErrors({})
    if (!form.cover_image_url) {
      setErrors({ cover_image_url: ['Logo is required'] })
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        price: form.type === 'media' ? 0 : parseFloat(form.price) || 0,
        cover_image_url: form.cover_image_url || null,
        file_url: form.file_url || form.app_store_url || form.play_store_url || null,
        app_store_url: form.app_store_url || null,
        play_store_url: form.play_store_url || null,
        launch_date: form.launch_date || null,
        beta_access_url: form.beta_access_url || null,
        product_hunt_url: form.product_hunt_url || null,
        is_active: isActive,
      }
      if (productId) await api.put(`/products/${productId}`, payload)
      else await api.post('/products', payload)
      if (onSuccess) onSuccess()
      else router.push('/dashboard/products')
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data
      if (data?.errors) setErrors(data.errors)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveProduct(true)
  }

  const ImageUploader = () => (
    <div className={`rounded-lg border border-dashed bg-slate-50/60 p-2.5 ${errors.cover_image_url ? 'border-red-300 bg-red-50/60' : 'border-slate-200'}`}>
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white">
          {form.cover_image_url
            ? <img src={form.cover_image_url} alt="Cover" className="h-full w-full object-cover" />
            : <ImageIcon className="h-5 w-5 text-slate-300" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-700">{form.cover_image_url ? 'Image added' : 'Add image'}</p>
          <p className="text-xs text-slate-400">Square recommended</p>
        </div>
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={imageUploading}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-[#394BE8] hover:text-[#394BE8] disabled:opacity-50"
        >
          {imageUploading
            ? <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
            : <Upload className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )

  const catItem = (active: boolean) =>
    `flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm transition ${
      active ? 'bg-slate-100 font-semibold text-slate-800' : 'font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700'
    }`

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid h-[min(860px,calc(100vh-140px))] min-h-[600px] lg:grid-cols-[200px_minmax(0,1fr)]">

        {/* Sidebar — project types directly */}
        <aside className="px-3 py-4">
          <nav className="space-y-0.5">
            {projectCategories.map(({ key, icon: Icon, label }) => (
              <button key={key} type="button" onClick={() => switchCategory(key)} className={catItem(projectCategory === key)}>
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex min-h-0 min-w-0 flex-col">
          <section className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="space-y-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
                <div className="space-y-4">
                  <Field label={{ mobile: 'App name', web: 'App name', extension: 'Extension name', other: 'Project name' }[projectCategory]}>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className={inputCls}
                      placeholder="My project"
                    />
                    {errors.title?.map((m) => <p key={m} className="text-xs text-red-500">{m}</p>)}
                  </Field>

                  <Field label="Short pitch">
                    <div className="relative">
                      <textarea
                        rows={2}
                        maxLength={30}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className={`${inputCls} resize-none pr-14`}
                        placeholder="A simple launch tracker"
                      />
                      <CharacterCount length={form.description.length} />
                    </div>
                  </Field>

                  <Field label="Status">
                    <div className="space-y-3">
                      <div className="inline-grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
                        <button type="button" onClick={() => setProjectLive(false)} className={`h-8 rounded-md px-4 text-sm font-medium transition ${!projectLive ? 'bg-white text-[#394BE8] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                          Coming soon
                        </button>
                        <button type="button" onClick={() => setProjectLive(true)} className={`h-8 rounded-md px-4 text-sm font-medium transition ${projectLive ? 'bg-white text-[#394BE8] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                          Live
                        </button>
                      </div>

                      {!projectLive && (
                        <div className="flex flex-col gap-3">
                          <div className="space-y-1.5">
                            <label className={labelCls}>Wishlist sign-ups</label>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={form.wishlist_enabled}
                              onClick={() => setForm((c) => ({ ...c, wishlist_enabled: !c.wishlist_enabled }))}
                              className={`relative mt-0.5 flex h-6 w-11 rounded-full transition ${form.wishlist_enabled ? 'bg-[#394BE8]' : 'bg-slate-200'}`}
                            >
                              <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${form.wishlist_enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            <label className={labelCls}>Release date <span className="text-slate-300">(optional)</span></label>
                            <input type="date" value={form.launch_date} onChange={(e) => setForm({ ...form, launch_date: e.target.value })} className={inputCls} />
                          </div>
                          <div className="space-y-1.5">
                            <label className={labelCls}>Beta access URL <span className="text-slate-300">(optional)</span></label>
                            <input type="url" value={form.beta_access_url} onChange={(e) => setForm({ ...form, beta_access_url: e.target.value })} className={inputCls} placeholder="https://..." />
                          </div>
                        </div>
                      )}
                    </div>
                  </Field>
                </div>

                <Field label="Logo">
                  <ImageUploader />
                  {errors.cover_image_url?.map((m) => <p key={m} className="text-xs text-red-500">{m}</p>)}
                </Field>
              </div>

              {projectLive && (
                projectCategory === 'mobile' ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="App Store URL"><input type="url" value={form.app_store_url} onChange={(e) => setForm({ ...form, app_store_url: e.target.value })} className={inputCls} placeholder="https://apps.apple.com/..." /></Field>
                      <Field label="Google Play URL"><input type="url" value={form.play_store_url} onChange={(e) => setForm({ ...form, play_store_url: e.target.value })} className={inputCls} placeholder="https://play.google.com/store/apps/..." /></Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Landing page"><input type="url" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} className={inputCls} placeholder="https://yourapp.com" /></Field>
                      <Field label="Product Hunt"><input type="url" value={form.product_hunt_url} onChange={(e) => setForm({ ...form, product_hunt_url: e.target.value })} className={inputCls} placeholder="https://producthunt.com/posts/..." /></Field>
                    </div>
                  </div>
                ) : projectCategory === 'extension' ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Chrome Web Store"><input type="url" value={form.app_store_url} onChange={(e) => setForm({ ...form, app_store_url: e.target.value })} className={inputCls} placeholder="https://chromewebstore.google.com/..." /></Field>
                      <Field label="Firefox Add-ons"><input type="url" value={form.play_store_url} onChange={(e) => setForm({ ...form, play_store_url: e.target.value })} className={inputCls} placeholder="https://addons.mozilla.org/..." /></Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Landing page"><input type="url" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} className={inputCls} placeholder="https://yourextension.com" /></Field>
                      <Field label="Product Hunt"><input type="url" value={form.product_hunt_url} onChange={(e) => setForm({ ...form, product_hunt_url: e.target.value })} className={inputCls} placeholder="https://producthunt.com/posts/..." /></Field>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Field label="Project URL"><input type="url" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} className={inputCls} placeholder="https://yourproject.com" /></Field>
                    <Field label="Product Hunt"><input type="url" value={form.product_hunt_url} onChange={(e) => setForm({ ...form, product_hunt_url: e.target.value })} className={inputCls} placeholder="https://producthunt.com/posts/..." /></Field>
                  </div>
                )
              )}
            </div>
          </section>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={() => saveProduct(false)}
              disabled={loading}
              className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
            >
              Save draft
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#394BE8] px-5 text-sm font-semibold text-white transition hover:bg-[#2D3BC2] disabled:opacity-60"
            >
              {loading && <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              {loading ? 'Saving…' : productId ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </div>

      </div>
    </form>
  )
}
