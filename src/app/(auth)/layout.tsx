export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {children}
    </div>
  )
}
