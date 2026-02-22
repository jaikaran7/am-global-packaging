"use client";

import { useState, useEffect, useRef } from "react";
import { Transition } from "@headlessui/react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useDropdownManager } from "@/components/ui/use-dropdown-manager";

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

  useDropdownManager(isOpen, () => setIsOpen(false));

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
    <div ref={ref} className="relative w-full overflow-visible">
      <div
        className="admin-btn-secondary w-full py-2.5 px-3 rounded-xl flex items-center gap-2 cursor-pointer"
        onClick={() => !disabled && setIsOpen(true)}
      >
        <UserIcon className="w-4 h-4 text-[#9aa6b0]" />
        <span className="text-sm text-[#9aa6b0]">Select customer...</span>
      </div>

      <Transition appear show={isOpen} as="div" className="contents">
        <Transition.Child
          as="div"
          enter="transition duration-150 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition duration-150 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="absolute top-full left-0 mt-2 w-full z-[70] rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden origin-top">
            <div className="p-2 border-b border-slate-100">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50">
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
                    className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-[#6b7280]">
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
            <div className="p-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onCreateNew();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#ff7a2d] hover:bg-orange-50 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Create new customer
              </button>
            </div>
          </div>
        </Transition.Child>
      </Transition>
    </div>
  );
}
