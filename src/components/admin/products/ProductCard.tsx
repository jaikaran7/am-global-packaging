"use client";

import Link from "next/link";
import Image from "next/image";
import {
  PencilSquareIcon,
  TrashIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

type RepresentativeVariant = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  dimensions: { length_mm?: number; width_mm?: number; height_mm?: number } | null;
  is_primary: boolean;
};

export type AdminProductItem = {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  short_description: string | null;
  active: boolean;
  featured: boolean;
  created_at: string;
  category?: { id: string; name: string; slug: string } | null;
  variant_count: number;
  representative_variant: RepresentativeVariant | null;
  primary_image_url: string | null;
};

interface ProductCardProps {
  product: AdminProductItem;
  onDelete: (id: string) => void;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 2 }).format(n);
}

function dimsString(d: RepresentativeVariant["dimensions"]) {
  if (!d) return null;
  const l = d.length_mm ?? 0;
  const w = d.width_mm ?? 0;
  const h = d.height_mm ?? 0;
  if (!l && !w && !h) return null;
  return `${l} × ${w} × ${h} mm`;
}

export default function ProductCard({ product, onDelete }: Readonly<ProductCardProps>) {
  const v = product.representative_variant;
  const dims = v ? dimsString(v.dimensions) : null;

  return (
    <div className="glass glass--soft rounded-2xl overflow-hidden admin-card-warm flex flex-col h-full">
      <div className="relative aspect-[4/3] bg-[#f5f5f5] flex items-center justify-center">
        {product.primary_image_url ? (
          <Image
            src={product.primary_image_url}
            alt={product.title}
            fill
            className="object-contain"
            sizes="(max-width: 400px) 100vw, 320px"
          />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-[#e8e8e8] flex items-center justify-center">
            <CubeIcon className="w-12 h-12 text-[#9aa6b0]" />
          </div>
        )}
        {dims && (
          <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-[#6b7280] shadow-sm">
            {dims.replaceAll(" × ", " x ")}
          </span>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {product.variant_count > 1 && (
            <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-[#ff7a2d] text-white">
              {product.variant_count} types
            </span>
          )}
          {!product.active && (
            <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-[#9aa6b0] text-white">Inactive</span>
          )}
          {product.featured && (
            <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-emerald-600 text-white">Featured</span>
          )}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-[#2b2f33] line-clamp-2 mb-1">{product.title}</h3>
        {product.short_description && (
          <p className="text-sm text-[#6b7280] line-clamp-2 mb-3">{product.short_description}</p>
        )}
        <div className="mt-auto space-y-1">
          {v && (
            <p className="text-sm font-semibold text-[#ff7a2d]">From {formatPrice(v.price)}</p>
          )}
          {v && (
            <p className="text-xs text-[#6b7280]">MOQ: {v.name}</p>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <Link
            href={`/admin/products/${product.id}`}
            className="admin-btn-secondary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium"
          >
            <PencilSquareIcon className="w-4 h-4" /> Edit
          </Link>
          <button
            type="button"
            onClick={() => onDelete(product.id)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-2"
          >
            <TrashIcon className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
