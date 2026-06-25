import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/SiteChrome'

export const metadata: Metadata = {
  title: 'Privacy Policy — Vuala',
  description: 'How Vuala collects, uses, and protects your data.',
}

const UPDATED = 'June 25, 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-[#171a21]">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-7 text-[#5c6573]">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FCFCFD] text-[#171a21]">
      <SiteHeader logoHref="/" sectionPrefix="/" />

      <section className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
        <p className="text-sm font-medium text-[#394be8]">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-[#9aa2b1]">Last updated: {UPDATED}</p>

        <p className="mt-8 text-[15px] leading-7 text-[#5c6573]">
          Vuala Labs, Inc. (&ldquo;Vuala&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) provides a page where indie
          developers and makers can showcase what they&apos;ve shipped and collect wishlists for what they&apos;re
          building next. This policy explains what data we collect, why we collect it, and the choices you have.
        </p>

        <Section title="1. Information we collect">
          <p><strong className="text-[#171a21]">Account information.</strong> When you sign up, we collect your name, email address, and username. If you sign in with Google or GitHub, we receive the basic profile information those providers share with us (name, email, avatar).</p>
          <p><strong className="text-[#171a21]">Content you add.</strong> Projects, descriptions, links, images, and roadmap items you add to your page.</p>
          <p><strong className="text-[#171a21]">Wishlist and inbox data.</strong> When a visitor joins a wishlist or sends a message through your page, we store the details they provide (such as name and email) so you can see and follow up with them.</p>
          <p><strong className="text-[#171a21]">Payment information.</strong> Paid plans are processed by Stripe. We do not store your card details — Stripe handles that and shares with us only what&apos;s needed to manage your subscription (such as plan, status, and billing email).</p>
          <p><strong className="text-[#171a21]">Usage data.</strong> Page views, link clicks, and similar analytics about how visitors interact with your Vuala page, so we can show you stats and improve the product.</p>
        </Section>

        <Section title="2. How we use your information">
          <p>We use the information above to provide and operate Vuala, including to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Create and display your public page</li>
            <li>Deliver wishlist and inbox messages to your dashboard</li>
            <li>Process payments and manage subscriptions</li>
            <li>Show you analytics about your page</li>
            <li>Send service-related emails, such as account or billing notices</li>
            <li>Keep Vuala secure and prevent abuse</li>
          </ul>
        </Section>

        <Section title="3. What's public">
          <p>
            Your Vuala page (e.g. <span className="text-[#394be8]">vuala.bio/yourname</span>) and the content you choose
            to add to it — your profile, shipped projects, and wishlist items — are public by design and visible to
            anyone with the link. Email addresses collected through wishlists or your inbox are private and only visible
            to you.
          </p>
        </Section>

        <Section title="4. Sharing your information">
          <p>We don&apos;t sell your personal information. We share data only with:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong className="text-[#171a21]">Service providers</strong> who help us run Vuala, such as Stripe (payments), our hosting and database providers, and email delivery services.</li>
            <li><strong className="text-[#171a21]">Authorities</strong> when required by law or to protect the rights, safety, and security of Vuala or our users.</li>
          </ul>
        </Section>

        <Section title="5. Data retention">
          <p>
            We keep your account data for as long as your account is active. If you delete your account, we delete or
            anonymize your personal information within a reasonable period, except where we need to retain it to
            comply with legal or accounting obligations.
          </p>
        </Section>

        <Section title="6. Your rights">
          <p>
            Depending on where you live, you may have the right to access, correct, export, or delete your personal
            data. You can update most of your information directly from your dashboard settings, or contact us to make
            a request.
          </p>
        </Section>

        <Section title="7. Cookies">
          <p>
            We use a small number of cookies to keep you signed in and to understand basic usage of the site. We don&apos;t
            use cookies for third-party advertising.
          </p>
        </Section>

        <Section title="8. Security">
          <p>
            We use reasonable technical and organizational measures to protect your data. No method of transmission or
            storage is perfectly secure, so we can&apos;t guarantee absolute security.
          </p>
        </Section>

        <Section title="9. Children">
          <p>Vuala is not intended for children under 16, and we do not knowingly collect data from them.</p>
        </Section>

        <Section title="10. Changes to this policy">
          <p>
            We may update this policy from time to time. If we make material changes, we&apos;ll let you know by email
            or with a notice on Vuala before the changes take effect.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Questions about this policy? Reach us at{' '}
            <a href="mailto:privacy@vuala.bio" className="text-[#394be8]">privacy@vuala.bio</a>.
          </p>
        </Section>
      </section>

      <SiteFooter />
    </main>
  )
}
