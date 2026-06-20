'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAuth } from '@/lib/auth'
import api from '@/lib/api'
import { GripVertical, Monitor, Smartphone, Tablet } from 'lucide-react'

type PageThemePreset = 'minimal' | 'midnight' | 'cream' | 'neon' | 'rose'
type PageCardStyle = 'soft' | 'solid' | 'glass'
type PageButtonStyle = 'rounded' | 'pill' | 'square'
type PageLayout = 'compact' | 'spacious'
type PageFontFamily = 'sans' | 'serif' | 'mono' | 'rounded'
type PageHeadingWeight = 'bold' | 'black'
type PageShadowStyle = 'none' | 'soft' | 'bold'
type PageBackgroundStyle = 'solid' | 'gradient'
type PageSection = 'products' | 'roadmap'

interface PageThemeConfig {
  preset: PageThemePreset
  accent_color: string
  background_color: string
  card_color: string
  text_color: string
  card_style: PageCardStyle
  button_style: PageButtonStyle
  layout: PageLayout
  font_family: PageFontFamily
  heading_weight: PageHeadingWeight
  shadow_style: PageShadowStyle
  background_style: PageBackgroundStyle
  gradient_to: string
  gradient_angle: number
  section_order: PageSection[]
  section_visibility: { roadmap: boolean; social_links: boolean }
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

const PAGE_THEME_PRESETS: Array<{ key: PageThemePreset; label: string; theme: Pick<PageThemeConfig, 'preset' | 'accent_color' | 'background_color' | 'card_color' | 'text_color' | 'card_style' | 'button_style' | 'layout'> }> = [
  { key: 'minimal', label: 'Minimal', theme: { preset: 'minimal', accent_color: '#394BE8', background_color: '#F8FAFC', card_color: '#FFFFFF', text_color: '#0F172A', card_style: 'soft', button_style: 'rounded', layout: 'compact' } },
  { key: 'midnight', label: 'Midnight', theme: { preset: 'midnight', accent_color: '#8B5CF6', background_color: '#0B1020', card_color: '#151B2E', text_color: '#F8FAFC', card_style: 'glass', button_style: 'pill', layout: 'compact' } },
  { key: 'cream', label: 'Cream', theme: { preset: 'cream', accent_color: '#D97706', background_color: '#FFF7ED', card_color: '#FFFBF5', text_color: '#2F2518', card_style: 'soft', button_style: 'rounded', layout: 'spacious' } },
  { key: 'neon', label: 'Neon', theme: { preset: 'neon', accent_color: '#06B6D4', background_color: '#ECFEFF', card_color: '#FFFFFF', text_color: '#083344', card_style: 'solid', button_style: 'square', layout: 'compact' } },
  { key: 'rose', label: 'Rose', theme: { preset: 'rose', accent_color: '#E11D48', background_color: '#FFF1F2', card_color: '#FFFFFF', text_color: '#3F1722', card_style: 'soft', button_style: 'pill', layout: 'spacious' } },
]

const FONT_OPTIONS: Array<{ value: PageFontFamily; label: string; stack: string }> = [
  { value: 'sans', label: 'Sans', stack: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
  { value: 'serif', label: 'Serif', stack: 'Georgia, Cambria, "Times New Roman", Times, serif' },
  { value: 'mono', label: 'Mono', stack: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace' },
  { value: 'rounded', label: 'Rounded', stack: '"SF Pro Rounded", "Varela Round", Verdana, sans-serif' },
]

const SECTION_LABELS: Record<PageSection, string> = {
  products: 'Products & links',
  roadmap: 'Public roadmap',
}

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

const ROW = 'px-5 py-4 border-t border-[#f0f1f4] first:border-t-0'
const ROW_TITLE = 'mb-3 text-[13px] font-semibold text-[#15171f]'

function ColorSwatch({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col items-center gap-1.5">
      <span className="relative h-9 w-9 overflow-hidden rounded-full border border-black/5 shadow-[0_1px_3px_rgba(15,23,42,0.18)]">
        <span className="absolute inset-0" style={{ background: value }} />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </span>
      <span className="text-[11px] font-medium text-[#64748B]">{label}</span>
    </label>
  )
}

function PillGroup<T extends string>({ value, options, onChange }: {
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (value: T) => void
}) {
  return (
    <div className="flex h-8 items-center gap-0.5 rounded-[8px] bg-[#f1f2f5] p-[3px]">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`h-full flex-1 rounded-[6px] px-2 text-[12px] font-medium transition-colors ${
            value === opt.value ? 'bg-white text-[#15171f] shadow-[0_1px_2px_rgba(15,23,42,0.08)]' : 'text-[#7c828e] hover:text-[#15171f]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function SortableSectionRow({
  id,
  label,
  visible,
  onToggleVisible,
}: {
  id: PageSection
  label: string
  visible: boolean
  onToggleVisible?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2.5 py-2">
      <button
        {...attributes}
        {...listeners}
        className="touch-none p-0.5 text-[#c9cdd6] hover:text-[#8b909d] cursor-grab active:cursor-grabbing"
        tabIndex={-1}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 text-[13px] font-medium text-[#15171f]">{label}</span>
      {onToggleVisible && (
        <label className="flex items-center gap-1.5 text-[12px] font-medium text-[#64748B]">
          <input type="checkbox" checked={visible} onChange={onToggleVisible} className="h-3.5 w-3.5 rounded border-[#cbd5e1] text-[#394BE8] focus:ring-[#394BE8]" />
          Visible
        </label>
      )}
    </div>
  )
}

export default function PageDesignPage() {
  const { user } = useAuth()
  const [theme, setTheme] = useState<PageThemeConfig>(DEFAULT_PAGE_THEME)
  const [loading, setLoading] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('web')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const skipNextSave = useRef(true)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    api.get('/storefront').then((res) => {
      skipNextSave.current = true
      setTheme(normalizePageTheme(res.data?.theme_config))
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'vuala-theme-preview', theme }, window.location.origin)

    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }

    const timer = setTimeout(() => {
      api.put('/storefront', { theme_config: theme })
    }, 600)

    return () => clearTimeout(timer)
  }, [theme])

  const sendPreview = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'vuala-theme-preview', theme }, window.location.origin)
  }

  const applyPreset = (preset: typeof PAGE_THEME_PRESETS[number]['theme']) => {
    setTheme((current) => ({ ...current, ...preset }))
  }

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = theme.section_order.indexOf(active.id as PageSection)
    const newIndex = theme.section_order.indexOf(over.id as PageSection)
    setTheme((current) => ({ ...current, section_order: arrayMove(current.section_order, oldIndex, newIndex) }))
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#394BE8] border-t-transparent" />
      </div>
    )
  }

  const PREVIEW_FRAME_HEIGHT = 540
  const { width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT } = DEVICE_SIZES[previewDevice]
  const scale = PREVIEW_FRAME_HEIGHT / PREVIEW_HEIGHT
  const previewFrameWidth = Math.round(PREVIEW_WIDTH * scale)

  return (
    <div className="min-h-full bg-[#FCFCFD] p-[18px_24px_36px_24px]">
      <div className="flex gap-6 items-start">
        {/* Left: controls */}
        <div className="flex-1 min-w-0">
          <section className="rounded-[12px] border border-[#e6e8ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">

            {/* Presets */}
            <div className={ROW}>
              <p className={ROW_TITLE}>Presets</p>
              <div className="grid grid-cols-5 gap-1.5">
                {PAGE_THEME_PRESETS.map(({ key, label, theme: preset }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`flex h-9 items-center justify-center gap-1.5 rounded-[8px] border text-[12px] font-medium transition-colors ${
                      theme.preset === key
                        ? 'border-[#394BE8] bg-[#f4f5fe] text-[#394BE8]'
                        : 'border-[#e6e8ec] bg-white text-[#64748B] hover:border-[#cbd5e1] hover:bg-[#fafbfc]'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: preset.accent_color }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className={ROW}>
              <p className={ROW_TITLE}>Colors</p>
              <div className="flex items-start gap-5">
                <ColorSwatch label="Accent" value={theme.accent_color} onChange={(v) => setTheme((c) => ({ ...c, accent_color: v }))} />
                <ColorSwatch label="Background" value={theme.background_color} onChange={(v) => setTheme((c) => ({ ...c, background_color: v }))} />
                <ColorSwatch label="Cards" value={theme.card_color} onChange={(v) => setTheme((c) => ({ ...c, card_color: v }))} />
                <ColorSwatch label="Text" value={theme.text_color} onChange={(v) => setTheme((c) => ({ ...c, text_color: v }))} />
              </div>
            </div>

            {/* Background style */}
            <div className={ROW}>
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[#15171f]">Background</p>
                <div className="w-36">
                  <PillGroup
                    value={theme.background_style}
                    options={[{ value: 'solid', label: 'Solid' }, { value: 'gradient', label: 'Gradient' }]}
                    onChange={(v) => setTheme((c) => ({ ...c, background_style: v }))}
                  />
                </div>
              </div>

              {theme.background_style === 'gradient' && (
                <div className="mt-3 flex items-center gap-3">
                  <ColorSwatch label="To" value={theme.gradient_to} onChange={(v) => setTheme((c) => ({ ...c, gradient_to: v }))} />
                  <div className="flex flex-1 items-center gap-3">
                    <span className="whitespace-nowrap text-[12px] font-medium text-[#64748B]">Angle</span>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={theme.gradient_angle}
                      onChange={(e) => setTheme((c) => ({ ...c, gradient_angle: Number(e.target.value) }))}
                      className="w-full accent-[#394BE8]"
                    />
                    <span className="w-9 text-right text-[12px] font-mono text-[#94a3b8]">{theme.gradient_angle}°</span>
                  </div>
                </div>
              )}
            </div>

            {/* Typography */}
            <div className={ROW}>
              <p className={ROW_TITLE}>Typography</p>
              <div className="grid grid-cols-4 gap-1.5">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font.value}
                    type="button"
                    onClick={() => setTheme((c) => ({ ...c, font_family: font.value }))}
                    style={{ fontFamily: font.stack }}
                    className={`h-10 rounded-[8px] border text-[13px] font-semibold transition-colors ${
                      theme.font_family === font.value
                        ? 'border-[#394BE8] bg-[#f4f5fe] text-[#394BE8]'
                        : 'border-[#e6e8ec] bg-white text-[#64748B] hover:border-[#cbd5e1]'
                    }`}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
              <div className="mt-2.5 w-44">
                <PillGroup
                  value={theme.heading_weight}
                  options={[{ value: 'bold', label: 'Bold' }, { value: 'black', label: 'Extra bold' }]}
                  onChange={(v) => setTheme((c) => ({ ...c, heading_weight: v }))}
                />
              </div>
            </div>

            {/* Cards, buttons, shadow & spacing */}
            <div className={ROW}>
              <p className={ROW_TITLE}>Cards & buttons</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <span className="block text-[11px] text-[#94a3b8]">Cards</span>
                  <PillGroup
                    value={theme.card_style}
                    options={[{ value: 'soft', label: 'Soft' }, { value: 'solid', label: 'Solid' }, { value: 'glass', label: 'Glass' }]}
                    onChange={(v) => setTheme((c) => ({ ...c, card_style: v }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="block text-[11px] text-[#94a3b8]">Buttons</span>
                  <PillGroup
                    value={theme.button_style}
                    options={[{ value: 'rounded', label: 'Round' }, { value: 'pill', label: 'Pill' }, { value: 'square', label: 'Square' }]}
                    onChange={(v) => setTheme((c) => ({ ...c, button_style: v }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="block text-[11px] text-[#94a3b8]">Shadow</span>
                  <PillGroup
                    value={theme.shadow_style}
                    options={[{ value: 'none', label: 'None' }, { value: 'soft', label: 'Soft' }, { value: 'bold', label: 'Bold' }]}
                    onChange={(v) => setTheme((c) => ({ ...c, shadow_style: v }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="block text-[11px] text-[#94a3b8]">Spacing</span>
                  <PillGroup
                    value={theme.layout}
                    options={[{ value: 'compact', label: 'Compact' }, { value: 'spacious', label: 'Spacious' }]}
                    onChange={(v) => setTheme((c) => ({ ...c, layout: v }))}
                  />
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className={ROW}>
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[#15171f]">Sections</p>
                <span className="text-[11.5px] text-[#94a3b8]">Drag to reorder</span>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
                <SortableContext items={theme.section_order} strategy={verticalListSortingStrategy}>
                  <div className="mt-1 divide-y divide-[#f0f1f4]">
                    {theme.section_order.map((key) => (
                      <SortableSectionRow
                        key={key}
                        id={key}
                        label={SECTION_LABELS[key]}
                        visible={key === 'roadmap' ? theme.section_visibility.roadmap : true}
                        onToggleVisible={key === 'roadmap'
                          ? () => setTheme((current) => ({ ...current, section_visibility: { ...current.section_visibility, roadmap: !current.section_visibility.roadmap } }))
                          : undefined}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <label className="mt-2 flex items-center gap-2 border-t border-[#f0f1f4] pt-3 text-[12.5px] font-medium text-[#15171f]">
                <input
                  type="checkbox"
                  checked={theme.section_visibility.social_links}
                  onChange={() => setTheme((current) => ({ ...current, section_visibility: { ...current.section_visibility, social_links: !current.section_visibility.social_links } }))}
                  className="h-3.5 w-3.5 rounded border-[#cbd5e1] text-[#394BE8] focus:ring-[#394BE8]"
                />
                Show social links in profile header
              </label>
            </div>
          </section>
        </div>

        {/* Right: live preview */}
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
                ref={iframeRef}
                onLoad={sendPreview}
                src={`/${user.storefront.username}`}
                title="Page design preview"
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
  )
}
