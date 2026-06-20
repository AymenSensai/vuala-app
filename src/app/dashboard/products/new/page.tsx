import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProductForm from '@/components/ProductForm'

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#394BE8] transition hover:text-[#2D3BC2]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to store
      </Link>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ProductForm />
      </div>
    </div>
  )
}
