'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import api from '@/lib/api'
import {
  Check,
  ChevronDown,
  Download,
  Maximize2,
  Search,
  X,
} from 'lucide-react'

type MessageType = 'feedback' | 'feature_request' | 'offer' | 'partnership' | 'bug' | 'question' | 'other'
type TypeFilter = MessageType | 'all'
const MESSAGE_PAGE_SIZE = 10

interface InboxMessage {
  id: string
  name: string
  email: string
  message_type: MessageType
  subject: string | null
  message: string
  page_path: string | null
  source_label: string
  created_at: string
  product: { id: string; title: string; type: string } | null
}

interface FacetItem {
  key: string
  label: string
  count: number
}

const TYPE_META: Record<MessageType, { label: string; tone: string }> = {
  feedback: { label: 'Feedback', tone: 'text-[#394BE8] border-[#d9ddf9] bg-[#f4f5fe]' },
  feature_request: { label: 'Feature request', tone: 'text-[#7c3aed] border-[#e7ddfb] bg-[#faf7ff]' },
  offer: { label: 'Offer', tone: 'text-[#c2410c] border-[#f6ddcb] bg-[#fff6ef]' },
  partnership: { label: 'Partnership', tone: 'text-[#0f766e] border-[#cde8e4] bg-[#f0fbfa]' },
  bug: { label: 'Bug', tone: 'text-[#b91c1c] border-[#f2c9c9] bg-[#fff5f5]' },
  question: { label: 'Question', tone: 'text-[#475569] border-[#e2e8f0] bg-[#f8fafc]' },
  other: { label: 'Other', tone: 'text-[#475569] border-[#e2e8f0] bg-[#f8fafc]' },
}

function fmtDateTime(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
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
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex h-[32px] w-full items-center justify-between gap-2 rounded-[8px] border border-[#e6e8ec] bg-white px-[10px] text-left text-[13px] text-[#15171f] outline-none"
      >
        <span className="min-w-0 truncate">{selected?.label ?? label}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[#8b909d] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-[10px] border border-[#e6e8ec] bg-white shadow-[0_12px_32px_rgba(16,24,40,0.12)]">
          <button
            type="button"
            onClick={() => { onSelect(null); setOpen(false) }}
            className={`flex w-full items-center justify-between gap-2 px-[10px] py-[9px] text-left text-[13px] transition-colors ${activeKey == null ? 'bg-[#f4f5fe] text-[#394BE8]' : 'text-[#15171f] hover:bg-[#f7f8fa]'}`}
          >
            <span className="truncate">{emptyLabel}</span>
            {activeKey == null && <Check className="h-3.5 w-3.5 shrink-0 text-[#394BE8]" />}
          </button>
          <div className="max-h-[260px] overflow-auto border-t border-[#eef0f3]">
            {items.map((item) => {
              const active = activeKey === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => { onSelect(item.key); setOpen(false) }}
                  className={`flex w-full items-center justify-between gap-2 px-[10px] py-[9px] text-left text-[13px] transition-colors ${active ? 'bg-[#f4f5fe] text-[#394BE8]' : 'text-[#15171f] hover:bg-[#f7f8fa]'}`}
                >
                  <span className="truncate">{item.label}</span>
                  <span className="font-mono text-[11px] text-[#8b909d]">{item.count}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function InboxPage() {
  const [messages, setMessages] = useState<InboxMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [page, setPage] = useState(1)
  const [viewingMessage, setViewingMessage] = useState<InboxMessage | null>(null)

  useEffect(() => {
    api.get('/messages')
      .then((res) => setMessages(res.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return messages.filter((message) => {
      const matchesSearch =
        !q ||
        message.name.toLowerCase().includes(q) ||
        message.email.toLowerCase().includes(q) ||
        (message.subject ?? '').toLowerCase().includes(q) ||
        message.message.toLowerCase().includes(q) ||
        (message.product?.title ?? '').toLowerCase().includes(q) ||
        message.source_label.toLowerCase().includes(q)

      const matchesType = typeFilter === 'all' || message.message_type === typeFilter
      return matchesSearch && matchesType
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [messages, search, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / MESSAGE_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * MESSAGE_PAGE_SIZE
  const pageRows = filtered.slice(startIndex, startIndex + MESSAGE_PAGE_SIZE)

  const counts = useMemo(() => {
    const weekAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000
    const newThisWeek = messages.filter((m) => new Date(m.created_at).getTime() >= weekAgo).length
    const uniqueSenders = new Set(messages.map((m) => m.email)).size

    const typeCounts: Partial<Record<MessageType, number>> = {}
    messages.forEach((m) => { typeCounts[m.message_type] = (typeCounts[m.message_type] ?? 0) + 1 })
    const topTypeEntry = (Object.entries(typeCounts) as [MessageType, number][]).sort((a, b) => b[1] - a[1])[0]
    const topType = topTypeEntry ? TYPE_META[topTypeEntry[0]].label : '—'

    return { total: messages.length, newThisWeek, uniqueSenders, topType }
  }, [messages])

  const typeItems = useMemo<FacetItem[]>(() => ([
    { key: 'feedback', label: 'Feedback', count: messages.filter((m) => m.message_type === 'feedback').length },
    { key: 'feature_request', label: 'Feature request', count: messages.filter((m) => m.message_type === 'feature_request').length },
    { key: 'offer', label: 'Offer', count: messages.filter((m) => m.message_type === 'offer').length },
    { key: 'partnership', label: 'Partnership', count: messages.filter((m) => m.message_type === 'partnership').length },
    { key: 'bug', label: 'Bug', count: messages.filter((m) => m.message_type === 'bug').length },
    { key: 'question', label: 'Question', count: messages.filter((m) => m.message_type === 'question').length },
    { key: 'other', label: 'Other', count: messages.filter((m) => m.message_type === 'other').length },
  ]), [messages])

  const exportInbox = (rows: InboxMessage[]) => {
    const csvVal = (v: string | number) => {
      const s = String(v)
      return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
    }
    const data = [
      ['Name', 'Email', 'Message', 'Type', 'Source', 'Received'],
      ...rows.map((row) => [
        row.name,
        row.email,
        row.message,
        TYPE_META[row.message_type].label,
        row.source_label,
        new Date(row.created_at).toISOString(),
      ]),
    ]
    const csv = data.map((row) => row.map(csvVal).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inbox.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const card = 'rounded-xl border border-[#E7EAF0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] py-4 px-[18px]'
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#394BE8] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#FCFCFD] p-[18px_24px_36px_24px]">
      <div className="max-w-[1440px] mx-auto">
        <section className={`${card} col-span-12 grid grid-cols-4 gap-3`}>
          {[
            { label: 'Total messages', value: counts.total },
            { label: 'New this week', value: counts.newThisWeek },
            { label: 'Top type', value: counts.topType, small: true },
            { label: 'Unique senders', value: counts.uniqueSenders },
          ].map((item, index) => (
            <div key={item.label} className={`px-3 py-1.5 ${index > 0 ? 'border-l border-[#f1f5f9]' : ''}`}>
              <p className="text-[11.5px] font-medium text-[#64748B]">{item.label}</p>
              <p className={`mt-1 font-bold leading-none tabular-nums text-[#0F172A] ${item.small ? 'text-[16px] truncate' : 'text-[22px]'}`}>{item.value}</p>
            </div>
          ))}
        </section>

        <section className={`${card} col-span-12 mt-3.5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative w-[232px] min-w-[232px] max-[960px]:w-full max-[960px]:min-w-0">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8b909d]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search messages"
                    className="h-[32px] w-full rounded-[8px] border border-[#e6e8ec] bg-white pl-9 pr-9 text-[13px] text-[#15171f] outline-none"
                  />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[#394BE8]"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <FacetDropdown
                label="Type"
                emptyLabel="All types"
                items={typeItems}
                activeKey={typeFilter === 'all' ? null : typeFilter}
                onSelect={(key) => setTypeFilter((key as TypeFilter) ?? 'all')}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportInbox(filtered)}
                className="inline-flex h-[32px] items-center gap-[6px] rounded-[8px] bg-[#394be8] px-[11px] text-[13px] font-semibold text-white transition-colors hover:bg-[#2f3fd1]"
              >
                <Download className="h-[14px] w-[14px]" />
                Export inbox
              </button>
            </div>
          </div>
        </section>

        <section className="col-span-12 mt-3.5">
          <div className="overflow-hidden rounded-[10px] border border-[#e6e8ec] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 960 }}>
                <thead>
                  <tr>
                    {['Name', 'Message', 'Type', 'Source', 'Received'].map((col) => (
                      <th key={col} className="bg-[#fafbfc] border-b border-[#e6e8ec] px-3 py-[7px] text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8b909d] whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((message) => (
                    <tr key={message.id} className="transition-colors hover:bg-[#fafbfd]">
                      <td className="border-b border-[#f0f1f4] px-3 py-[6px] text-[13px] font-semibold text-[#15171f] whitespace-nowrap">
                        {message.name}
                        <div className="text-[12px] font-normal text-[#8b909d]">{message.email}</div>
                      </td>
                      <td className="max-w-[260px] border-b border-[#f0f1f4] px-3 py-[6px] text-[13px] text-[#5b606e] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span title={message.message} className="min-w-0 flex-1 overflow-hidden text-ellipsis">
                            {message.message}
                          </span>
                          <button
                            type="button"
                            onClick={() => setViewingMessage(message)}
                            title="View full message"
                            aria-label="View full message"
                            className="flex-shrink-0 rounded-[6px] p-1 text-[#8b909d] transition-colors hover:bg-[#f1f3f7] hover:text-[#394BE8]"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="border-b border-[#f0f1f4] px-3 py-[6px] whitespace-nowrap">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11.5px] font-medium ${TYPE_META[message.message_type].tone}`}>
                          {TYPE_META[message.message_type].label}
                        </span>
                      </td>
                      <td className="border-b border-[#f0f1f4] px-3 py-[6px] whitespace-nowrap">
                        <span className="inline-flex items-center gap-[6px] text-[12px] font-medium px-[9px] py-[2px] rounded-full border bg-[#f7f8fa] border-[#e8eaee] text-[#424754]">
                          {message.source_label}
                        </span>
                      </td>
                      <td className="border-b border-[#f0f1f4] px-3 py-[6px] text-[12.5px] text-[#8b909d] whitespace-nowrap">
                        {fmtDateTime(message.created_at)}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-9 text-center text-[13px] text-[#8b909d]">
                        No messages match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-[#f0f1f4] bg-[#fafbfc] px-[14px] py-2 text-[12px] text-[#8b909d]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>
                  {filtered.length === 0
                    ? 'Showing 0 messages'
                    : `Showing ${startIndex + 1}-${Math.min(startIndex + pageRows.length, filtered.length)} of ${filtered.length} messages`}
                </span>
                {filtered.length > MESSAGE_PAGE_SIZE && (
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPage((curr) => Math.max(1, curr - 1))}
                      disabled={currentPage === 1}
                      className="h-[26px] rounded-[6px] border border-[#e6e8ec] bg-white px-[9px] text-[12px] font-medium text-[#15171f] transition-colors hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .map((p, idx, arr) => (
                        <span key={p} className="inline-flex items-center gap-1">
                          {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-[#c3c7d0]">…</span>}
                          <button
                            type="button"
                            onClick={() => setPage(p)}
                            className={`min-w-[26px] h-[26px] rounded-[6px] px-2 text-[12px] font-medium transition-colors ${p === currentPage ? 'bg-[#394BE8] text-white' : 'border border-[#e6e8ec] bg-white text-[#15171f] hover:bg-[#f7f8fa]'}`}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                    <button
                      type="button"
                      onClick={() => setPage((curr) => Math.min(totalPages, curr + 1))}
                      disabled={currentPage === totalPages}
                      className="h-[26px] rounded-[6px] border border-[#e6e8ec] bg-white px-[9px] text-[12px] font-medium text-[#15171f] transition-colors hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {viewingMessage && (
        <>
          <div className="fixed inset-0 z-30 bg-black/40" onClick={() => setViewingMessage(null)} />
          <div className="fixed inset-0 z-40 flex items-center justify-center px-4 py-4">
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-[18px] border border-[#e6e8ec] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.16)]"
            >
              <div className="flex items-start justify-between border-b border-[#eef1f5] px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-[#0F172A]">{viewingMessage.name}</p>
                  <p className="truncate text-sm text-[#64748B]">{viewingMessage.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingMessage(null)}
                  className="rounded-full p-1.5 text-[#8b909d] transition-colors hover:bg-[#f7f8fa] hover:text-[#475569]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11.5px] font-medium ${TYPE_META[viewingMessage.message_type].tone}`}>
                    {TYPE_META[viewingMessage.message_type].label}
                  </span>
                  <span className="inline-flex items-center gap-[6px] rounded-full border border-[#e8eaee] bg-[#f7f8fa] px-[9px] py-[2px] text-[12px] font-medium text-[#424754]">
                    {viewingMessage.source_label}
                  </span>
                  {viewingMessage.product && (
                    <span className="inline-flex items-center gap-[6px] rounded-full border border-[#e8eaee] bg-[#f7f8fa] px-[9px] py-[2px] text-[12px] font-medium text-[#424754]">
                      {viewingMessage.product.title}
                    </span>
                  )}
                  <span className="text-[12.5px] text-[#8b909d]">{fmtDateTime(viewingMessage.created_at)}</span>
                </div>

                <div className="h-[260px] overflow-y-auto rounded-xl border border-[#eef1f5] bg-[#fafbfc] px-3.5 py-3">
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#15171f]">
                    {viewingMessage.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-[#eef1f5] bg-[#fafbfc] px-5 py-3.5">
                <button
                  type="button"
                  onClick={() => setViewingMessage(null)}
                  className="h-9 rounded-xl border border-[#e6e8ec] bg-white px-4 text-sm font-medium text-[#15171f] transition-colors hover:bg-[#f7f8fa]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
