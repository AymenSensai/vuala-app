import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment cancelled</h1>
        <p className="text-slate-500 mb-8">
          Your payment was cancelled and you have not been charged.
        </p>
        <Link
          href="javascript:history.back()"
          className="inline-flex items-center bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          ← Go back
        </Link>
      </div>
    </div>
  )
}
