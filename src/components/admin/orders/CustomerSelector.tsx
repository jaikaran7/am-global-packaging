"use client";

import { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
};

interface CustomerSelectorProps {
  selectedCustomerId: string | null;
  onSelect: (customer: Customer) => void;
  onCreateNew: () => void;
  disabled?: boolean;
}

export default function CustomerSelector({
  selectedCustomerId,
  onSelect,
  onCreateNew,
  disabled,
}: CustomerSelectorProps) {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!selectedCustomerId) {
      setSelected(null);
      return;
    }
    fetch(`/api/admin/customers?search=&limit=50`)
      .then((r) => r.json())
      .then((data: Customer[]) => {
        const found = data.find((c) => c.id === selectedCustomerId);
        if (found) setSelected(found);
      })
      .catch(() => {});
  }, [selectedCustomerId]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/admin/customers?search=${encodeURIComponent(search)}&limit=20`)
        .then((r) => r.json())
        .then((data: Customer[]) => setCustomers(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, isOpen]);

  const handleSelect = (customer: Customer) => {
    setSelected(customer);
    onSelect(customer);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    setSelected(null);
    onSelect({ id: "", name: "", email: null, phone: null, company: null });
    setSearch("");
  };

  if (selected) {
    return (
      <div className="glass rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff7a2d] to-[#ff9a5c] flex items-center justify-center text-white text-sm font-bold">
            {selected.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-[#2b2f33]">{selected.name}</p>
            <p className="text-xs text-[#9aa6b0]">
              {selected.company && `${selected.company} · `}
              {selected.email}
            </p>
          </div>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg hover:bg-red-50 text-[#9aa6b0] hover:text-red-500 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div
        className="admin-btn-secondary w-full py-2.5 px-3 rounded-xl flex items-center gap-2 cursor-pointer"
        onClick={() => !disabled && setIsOpen(true)}
      >
        <UserIcon className="w-4 h-4 text-[#9aa6b0]" />
        <span className="text-sm text-[#9aa6b0]">Select customer...</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 glass rounded-xl shadow-lg border border-white/60 overflow-hidden">
          <div className="p-2 border-b border-gray-100/50">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-50/50">
              <MagnifyingGlassIcon className="w-4 h-4 text-[#9aa6b0]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers..."
                className="flex-1 bg-transparent text-sm outline-none text-[#2b2f33] placeholder-[#9aa6b0]"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {loading && (
              <div className="p-3 text-center text-sm text-[#9aa6b0]">Loading...</div>
            )}
            {!loading && customers.length === 0 && (
              <div className="p-3 text-center text-sm text-[#9aa6b0]">No customers found</div>
            )}
            {!loading &&
              customers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-white/60 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-[#6b7280]">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2b2f33]">{c.name}</p>
                    <p className="text-xs text-[#9aa6b0]">
                      {c.company && `${c.company} · `}
                      {c.email}
                    </p>
                  </div>
                </button>
              ))}
          </div>
          <div className="p-2 border-t border-gray-100/50">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onCreateNew();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#ff7a2d] hover:bg-orange-50/50 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Create new customer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
