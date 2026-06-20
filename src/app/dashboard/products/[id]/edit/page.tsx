'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, PencilLine } from 'lucide-react'
import api from '@/lib/api'
import ProductForm, { ProductType } from '@/components/ProductForm'

export default function EditProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<null | Record<string, unknown>>(null)

  useEffect(() => {
    api.get(`/products`).then((r) => {
      const found = r.data.find((p: { id: string }) => p.id === id)
      if (found) setProduct(found)
    })
  }, [id])

  if (!product) return <div className="flex items-center justify-center h-40"><div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="space-y-1">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
        <div className="flex items-center gap-3 pt-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <PencilLine className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Product</h1>
            <p className="text-sm text-slate-500">Update the details shown on your storefront.</p>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ProductForm
          productId={id as string}
          initialData={{
            title: product.title as string,
            description: (product.description as string) || '',
            price: String(product.price),
            type: product.type as ProductType,
            cover_image_url: (product.cover_image_url as string) || '',
            file_url: (product.file_url as string) || '',
            app_store_url: (product.app_store_url as string) || '',
            play_store_url: (product.play_store_url as string) || '',
            wishlist_enabled: Boolean(product.wishlist_enabled ?? true),
            launch_date: ((product.launch_date as string) || '').slice(0, 10),
            beta_access_url: (product.beta_access_url as string) || '',
            is_active: product.is_active as boolean,
          }}
        />
      </div>
    </div>
  )
}
