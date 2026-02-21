"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ArrowUpTrayIcon, StarIcon, TrashIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

type ImageRow = { id: string; url: string; is_primary: boolean; variant_id?: string | null };

interface ImageUploaderProps {
  productId: string;
  variantId?: string | null;
  images: ImageRow[];
  onUploaded: () => void;
}

export default function ImageUploader({
  productId,
  variantId,
  images,
  onUploaded,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("is_primary", images.length === 0 ? "true" : "false");
      if (variantId) form.set("variant_id", variantId);
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Upload failed");
      }
      onUploaded();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSetPrimary(imageId: string) {
    await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_primary: true }),
    });
    onUploaded();
  }

  async function handleDelete(imageId: string) {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/admin/products/${productId}/images/${imageId}`, { method: "DELETE" });
    onUploaded();
  }

  return (
    <div className="glass glass--soft rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-[#2b2f33] uppercase tracking-wider mb-4">
        {variantId ? "Variant images" : "Product images"}
      </h3>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#f0f0f0] border border-white/80"
          >
            <Image
              src={img.url}
              alt=""
              fill
              className="object-cover"
              sizes="96px"
            />
            {img.is_primary && (
              <span className="absolute top-1 left-1 text-amber-500">
                <StarSolidIcon className="w-4 h-4" />
              </span>
            )}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between p-1 bg-black/40">
              {!img.is_primary && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(img.id)}
                  className="text-white/90 hover:text-white p-0.5"
                  aria-label="Set as primary"
                >
                  <StarIcon className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                className="text-red-300 hover:text-white p-0.5 ml-auto"
                aria-label="Delete image"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 rounded-xl border-2 border-dashed border-[#d1d5db] flex flex-col items-center justify-center gap-1 text-[#6b7280] hover:border-[#ff7a2d] hover:text-[#ff7a2d] transition-colors"
        >
          <ArrowUpTrayIcon className="w-6 h-6" />
          <span className="text-xs">{uploading ? "Uploading…" : "Upload"}</span>
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
