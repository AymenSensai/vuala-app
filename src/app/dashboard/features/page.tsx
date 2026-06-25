'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, CirclePlus, Edit3, Plus, Search, Trash2, X } from 'lucide-react'
import api from '@/lib/api'

type FeatureStatus = 'planned' | 'in_progress' | 'blocked' | 'shipped'
type FeaturePriority = 'low' | 'medium' | 'high'
type FeatureType = 'new_feature' | 'edit' | 'bug' | 'improvement' | 'other'

interface RoadmapItem {
  id: string
  title: string
  type: FeatureType
  status: FeatureStatus
  priority: FeaturePriority
  next_update: boolean
  target: string
  notes: string
  updated_at: string
}

interface RoadmapBoard {
  id: string
  product_id: string
  is_shared: boolean
  created_at: string
  items: RoadmapItem[]
}

interface Project {
  id: string
  title: string
  description: string | null
  type: 'project' | 'social' | 'media'
}

const STORAGE_KEY = 'vuala-roadmaps'
const ACTIVE_KEY = 'vuala-roadmaps-active'

const PRIORITY_META: Record<FeaturePriority, { label: string; tone: string }> = {
  low: { label: 'Low', tone: 'text-[#64748b] border-[#e2e8f0] bg-[#f8fafc]' },
  medium: { label: 'Medium', tone: 'text-[#92600a] border-[#f2e3c4] bg-[#fdf7ec]' },
  high: { label: 'High', tone: 'text-[#b91c1c] border-[#f2c9c9] bg-[#fff5f5]' },
}

const TYPE_META: Record<FeatureType, { label: string; tone: string }> = {
  new_feature: { label: 'New feature', tone: 'text-[#394BE8] border-[#d9ddf9] bg-[#f4f5fe]' },
  edit: { label: 'Edit', tone: 'text-[#475569] border-[#e2e8f0] bg-[#f8fafc]' },
  bug: { label: 'Bug', tone: 'text-[#b91c1c] border-[#f2c9c9] bg-[#fff5f5]' },
  improvement: { label: 'Improvement', tone: 'text-[#92600a] border-[#f2e3c4] bg-[#fdf7ec]' },
  other: { label: 'Other', tone: 'text-[#64748b] border-[#e2e8f0] bg-[#f8fafc]' },
}

const TYPE_OPTIONS: { value: FeatureType; label: string }[] =
  Object.entries(TYPE_META).map(([key, meta]) => ({ value: key as FeatureType, label: meta.label }))

const STATUS_OPTIONS: { value: FeatureStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'shipped', label: 'Shipped' },
]

const STATUS_FILTER_OPTIONS: { value: FeatureStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  ...STATUS_OPTIONS,
]

const PRIORITY_OPTIONS: { value: FeaturePriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

function fmtDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function Pill({ label, tone }: { label: string; tone: string }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11.5px] font-medium ${tone}`}>{label}</span>
}

function Dropdown<T extends string>({
  value,
  options,
  onChange,
  triggerClassName,
  menuClassName,
  fixedMenu = false,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  triggerClassName?: string
  menuClassName?: string
  fixedMenu?: boolean
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({})
  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  useEffect(() => {
    if (!open || !fixedMenu || !buttonRef.current) return

    const setPosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      setMenuStyle({
        left: rect.left,
        top: rect.bottom + 4,
        width: rect.width,
      })
    }

    setPosition()
    window.addEventListener('resize', setPosition)
    window.addEventListener('scroll', setPosition, true)
    return () => {
      window.removeEventListener('resize', setPosition)
      window.removeEventListener('scroll', setPosition, true)
    }
  }, [fixedMenu, open])

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((curr) => !curr)}
        aria-expanded={open}
        className={triggerClassName ?? "h-11 w-full flex items-center justify-between gap-2 rounded-xl border border-[#e6e8ec] bg-white px-3 text-left text-sm text-[#15171f] outline-none"}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown className={`h-4 w-4 text-[#8b909d] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          style={fixedMenu ? menuStyle : undefined}
          className={`${fixedMenu ? 'fixed z-50' : 'absolute left-0 top-full z-30 mt-1 w-full'} overflow-hidden rounded-xl border border-[#e6e8ec] bg-white shadow-[0_12px_32px_rgba(16,24,40,0.12)] ${menuClassName ?? ''}`}
        >
          {options.map((option) => {
            const active = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setOpen(false) }}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                  active ? 'bg-[#f4f5fe] text-[#394be8]' : 'text-[#15171f] hover:bg-[#f7f8fa]'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {active && <Check className="h-3.5 w-3.5 shrink-0 text-[#394be8]" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function normalizeItem(item: Partial<RoadmapItem>): RoadmapItem {
  return {
    id: item.id ?? uid(),
    title: item.title ?? 'Untitled feature',
    type: item.type ?? 'other',
    status: item.status ?? 'planned',
    priority: item.priority ?? 'medium',
    next_update: item.next_update ?? false,
    target: item.target ?? '',
    notes: item.notes ?? '',
    updated_at: item.updated_at ?? new Date().toISOString(),
  }
}

function normalizeBoard(board: Partial<RoadmapBoard>): RoadmapBoard {
  return {
    id: board.id ?? uid(),
    product_id: board.product_id ?? '',
    is_shared: board.is_shared ?? false,
    created_at: board.created_at ?? new Date().toISOString(),
    items: Array.isArray(board.items) ? board.items.map((item) => normalizeItem(item)) : [],
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export default function FeaturesPage() {
  const [boards, setBoards] = useState<RoadmapBoard[]>(() => {
    if (typeof window === 'undefined') return []

    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map((board) => normalizeBoard(board)).filter((board) => board.product_id)
      }
      return []
    } catch {
      return []
    }
  })
  const [activeBoardId, setActiveBoardId] = useState<string>(() => {
    if (typeof window === 'undefined') return ''
    return window.localStorage.getItem(ACTIVE_KEY) ?? ''
  })
  const [products, setProducts] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FeatureStatus | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [boardModalOpen, setBoardModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<RoadmapItem | null>(null)
  const [form, setForm] = useState<Omit<RoadmapItem, 'id' | 'updated_at'>>({
    title: '',
    type: 'new_feature',
    status: 'planned',
    priority: 'medium',
    next_update: false,
    target: '',
    notes: '',
  })
  const [boardError, setBoardError] = useState('')
  const [boardForm, setBoardForm] = useState({
    product_id: '',
    is_shared: false,
  })

  useEffect(() => {
    api.get('/products').then((res) => setProducts(res.data))
  }, [])

  useEffect(() => {
    api.get('/roadmaps').then((res) => {
      if (!Array.isArray(res.data) || res.data.length === 0) return

      const nextBoards = res.data.map((board: Partial<RoadmapBoard>) => normalizeBoard(board)).filter((board: RoadmapBoard) => board.product_id)
      setBoards(nextBoards)
      setActiveBoardId((current) => current || nextBoards[0]?.id || '')
    }).catch(() => {})
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards))
  }, [boards])

  useEffect(() => {
    localStorage.setItem(ACTIVE_KEY, activeBoardId)
  }, [activeBoardId])

  const getProject = (productId: string) => products.find((product) => product.id === productId) ?? null

  const usedProductIds = useMemo(() => new Set(boards.map((board) => board.product_id)), [boards])

  const availableProjects = useMemo(
    () => products.filter((product) => product.type === 'project' && !usedProductIds.has(product.id)),
    [products, usedProductIds],
  )

  const activeBoard = useMemo(() => {
    return boards.find((board) => board.id === activeBoardId) ?? boards[0]
  }, [boards, activeBoardId])

  const activeProject = activeBoard ? getProject(activeBoard.product_id) : null

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (activeBoard?.items ?? [])
      .filter((item) => {
        const matchesSearch = !q || item.title.toLowerCase().includes(q) || item.notes.toLowerCase().includes(q)
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }, [activeBoard, search, statusFilter])

  const counts = useMemo(() => ({
    total: activeBoard?.items.length ?? 0,
    planned: activeBoard?.items.filter((item) => item.status === 'planned').length ?? 0,
    active: activeBoard?.items.filter((item) => item.status === 'in_progress').length ?? 0,
    shipped: activeBoard?.items.filter((item) => item.status === 'shipped').length ?? 0,
  }), [activeBoard])

  const card = 'rounded-xl border border-[#E7EAF0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] py-4 px-[18px]'

  const updateActiveBoard = (updater: (items: RoadmapItem[]) => RoadmapItem[]) => {
    setBoards((current) => current.map((board) => {
      if (board.id !== activeBoardId) return board
      const updatedBoard = { ...board, items: updater(board.items) }
      persistBoard(updatedBoard)
      return updatedBoard
    }))
  }

  const persistBoard = async (board: RoadmapBoard) => {
    const payload = {
      product_id: board.product_id,
      is_shared: board.is_shared,
      items: board.items,
    }

    try {
      const res = isUuid(board.id)
        ? await api.put(`/roadmaps/${board.id}`, payload)
        : await api.post('/roadmaps', payload)
      const saved = normalizeBoard(res.data)

      if (saved.id !== board.id) {
        setBoards((current) => current.map((item) => (item.id === board.id ? saved : item)))
        setActiveBoardId((current) => (current === board.id ? saved.id : current))
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status !== 404 || !isUuid(board.id)) return

      try {
        const res = await api.post('/roadmaps', payload)
        const saved = normalizeBoard(res.data)
        setBoards((current) => current.map((item) => (item.id === board.id ? saved : item)))
        setActiveBoardId((current) => (current === board.id ? saved.id : current))
      } catch {}
    }
  }

  const updateBoardSharing = (id: string, isShared: boolean) => {
    setBoards((current) => current.map((board) => {
      if (board.id !== id) return board
      const updatedBoard = { ...board, is_shared: isShared }
      persistBoard(updatedBoard)
      return updatedBoard
    }))
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({
      title: '',
      type: 'new_feature',
      status: 'planned',
      priority: 'medium',
      next_update: false,
      target: '',
      notes: '',
    })
    setModalOpen(true)
  }

  const openEdit = (item: RoadmapItem) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      type: item.type,
      status: item.status,
      priority: item.priority,
      next_update: item.next_update,
      target: item.target,
      notes: item.notes,
    })
    setModalOpen(true)
  }

  const saveItem = () => {
    if (!form.title.trim()) return
    const payload: RoadmapItem = normalizeItem({
      id: editingId ?? uid(),
      updated_at: new Date().toISOString(),
      ...form,
    })

    updateActiveBoard((current) => (
      editingId
        ? current.map((item) => (item.id === editingId ? payload : item))
        : [payload, ...current]
    ))

    setModalOpen(false)
  }

  const removeItem = (id: string) => {
    updateActiveBoard((current) => current.filter((item) => item.id !== id))
  }

  const confirmRemoveItem = () => {
    if (!deleteCandidate) return
    removeItem(deleteCandidate.id)
    setDeleteCandidate(null)
  }

  const saveBoard = async () => {
    if (!boardForm.product_id) return

    const previousActiveBoardId = activeBoardId
    const nextBoard: RoadmapBoard = normalizeBoard({
      id: uid(),
      product_id: boardForm.product_id,
      is_shared: boardForm.is_shared,
      created_at: new Date().toISOString(),
      items: [],
    })

    setBoards((current) => [...current, nextBoard])
    setActiveBoardId(nextBoard.id)
    setBoardError('')

    try {
      const res = await api.post('/roadmaps', {
        product_id: nextBoard.product_id,
        is_shared: nextBoard.is_shared,
        items: nextBoard.items,
      })
      const saved = normalizeBoard(res.data)
      setBoards((current) => current.map((item) => (item.id === nextBoard.id ? saved : item)))
      setActiveBoardId(saved.id)
      setBoardModalOpen(false)
      setBoardForm({ product_id: '', is_shared: false })
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setBoards((current) => current.filter((item) => item.id !== nextBoard.id))
      setActiveBoardId(previousActiveBoardId)
      setBoardError(message ?? "You've reached your plan's roadmap limit. Upgrade to Pro for unlimited roadmaps.")
    }
  }

  return (
    <div className="min-h-full bg-[#FCFCFD] p-[18px_24px_36px_24px]">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className={`${card} h-fit lg:sticky lg:top-[18px]`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8b909d]">Roadmaps</p>
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[#e6e8ec] bg-[#fbfcfe] px-2 text-[11px] font-semibold text-[#64748B]">
                {boards.length}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {boards.map((board) => {
                const active = board.id === activeBoardId
                const project = getProject(board.product_id)
                return (
                  <button
                    key={board.id}
                    type="button"
                    onClick={() => setActiveBoardId(board.id)}
                    className={`w-full rounded-[12px] border px-3 py-3 text-left transition-colors ${
                      active
                        ? 'border-[#D9DDFF] bg-[#F4F5FE]'
                        : 'border-[#e6e8ec] bg-white hover:bg-[#fafbfd]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[#15171f]">{project?.title ?? 'Unknown project'}</p>
                        <p className="mt-0.5 line-clamp-2 text-[12px] leading-5 text-[#8b909d]">
                          {project?.description || 'No description yet'}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[#394BE8] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                        {board.items.length}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setBoardForm({ product_id: availableProjects[0]?.id ?? '', is_shared: false })
                setBoardError('')
                setBoardModalOpen(true)
              }}
              className="mt-3 inline-flex h-[32px] w-full items-center justify-center gap-[6px] rounded-[8px] border border-[#d9ddf9] bg-[#f4f5fe] px-[11px] text-[13px] font-semibold text-[#394BE8] transition-colors hover:bg-[#eef0ff]"
            >
              <Plus className="h-[14px] w-[14px]" />
              Add new roadmap
            </button>
          </aside>

          <main className="space-y-3.5">
            {!activeBoard ? (
              <section className={`${card} flex flex-col items-center justify-center gap-2 py-16 text-center`}>
                <p className="text-sm font-semibold text-[#0F172A]">No roadmap yet</p>
                <p className="max-w-sm text-[12.5px] leading-5 text-[#64748B]">
                  {availableProjects.length > 0
                    ? 'Click "Add new roadmap" and pick a project to start tracking its roadmap.'
                    : (
                      <>
                        You don&apos;t have any projects yet.{' '}
                        <Link href="/dashboard/products" className="font-semibold text-[#394BE8]">Add a project</Link> first, then come back to create its roadmap.
                      </>
                    )}
                </p>
              </section>
            ) : (
            <>
            <section className={`${card} grid grid-cols-4 gap-3`}>
              {[
                { label: 'Total features', value: counts.total },
                { label: 'Planned', value: counts.planned },
                { label: 'In progress', value: counts.active },
                { label: 'Shipped', value: counts.shipped },
              ].map((item, index) => (
                <div key={item.label} className={`px-3 py-1.5 ${index > 0 ? 'border-l border-[#f1f5f9]' : ''}`}>
                  <p className="text-[11.5px] font-medium text-[#64748B]">{item.label}</p>
                  <p className="mt-1 text-[22px] font-bold leading-none tabular-nums text-[#0F172A]">{item.value}</p>
                </div>
              ))}
            </section>

            <section className={`${card}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8b909d]">Current roadmap</p>
                  <h2 className="mt-1 truncate text-sm font-semibold text-[#0F172A]">{activeProject?.title ?? 'Unknown project'}</h2>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="flex h-[32px] items-center gap-2 rounded-[8px] border border-[#e6e8ec] bg-white px-[10px] text-[13px] font-medium text-[#15171f]">
                    <input
                      type="checkbox"
                      checked={activeBoard.is_shared}
                      onChange={(e) => updateBoardSharing(activeBoard.id, e.target.checked)}
                      className="h-4 w-4 rounded border-[#cbd5e1] text-[#394BE8] focus:ring-[#394BE8]"
                    />
                    Share with users
                  </label>

                  <div className="relative w-[232px] min-w-[232px] max-[960px]:w-full max-[960px]:min-w-0">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8b909d]" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search features"
                      className="h-[32px] w-full rounded-[8px] border border-[#e6e8ec] bg-white pl-9 pr-3 text-[13px] text-[#15171f] outline-none"
                    />
                  </div>

                  <div className="w-[180px] min-w-[180px] max-[960px]:w-full max-[960px]:min-w-0">
                    <Dropdown<FeatureStatus | 'all'>
                      value={statusFilter}
                      options={STATUS_FILTER_OPTIONS}
                      onChange={setStatusFilter}
                      triggerClassName="h-[32px] w-full flex items-center justify-between gap-2 rounded-[8px] border border-[#e6e8ec] bg-white px-[10px] text-left text-[13px] text-[#15171f] outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex h-[32px] items-center gap-[6px] rounded-[8px] bg-[#394BE8] px-[11px] text-[13px] font-semibold text-white transition-colors hover:bg-[#2f3fd1]"
                  >
                    <CirclePlus className="h-[14px] w-[14px]" />
                    Add feature
                  </button>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[10px] border border-[#e6e8ec] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse" style={{ minWidth: 900 }}>
                  <thead>
                    <tr>
                      {['Feature', 'Type', 'Priority', 'Status', 'Next update', 'Target', 'Updated'].map((col) => (
                        <th key={col} className="bg-[#fafbfc] border-b border-[#e6e8ec] px-3 py-[7px] text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8b909d] whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                      <th className="bg-[#fafbfc] border-b border-[#e6e8ec] px-3 py-[7px] text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8b909d] whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-[#fafbfd]">
                        <td className="border-b border-[#f0f1f4] px-3 py-[7px]">
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-[#15171f]">{item.title}</p>
                            <p className="truncate text-[12px] text-[#8b909d]">{item.notes}</p>
                          </div>
                        </td>
                        <td className="border-b border-[#f0f1f4] px-3 py-[7px] whitespace-nowrap">
                          <Pill label={TYPE_META[item.type ?? 'other'].label} tone={TYPE_META[item.type ?? 'other'].tone} />
                        </td>
                        <td className="border-b border-[#f0f1f4] px-3 py-[7px] whitespace-nowrap">
                          <Pill label={PRIORITY_META[item.priority].label} tone={PRIORITY_META[item.priority].tone} />
                        </td>
                        <td className="border-b border-[#f0f1f4] px-3 py-[7px] whitespace-nowrap">
                          <div className="w-[132px]">
                            <Dropdown<FeatureStatus>
                              value={item.status}
                              options={STATUS_OPTIONS}
                              onChange={(status) => {
                                updateActiveBoard((current) => current.map((row) => (
                                  row.id === item.id ? { ...row, status, updated_at: new Date().toISOString() } : row
                                )))
                              }}
                              triggerClassName="h-[28px] w-full flex items-center justify-between gap-2 rounded-[8px] border border-[#e6e8ec] bg-white px-[10px] text-left text-[12px] text-[#15171f] outline-none"
                              menuClassName="rounded-[10px]"
                              fixedMenu
                            />
                          </div>
                        </td>
                        <td className="border-b border-[#f0f1f4] px-3 py-[7px] whitespace-nowrap">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11.5px] font-medium ${item.next_update ? 'text-[#1f7a4d] border-[#d2eadd] bg-[#eff8f2]' : 'text-[#64748b] border-[#e2e8f0] bg-[#f8fafc]'}`}>
                            {item.next_update ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="border-b border-[#f0f1f4] px-3 py-[7px] whitespace-nowrap text-[12.5px] text-[#475569]">
                          {item.target}
                        </td>
                        <td className="border-b border-[#f0f1f4] px-3 py-[7px] whitespace-nowrap text-[12.5px] text-[#8b909d]">
                          {fmtDate(item.updated_at)}
                        </td>
                        <td className="border-b border-[#f0f1f4] px-3 py-[7px] whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="inline-flex h-7 items-center gap-1 rounded-[8px] border border-[#e6e8ec] bg-white px-2 text-[12px] font-medium text-[#15171f] transition-colors hover:bg-[#f7f8fa]"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-[#394BE8]" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteCandidate(item)}
                              className="inline-flex h-7 items-center gap-1 rounded-[8px] border border-[#e6e8ec] bg-white px-2 text-[12px] font-medium text-[#15171f] transition-colors hover:bg-[#f7f8fa]"
                              aria-label={`Remove ${item.title}`}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-[#b91c1c]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-10 text-center text-[13px] text-[#8b909d]">
                          No features match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            </>
            )}
          </main>
        </div>
      </div>

      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-40 flex items-end justify-center px-4 py-4 sm:items-center">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-[18px] border border-[#e6e8ec] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.16)]"
          >
            <div className="flex items-center justify-between rounded-t-[18px] border-b border-[#eef1f5] px-5 py-4">
              <div>
                <p className="text-base font-semibold text-[#0F172A]">{editingId ? 'Edit feature' : 'Add feature'}</p>
                <p className="mt-1 text-sm text-[#64748B]">Track what you want to build and how far it has moved.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1.5 text-[#8b909d] transition-colors hover:bg-[#f7f8fa] hover:text-[#475569]"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#8b909d]">Title</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                  placeholder="Feature title"
                  className="h-11 w-full rounded-xl border border-[#e6e8ec] bg-white px-3 text-sm text-[#15171f] outline-none"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#8b909d]">Type</span>
                  <Dropdown<FeatureType>
                    value={form.type}
                    options={TYPE_OPTIONS}
                    onChange={(value) => setForm((current) => ({ ...current, type: value }))}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#8b909d]">Target</span>
                  <input
                    value={form.target}
                    onChange={(e) => setForm((current) => ({ ...current, target: e.target.value }))}
                    placeholder="Jun 2026"
                    className="h-11 w-full rounded-xl border border-[#e6e8ec] bg-white px-3 text-sm text-[#15171f] outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#8b909d]">Status</span>
                  <Dropdown<FeatureStatus>
                    value={form.status}
                    options={STATUS_OPTIONS}
                    onChange={(value) => setForm((current) => ({ ...current, status: value }))}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#8b909d]">Priority</span>
                  <Dropdown<FeaturePriority>
                    value={form.priority}
                    options={PRIORITY_OPTIONS}
                    onChange={(value) => setForm((current) => ({ ...current, priority: value }))}
                  />
                </label>
              </div>

              <label className="flex items-center justify-between gap-3 rounded-[12px] border border-[#e6e8ec] bg-[#fbfcfe] px-4 py-3">
                <div>
                  <span className="block text-[12px] font-semibold uppercase tracking-wide text-[#8b909d]">Next update</span>
                  <p className="mt-1 text-[12.5px] text-[#64748B]">Mark this if the feature should ship in the next release.</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.next_update}
                  onChange={(e) => setForm((current) => ({ ...current, next_update: e.target.checked }))}
                  className="h-4 w-4 rounded border-[#cbd5e1] text-[#394BE8] focus:ring-[#394BE8]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#8b909d]">Notes</span>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))}
                  placeholder="What needs to happen next?"
                  className="w-full rounded-xl border border-[#e6e8ec] bg-white px-3 py-3 text-sm text-[#15171f] outline-none"
                />
              </label>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-9 rounded-full border border-[#e6e8ec] bg-white px-4 text-sm font-medium text-[#15171f] transition-colors hover:bg-[#f7f8fa]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveItem}
                  className="h-9 rounded-full bg-[#394BE8] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2f40d8]"
                >
                  Save feature
                </button>
              </div>
            </div>
          </div>
          </div>
        </>
      )}

      {deleteCandidate && (
        <>
          <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setDeleteCandidate(null)} />
          <div className="fixed inset-0 z-40 flex items-end justify-center px-4 py-4 sm:items-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-feature-title"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[18px] border border-[#e6e8ec] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.16)]"
            >
              <div className="border-b border-[#eef1f5] px-5 py-4">
                <p id="delete-feature-title" className="text-base font-semibold text-[#0F172A]">Remove feature?</p>
                <p className="mt-1 text-sm leading-5 text-[#64748B]">
                  This will remove &quot;{deleteCandidate.title}&quot; from this roadmap.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setDeleteCandidate(null)}
                  className="h-9 rounded-full border border-[#e6e8ec] bg-white px-4 text-sm font-medium text-[#15171f] transition-colors hover:bg-[#f7f8fa]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRemoveItem}
                  className="h-9 rounded-full bg-[#b91c1c] px-4 text-sm font-medium text-white transition-colors hover:bg-[#991b1b]"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {boardModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setBoardModalOpen(false)} />
          <div className="fixed inset-0 z-40 flex items-end justify-center px-4 py-4 sm:items-center">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-[18px] border border-[#e6e8ec] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.16)]"
          >
            <div className="flex items-center justify-between rounded-t-[18px] border-b border-[#eef1f5] px-5 py-4">
              <div>
                <p className="text-base font-semibold text-[#0F172A]">Add roadmap</p>
                <p className="mt-1 text-sm text-[#64748B]">Pick a project to start tracking its roadmap. Each project gets one roadmap.</p>
              </div>
              <button
                type="button"
                onClick={() => setBoardModalOpen(false)}
                className="rounded-full p-1.5 text-[#8b909d] transition-colors hover:bg-[#f7f8fa] hover:text-[#475569]"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              {availableProjects.length === 0 ? (
                <p className="text-sm text-[#64748B]">
                  {products.some((p) => p.type === 'project')
                    ? "Every project already has a roadmap."
                    : (
                      <>
                        You don&apos;t have any projects yet.{' '}
                        <Link href="/dashboard/products" className="font-semibold text-[#394BE8]">Add a project</Link> first.
                      </>
                    )}
                </p>
              ) : (
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#8b909d]">Project</span>
                  <Dropdown<string>
                    value={boardForm.product_id}
                    options={availableProjects.map((p) => ({ value: p.id, label: p.title }))}
                    onChange={(value) => setBoardForm((current) => ({ ...current, product_id: value }))}
                  />
                </label>
              )}

              <label className="flex items-center justify-between gap-3 rounded-[12px] border border-[#e6e8ec] bg-[#fbfcfe] px-4 py-3">
                <div>
                  <span className="block text-[12px] font-semibold uppercase tracking-wide text-[#8b909d]">Share with users</span>
                  <p className="mt-1 text-[12.5px] text-[#64748B]">Show this roadmap on your public page so visitors can see what is coming next.</p>
                </div>
                <input
                  type="checkbox"
                  checked={boardForm.is_shared}
                  onChange={(e) => setBoardForm((current) => ({ ...current, is_shared: e.target.checked }))}
                  className="h-4 w-4 rounded border-[#cbd5e1] text-[#394BE8] focus:ring-[#394BE8]"
                />
              </label>

              {boardError && (
                <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] font-medium text-amber-700">
                  {boardError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setBoardModalOpen(false)}
                  className="h-9 rounded-full border border-[#e6e8ec] bg-white px-4 text-sm font-medium text-[#15171f] transition-colors hover:bg-[#f7f8fa]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveBoard}
                  disabled={!boardForm.product_id}
                  className="h-9 rounded-full bg-[#394BE8] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2f40d8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add roadmap
                </button>
              </div>
            </div>
          </div>
          </div>
        </>
      )}
    </div>
  )
}
