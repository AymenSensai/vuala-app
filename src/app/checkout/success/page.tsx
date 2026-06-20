import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment successful!</h1>
        <p className="text-slate-500 mb-8">
          Thank you for your purchase. You&apos;ll receive a confirmation email shortly.
        </p>
        <Link
          href="/"
          className="inline-flex items-center bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
