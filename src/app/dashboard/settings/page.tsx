'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import api from '@/lib/api'
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Link2,
  LockKeyhole,
  LogOut,
  MessageSquareText,
  PackageCheck,
  Save,
  ShieldCheck,
  Star,
} from 'lucide-react'

interface NotificationPrefs {
  message_notifications: boolean
  wishlist_notifications: boolean
  weekly_analytics: boolean
  product_updates: boolean
}

const CARD = 'rounded-[12px] border border-[#e6e8ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
const fieldClass = 'h-10 w-full rounded-[9px] border border-[#e2e6ee] bg-white px-3 text-[13px] text-[#15171f] outline-none transition focus:border-[#394BE8] focus:ring-4 focus:ring-[#EEF1FF]'
const labelClass = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8b909d]'

const defaultPrefs: NotificationPrefs = {
  message_notifications: true,
  wishlist_notifications: true,
  weekly_analytics: true,
  product_updates: true,
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors ${checked ? 'bg-[#394BE8]' : 'bg-[#d8dde8]'}`}
      aria-pressed={checked}
    >
      <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const initialUsername = user?.storefront?.username ?? user?.username ?? ''
  const [username, setUsername] = useState(initialUsername)
  const [savedUsername, setSavedUsername] = useState(initialUsername)
  const [savingUsername, setSavingUsername] = useState(false)
  const [usernameSaved, setUsernameSaved] = useState(false)
  const [usernameError, setUsernameError] = useState('')

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [prefsSaved, setPrefsSaved] = useState(false)
  const [prefsError, setPrefsError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const origin = typeof window === 'undefined' ? '' : window.location.origin
  const normalizedUsername = username.trim().toLowerCase()
  const usernameChanged = normalizedUsername !== savedUsername

  useEffect(() => {
    api.get('/auth/notifications')
      .then((res) => setPrefs({ ...defaultPrefs, ...(res.data.notification_preferences ?? {}) }))
      .catch(() => {})
  }, [])

  const saveUsername = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!usernameChanged) return

    setSavingUsername(true)
    setUsernameSaved(false)
    setUsernameError('')

    try {
      const res = await api.put('/auth/username', { username: normalizedUsername })
      const nextUsername = res.data.storefront?.username ?? res.data.username
      setUsername(nextUsername)
      setSavedUsername(nextUsername)
      setUsernameSaved(true)
      setTimeout(() => setUsernameSaved(false), 2500)
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
      setUsernameError(data?.errors?.username?.[0] || data?.message || 'Could not update your link.')
    } finally {
      setSavingUsername(false)
    }
  }

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setSavingPassword(true)
    setPasswordSaved(false)
    setPasswordError('')

    try {
      await api.put('/auth/password', passwordForm)
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
      setPasswordSaved(true)
      setTimeout(() => setPasswordSaved(false), 2500)
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
      setPasswordError(data?.errors?.current_password?.[0] || data?.errors?.password?.[0] || data?.message || 'Could not update your password.')
    } finally {
      setSavingPassword(false)
    }
  }

  const saveNotifications = async () => {
    setSavingPrefs(true)
    setPrefsSaved(false)
    setPrefsError('')

    try {
      const res = await api.put('/auth/notifications', prefs)
      setPrefs({ ...defaultPrefs, ...(res.data.notification_preferences ?? {}) })
      setPrefsSaved(true)
      setTimeout(() => setPrefsSaved(false), 2500)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setPrefsError(message || 'Could not update notifications.')
    } finally {
      setSavingPrefs(false)
    }
  }

  const deleteAccount = async () => {
    if (deleteConfirm !== user?.email) return
    setDeleting(true)
    setDeleteError('')

    try {
      await api.delete('/auth/account', { data: { email: deleteConfirm } })
      await logout()
      router.push('/')
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
      setDeleteError(data?.errors?.email?.[0] || data?.message || 'Could not delete this account.')
      setDeleting(false)
    }
  }

  const notificationRows: Array<{
    key: keyof NotificationPrefs
    title: string
    description: string
    icon: React.ReactNode
  }> = [
    {
      key: 'message_notifications',
      title: 'Inbox messages',
      description: 'Email me when visitors send feedback, questions, or partnership notes.',
      icon: <MessageSquareText className="h-4 w-4" />,
    },
    {
      key: 'wishlist_notifications',
      title: 'Wishlist joins',
      description: 'Email me when someone joins a product wishlist.',
      icon: <Star className="h-4 w-4" />,
    },
    {
      key: 'weekly_analytics',
      title: 'Weekly analytics summary',
      description: 'Send a weekly digest of visitors, clicks, and wishlist growth.',
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      key: 'product_updates',
      title: 'Product updates',
      description: 'Occasional emails about Vuala improvements and important changes.',
      icon: <PackageCheck className="h-4 w-4" />,
    },
  ]

  return (
    <div className="min-h-full bg-[#FCFCFD] p-[18px_24px_36px_24px]">
      <div className="mx-auto max-w-[840px] space-y-3.5">
        <div className={`${CARD} px-5 py-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8b909d]">Settings</p>
              <h1 className="mt-1 text-[18px] font-semibold tracking-tight text-[#0F172A]">Account settings</h1>
              <p className="mt-1 text-[13px] text-[#64748B]">Manage access, notifications, and the public URL for your page.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3.5">
          <div className="space-y-3.5">
            <form onSubmit={saveUsername} className={`${CARD} overflow-hidden`}>
              <div className="flex items-start gap-3 border-b border-[#eef1f5] px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#eef0ff] text-[#394BE8]">
                  <Link2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Page URL</p>
                  <p className="mt-1 text-[12.5px] text-[#64748B]">Change the link people use to visit your public page.</p>
                </div>
              </div>

              <div className="space-y-4 px-5 py-5">
                {usernameError && <div className="rounded-[10px] border border-red-100 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700">{usernameError}</div>}
                {usernameSaved && <div className="rounded-[10px] border border-emerald-100 bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-700">Page link updated.</div>}

                <label className="block">
                  <span className={labelClass}>Username</span>
                  <div className="flex rounded-[9px] border border-[#e2e6ee] bg-white focus-within:border-[#394BE8] focus-within:ring-4 focus-within:ring-[#EEF1FF]">
                    <span className="flex items-center border-r border-[#edf0f5] px-3 text-[13px] font-medium text-[#8b909d]">{origin.replace(/^https?:\/\//, '')}/</span>
                    <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      className="h-10 min-w-0 flex-1 rounded-r-[9px] bg-transparent px-3 text-[13px] text-[#15171f] outline-none"
                      placeholder="your-name"
                    />
                  </div>
                </label>

              </div>

              <div className="flex justify-end border-t border-[#eef1f5] bg-[#fbfcfe] px-5 py-4">
                <button
                  type="submit"
                  disabled={savingUsername || !usernameChanged}
                  className="inline-flex h-9 items-center gap-2 rounded-[9px] bg-[#394BE8] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#2f40d8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingUsername ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" /> : <Save className="h-4 w-4" />}
                  Save URL
                </button>
              </div>
            </form>

            <form onSubmit={savePassword} className={`${CARD} overflow-hidden`}>
              <div className="flex items-start gap-3 border-b border-[#eef1f5] px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f0fbfa] text-[#0f766e]">
                  <LockKeyhole className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Security</p>
                  <p className="mt-1 text-[12.5px] text-[#64748B]">Update your password. Use at least 8 characters.</p>
                </div>
              </div>

              <div className="grid gap-4 px-5 py-5 md:grid-cols-3">
                {passwordError && <div className="sm:col-span-3 rounded-[10px] border border-red-100 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700">{passwordError}</div>}
                {passwordSaved && <div className="sm:col-span-3 rounded-[10px] border border-emerald-100 bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-700">Password updated.</div>}

                <label className="block">
                  <span className={labelClass}>Current password</span>
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm((current) => ({ ...current, current_password: e.target.value }))}
                    className={fieldClass}
                    autoComplete="current-password"
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>New password</span>
                  <input
                    type="password"
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm((current) => ({ ...current, password: e.target.value }))}
                    className={fieldClass}
                    autoComplete="new-password"
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Confirm password</span>
                  <input
                    type="password"
                    value={passwordForm.password_confirmation}
                    onChange={(e) => setPasswordForm((current) => ({ ...current, password_confirmation: e.target.value }))}
                    className={fieldClass}
                    autoComplete="new-password"
                  />
                </label>
              </div>

              <div className="flex justify-end border-t border-[#eef1f5] bg-[#fbfcfe] px-5 py-4">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex h-9 items-center gap-2 rounded-[9px] bg-[#394BE8] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#2f40d8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingPassword ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" /> : <ShieldCheck className="h-4 w-4" />}
                  Update password
                </button>
              </div>
            </form>

            <section className={`${CARD} overflow-hidden`}>
              <div className="flex items-start gap-3 border-b border-[#eef1f5] px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#fff7ed] text-[#c05621]">
                  <Bell className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Notifications</p>
                  <p className="mt-1 text-[12.5px] text-[#64748B]">Choose which account emails are worth your attention.</p>
                </div>
              </div>

              <div className="divide-y divide-[#eef1f5] px-5">
                {notificationRows.map((row) => (
                  <div key={row.key} className="flex items-center justify-between gap-4 py-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#e6e8ec] bg-[#fbfcfe] text-[#64748B]">
                        {row.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#15171f]">{row.title}</p>
                        <p className="mt-0.5 text-[12.5px] leading-5 text-[#64748B]">{row.description}</p>
                      </div>
                    </div>
                    <Toggle checked={prefs[row.key]} onChange={(checked) => setPrefs((current) => ({ ...current, [row.key]: checked }))} />
                  </div>
                ))}
              </div>

              {(prefsError || prefsSaved) && (
                <div className="px-5 pb-3">
                  {prefsError && <div className="rounded-[10px] border border-red-100 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700">{prefsError}</div>}
                  {prefsSaved && <div className="rounded-[10px] border border-emerald-100 bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-700">Notification settings saved.</div>}
                </div>
              )}

              <div className="flex justify-end border-t border-[#eef1f5] bg-[#fbfcfe] px-5 py-4">
                <button
                  type="button"
                  onClick={saveNotifications}
                  disabled={savingPrefs}
                  className="inline-flex h-9 items-center gap-2 rounded-[9px] bg-[#394BE8] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#2f40d8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingPrefs ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" /> : <Save className="h-4 w-4" />}
                  Save notifications
                </button>
              </div>
            </section>
          </div>

        </div>

        <div className={`${CARD} overflow-hidden`}>
          <div className="border-b border-[#eef1f5] px-5 py-4">
            <p className="text-sm font-semibold text-[#0F172A]">Session</p>
            <p className="mt-1 text-[12.5px] text-[#64748B]">Leave this device or permanently remove your account.</p>
          </div>

          <div className="space-y-3 px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#e6e8ec] bg-[#fbfcfe] px-4 py-3">
              <div>
                <p className="text-[13px] font-semibold text-[#15171f]">Sign out</p>
                <p className="mt-0.5 text-[12.5px] text-[#64748B]">End your current dashboard session.</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-9 items-center gap-2 rounded-[9px] border border-[#e6e8ec] bg-white px-3 text-[13px] font-semibold text-[#475569] transition-colors hover:bg-[#f7f8fa]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>

            <div className="rounded-[12px] border border-red-100 bg-red-50/60 px-4 py-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-white text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-red-900">Delete account</p>
                  <p className="mt-0.5 text-[12.5px] leading-5 text-red-700">
                    This permanently deletes your account, storefront, products, leads, messages, analytics, and roadmaps.
                  </p>

                  {deleteError && (
                    <div className="mt-3 rounded-[10px] border border-red-200 bg-white px-3 py-2 text-[13px] font-medium text-red-700">{deleteError}</div>
                  )}

                  <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      className="h-9 w-full rounded-[9px] border border-red-200 bg-white px-3 text-[13px] text-red-900 outline-none transition placeholder:text-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                      placeholder={`Type ${user?.email ?? 'your email'} to confirm`}
                    />
                    <button
                      type="button"
                      onClick={deleteAccount}
                      disabled={deleteConfirm !== user?.email || deleting}
                      className="inline-flex h-9 items-center justify-center rounded-[9px] bg-red-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {deleting ? 'Deleting' : 'Delete account'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
