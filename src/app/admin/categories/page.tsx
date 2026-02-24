"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

type Category = { id: string; name: string; slug: string; description: string | null };

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/admin/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: fetchCategories,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; slug: string }) => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Failed to create");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products-stats"] });
      setNewName("");
      setNewSlug("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name, slug }: { id: string; name: string; slug: string }) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Failed to update");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Failed to delete");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products-stats"] });
    },
  });

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditSlug(c.slug);
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-red-600">
        {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-[#2b2f33] tracking-tight">Categories</h1>

      <div className="glass glass--soft rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[#2b2f33] uppercase tracking-wider mb-4">Add category</h3>
        <div className="flex flex-wrap gap-3">
          <input
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              if (!newSlug) setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
            }}
            placeholder="Name"
            className="admin-btn-secondary py-2 px-3 rounded-xl text-sm w-48"
          />
          <input
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="Slug"
            className="admin-btn-secondary py-2 px-3 rounded-xl text-sm w-48"
          />
          <button
            type="button"
            onClick={() => {
              if (newName.trim() && newSlug.trim()) createMutation.mutate({ name: newName.trim(), slug: newSlug.trim() });
            }}
            disabled={createMutation.isPending || !newName.trim() || !newSlug.trim()}
            className="admin-btn-primary py-2 px-4 text-sm font-medium inline-flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      <div className="glass glass--soft rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[#6b7280]">Loading…</div>
        ) : (
          <ul className="divide-y divide-[#e5e7eb]">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 p-4">
                {editingId === c.id ? (
                  <>
                    <div className="flex gap-2 flex-1">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="admin-btn-secondary py-1.5 px-3 rounded-lg text-sm flex-1"
                      />
                      <input
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="admin-btn-secondary py-1.5 px-3 rounded-lg text-sm flex-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateMutation.mutate({ id: c.id, name: editName, slug: editSlug })}
                        disabled={updateMutation.isPending}
                        className="admin-btn-primary py-1.5 px-3 text-sm"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="admin-btn-secondary py-1.5 px-3 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="font-medium text-[#2b2f33]">{c.name}</span>
                      <span className="text-[#6b7280] text-sm ml-2">({c.slug})</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="p-2 rounded-lg text-[#6b7280] hover:bg-white/60"
                        aria-label="Edit"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete category "${c.name}"? Products may become uncategorised.`)) {
                            deleteMutation.mutate(c.id);
                          }
                        }}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                        aria-label="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
