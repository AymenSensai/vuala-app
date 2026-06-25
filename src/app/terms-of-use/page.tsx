import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/SiteChrome'

export const metadata: Metadata = {
  title: 'Terms of Use — Vuala',
  description: 'The terms that govern your use of Vuala.',
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

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-[#FCFCFD] text-[#171a21]">
      <SiteHeader logoHref="/" sectionPrefix="/" />

      <section className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
        <p className="text-sm font-medium text-[#394be8]">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Terms of Use</h1>
        <p className="mt-3 text-sm text-[#9aa2b1]">Last updated: {UPDATED}</p>

        <p className="mt-8 text-[15px] leading-7 text-[#5c6573]">
          These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of Vuala, operated by Vuala Labs,
          Inc. (&ldquo;Vuala&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By creating an account or using Vuala, you
          agree to these Terms. If you don&apos;t agree, please don&apos;t use Vuala.
        </p>

        <Section title="1. Your account">
          <p>
            You must provide accurate information when creating your account and keep your login credentials secure.
            You&apos;re responsible for all activity that happens under your account, including content posted to your
            page.
          </p>
        </Section>

        <Section title="2. Your content">
          <p>
            You keep ownership of the content you add to Vuala — your projects, descriptions, images, and roadmap
            items. By posting content, you grant us a non-exclusive, worldwide license to host, display, and
            distribute it as part of operating Vuala (for example, showing your public page to visitors).
          </p>
          <p>You&apos;re responsible for the content you post and confirm that you have the rights to share it.</p>
        </Section>

        <Section title="3. Acceptable use">
          <p>You agree not to use Vuala to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Post unlawful, fraudulent, or misleading content</li>
            <li>Infringe someone else&apos;s intellectual property or other rights</li>
            <li>Distribute malware, spam, or unsolicited bulk messages</li>
            <li>Harass, abuse, or impersonate others</li>
            <li>Interfere with or disrupt Vuala&apos;s infrastructure or security</li>
            <li>Scrape or access Vuala in an automated way outside of any API we provide</li>
          </ul>
          <p>We may remove content or suspend accounts that violate these Terms.</p>
        </Section>

        <Section title="4. Wishlists and inbox messages">
          <p>
            Vuala lets visitors join wishlists or send you messages through your page. You&apos;re responsible for
            handling that data lawfully — for example, only contacting people about the project they showed interest
            in, and honoring any opt-out or deletion requests they make.
          </p>
        </Section>

        <Section title="5. Plans and payments">
          <p>
            Some features require a paid plan. Payments are processed securely through Stripe. Plans renew
            automatically until canceled; you can cancel anytime from your dashboard, and cancellation takes effect at
            the end of the current billing period. Fees are non-refundable except where required by law.
          </p>
        </Section>

        <Section title="6. Your username and page">
          <p>
            Your Vuala URL (e.g. <span className="text-[#394be8]">vuala.bio/yourname</span>) is yours to use while
            your account is active. We reserve the right to reclaim usernames that are inactive for an extended
            period, impersonate others, or infringe a trademark.
          </p>
        </Section>

        <Section title="7. Termination">
          <p>
            You may delete your account at any time from your dashboard settings. We may suspend or terminate your
            account if you violate these Terms or if we reasonably believe your use of Vuala creates risk or harm to
            us or others.
          </p>
        </Section>

        <Section title="8. Disclaimers">
          <p>
            Vuala is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied. We don&apos;t
            guarantee that Vuala will be uninterrupted, error-free, or that any wishlist or inbox lead will convert
            into a customer.
          </p>
        </Section>

        <Section title="9. Limitation of liability">
          <p>
            To the maximum extent permitted by law, Vuala will not be liable for any indirect, incidental, or
            consequential damages arising from your use of the service. Our total liability for any claim is limited
            to the amount you paid us in the 12 months before the claim arose.
          </p>
        </Section>

        <Section title="10. Changes to these Terms">
          <p>
            We may update these Terms from time to time. If we make material changes, we&apos;ll notify you by email
            or with a notice on Vuala before the changes take effect. Continuing to use Vuala after changes take
            effect means you accept the updated Terms.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Questions about these Terms? Reach us at{' '}
            <a href="mailto:hello@vuala.bio" className="text-[#394be8]">hello@vuala.bio</a>.
          </p>
        </Section>
      </section>

      <SiteFooter />
    </main>
  )
}
