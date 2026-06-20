'use client'

import Link from 'next/link'

type SiteHeaderProps = {
  logoHref?: string
  sectionPrefix?: string
}

export function SiteHeader({ logoHref = '#top', sectionPrefix = '' }: SiteHeaderProps) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(251,251,252,0.8)', backdropFilter: 'saturate(180%) blur(12px)', borderBottom: '1px solid #eef0f3' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 28px', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href={logoHref} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Vuala" style={{ width: '27px', height: '27px', borderRadius: '8px', objectFit: 'cover', display: 'block' }} />
          <span style={{ fontWeight: 700, fontSize: '19px', letterSpacing: '-0.02em', color: '#1b1f27' }}>vuala</span>
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          {[['features', 'Features'], ['wishlists', 'Wishlists'], ['pricing', 'Pricing'], ['faq', 'FAQ']].map(([id, label]) => (
            id === 'wishlists' ? (
              <Link key={id} href="/wishlists" style={{ textDecoration: 'none', color: '#5c6573', fontSize: '14.5px', fontWeight: 500 }}>{label}</Link>
            ) : (
              <a key={id} href={`${sectionPrefix}#${id}`} style={{ textDecoration: 'none', color: '#5c6573', fontSize: '14.5px', fontWeight: 500 }}>{label}</a>
            )
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <Link href="/login" style={{ textDecoration: 'none', color: '#5c6573', fontSize: '14.5px', fontWeight: 500 }}>Sign in</Link>
          <Link href="/register" style={{ textDecoration: 'none', background: '#394be8', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '9px 17px', borderRadius: '9px', boxShadow: '0 1px 2px rgba(57,75,232,.25)' }}>
            Create your page
          </Link>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  const cols = [
    { heading: 'Product', links: ['Features', 'Wishlists', 'Pricing'] },
    { heading: 'Company', links: ['Privacy', 'Terms'] },
  ]

  const hrefs: Record<string, string> = { Features: '#features', Wishlists: '#wishlist', Pricing: '#pricing' }

  return (
    <footer style={{ background: '#fff', borderTop: '1px solid #f0f1f4' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '54px 28px 34px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr 1fr', gap: '32px', marginBottom: '44px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '13px' }}>
              <img src="/logo.png" alt="Vuala" style={{ width: '27px', height: '27px', borderRadius: '8px', objectFit: 'cover', display: 'block' }} />
              <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em', color: '#171a21' }}>vuala</span>
            </div>
            <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: '#8a93a3', margin: 0, maxWidth: '250px' }}>
              A calm home for what you&apos;ve built and what&apos;s coming next. Made for makers.
            </p>
          </div>

          {cols.map(({ heading, links }) => (
            <div key={heading}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#171a21', marginBottom: '14px' }}>{heading}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13.5px' }}>
                {links.map(link => (
                  <a key={link} href={hrefs[link] || '#'} style={{ color: '#8a93a3', textDecoration: 'none' }}>{link}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: '26px', borderTop: '1px solid #f0f1f4' }}>
          <span style={{ fontSize: '13px', color: '#9aa2b1' }}>© 2026 Vuala Labs, Inc.</span>
        </div>
      </div>
    </footer>
  )
}
