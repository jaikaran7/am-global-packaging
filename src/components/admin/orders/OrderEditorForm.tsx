"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PlusIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import CustomerSelector from "./CustomerSelector";
import OrderItemRow from "./OrderItemRow";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderStatusTimeline from "./OrderStatusTimeline";
import {
  ORDER_STATUS_CONFIG,
  VALID_TRANSITIONS,
  type OrderStatus,
} from "@/lib/schemas/order";
import { isAustralianPhone } from "@/lib/validation/phone";
import { toast } from "sonner";

type Product = { id: string; title: string; slug: string };
type OrderItem = {
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  custom_name?: string;
  custom_spec?: string;
  custom_notes?: string;
};

interface OrderData {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer: { id: string; name: string; email: string | null; phone: string | null; company: string | null } | null;
  status: string;
  source_quote_id?: string | null;
  source_quote_version?: number | null;
  quotation_id?: string | null;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  shipping_provider: string | null;
  tracking_id: string | null;
  shipped_date: string | null;
  delivered_date: string | null;
  created_at: string;
  items: Array<{
    id: string;
    product_id: string;
    variant_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product?: { id: string; title: string };
    variant?: { id: string; name: string; stock: number; reserved_stock: number };
  }>;
}

interface OrderEditorFormProps {
  orderId?: string;
}

export default function OrderEditorForm({ orderId }: OrderEditorFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!orderId;

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [items, setItems] = useState<OrderItem[]>([
    { product_id: "", variant_id: "", quantity: 1, unit_price: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [tax, setTax] = useState(0);
  const [shippingProvider, setShippingProvider] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [shippedDate, setShippedDate] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "", company: "", address: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const { data: order } = useQuery<OrderData>({
    queryKey: ["admin-order", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      return res.json();
    },
    enabled: isEdit,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["admin-products-list"],
    queryFn: async () => {
      const res = await fetch("/api/admin/products?limit=200");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      return (json.items ?? []).map((p: Record<string, unknown>) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
      }));
    },
  });

  useEffect(() => {
    if (!order) return;
    setCustomerId(order.customer_id);
    setNotes(order.notes ?? "");
    setTax(order.tax ?? 0);
    setShippingProvider(order.shipping_provider ?? "");
    setTrackingId(order.tracking_id ?? "");
    setShippedDate(order.shipped_date ?? "");
    if (order.items.length > 0) {
      setItems(
        order.items.map((i) => ({
          product_id: i.product_id ?? "",
          variant_id: i.variant_id ?? "",
          quantity: i.quantity,
          unit_price: i.unit_price,
          custom_name: (i as { custom_name?: string }).custom_name,
          custom_spec: (i as { custom_spec?: string }).custom_spec,
          custom_notes: (i as { custom_notes?: string }).custom_notes,
        }))
      );
    }
  }, [order]);

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const total = subtotal + tax;
  const isReadOnly = ["confirmed", "in_production", "shipped", "delivered"].includes(
    order?.status ?? ""
  );
  const currentStatus = (order?.status ?? "draft") as OrderStatus;

  const handleItemChange = (index: number, field: string, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { product_id: "", variant_id: "", quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError("");
    const validItems = items.filter((i) => {
      if (i.product_id === "custom") return Boolean(i.custom_name?.trim());
      return Boolean(i.product_id && i.variant_id);
    });
    if (validItems.length === 0) {
      setError("Add at least one item with a product and variant selected.");
      return;
    }
    if (!customerId && !showNewCustomer) {
      setError("Select a customer or create a new one.");
      return;
    }
    if (showNewCustomer && newCustomer.phone && !isAustralianPhone(newCustomer.phone)) {
      setError("Enter a valid Australian phone number.");
      return;
    }

    setSaving(true);
    try {
      // Normalize items: custom rows must send product_id/variant_id "custom"; schema expects UUID or "custom", not ""
      const normalizedItems = validItems.map((i) => {
        const isCustom = i.product_id === "custom" || Boolean(i.custom_name?.trim());
        const base = isCustom
          ? { ...i, product_id: "custom" as const, variant_id: "custom" as const }
          : i;
        // Ensure optional text fields are always strings (never null) so validation sees correct types
        return {
          ...base,
          custom_name: base.custom_name ?? "",
          custom_spec: base.custom_spec ?? "",
          custom_notes: base.custom_notes ?? "",
        };
      });

      const payload: Record<string, unknown> = {
        items: normalizedItems,
        notes: notes ?? "",
        tax,
        shipping_provider: shippingProvider ?? "",
        tracking_id: trackingId ?? "",
        shipped_date: shippedDate ?? "",
      };

      if (showNewCustomer && newCustomer.name) {
        payload.new_customer = newCustomer;
      } else {
        payload.customer_id = customerId && customerId.trim() ? customerId : null;
      }

      const url = isEdit ? `/api/admin/orders/${orderId}` : "/api/admin/orders";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg =
          typeof data?.error === "string"
            ? data.error
            : data?.error && typeof data.error === "object"
              ? "Validation failed. Check required fields."
              : "Failed to save order";
        throw new Error(errMsg);
      }
      if (isEdit) {
        // For updates we don't need response body; just refresh relevant queries.
        queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] });
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        queryClient.invalidateQueries({ queryKey: ["admin-orders-stats"] });
        toast.success("Order updated");
      } else {
        const data = await res.json();
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        queryClient.invalidateQueries({ queryKey: ["admin-orders-stats"] });
        router.push(`/admin/orders/${data.id}`);
        toast.success("Order created");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg === "[object Object]" ? "Failed to save. Please check your input." : msg);
      toast.error(msg === "[object Object]" ? "Failed to save order" : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateOrder = async () => {
    if (!orderId) return;
    setDuplicating(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/duplicate`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg =
          typeof data?.error === "string" ? data.error : "Failed to duplicate order";
        throw new Error(errMsg);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] });
      router.push(`/admin/orders/${data.id}`);
      toast.success("New order created (draft). Edit and confirm when ready.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg === "[object Object]" ? "Failed to create new version." : msg);
      toast.error("Failed to create new version");
    } finally {
      setDuplicating(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!orderId) return;
    setStatusUpdating(true);
    setError("");
    try {
      const payload: Record<string, unknown> = { status: newStatus };
      if (newStatus === "shipped") {
        payload.shipping_provider = shippingProvider;
        payload.tracking_id = trackingId;
        payload.shipped_date = shippedDate || new Date().toISOString().split("T")[0];
      }
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg =
          typeof data?.error === "string" ? data.error : "Status update failed";
        throw new Error(errMsg);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders-stats"] });
      toast.success("Order status updated");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg === "[object Object]" ? "Status update failed." : msg);
      toast.error(msg === "[object Object]" ? "Failed to update status" : msg);
    } finally {
      setStatusUpdating(false);
    }
  };

  const nextStatuses = VALID_TRANSITIONS[currentStatus] ?? [];

  // Client-side: can we ship? (Server re-checks and blocks if insufficient)
  const canShip =
    !order?.items?.length ||
    order.items.every((line) => {
      if (!line.variant_id) return true;
      const v = line.variant as { stock?: number } | null | undefined;
      const available = v?.stock ?? 0;
      return available >= line.quantity;
    });
  const showShipWarning = currentStatus === "in_production" && nextStatuses.includes("shipped") && !canShip;

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/orders")}
            className="admin-btn-secondary p-2 rounded-xl"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-[#2b2f33] tracking-tight">
              {isEdit ? `Order ${order?.order_number ?? ""}` : "New Order"}
            </h1>
            {isEdit && order && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <OrderStatusBadge status={order.status} size="md" />
                {(order.source_quote_id || order.quotation_id) && (
                  <a
                    href={`/admin/quotations/${order.source_quote_id ?? order.quotation_id}`}
                    className="text-xs text-[#ff7a2d] hover:underline"
                  >
                    From quote
                    {order.source_quote_version != null ? ` (v${order.source_quote_version})` : ""}
                  </a>
                )}
                {order.created_at && (
                  <span className="text-xs text-[#9aa6b0]">
                    Created {new Date(order.created_at).toLocaleDateString("en-AU")}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {!isReadOnly && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="admin-btn-primary px-6 py-2.5 text-sm font-medium"
          >
            {saving ? "Saving..." : isEdit ? "Update Order" : "Create Order"}
          </button>
        )}
      </div>

      {/* Status Timeline */}
      {isEdit && order && (
        <div className="glass rounded-2xl p-4">
          <OrderStatusTimeline currentStatus={currentStatus} />
          {nextStatuses.length > 0 && (
            <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-gray-100/50">
              {showShipWarning && (
                <p className="text-xs text-amber-600 font-medium">
                  Cannot ship. Insufficient stock. Please add stock first.
                </p>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#9aa6b0] font-medium">Move to:</span>
                {nextStatuses.map((ns) => {
                  const conf = ORDER_STATUS_CONFIG[ns];
                  const isShipped = ns === "shipped";
                  const disableShipped = isShipped && !canShip;
                  return (
                    <button
                      key={ns}
                      onClick={() => handleStatusChange(ns)}
                      disabled={statusUpdating || disableShipped}
                      title={disableShipped ? "Insufficient stock. Add stock before shipping." : undefined}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
                      style={{
                        color: conf.color,
                        backgroundColor: conf.bgColor,
                        border: `1px solid ${conf.borderColor}`,
                        opacity: disableShipped ? 0.6 : 1,
                      }}
                    >
                      {conf.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {(currentStatus === "confirmed" || currentStatus === "in_production") && (
            <div className="mt-4 pt-3 border-t border-gray-100/50">
              <p className="text-xs text-[#9aa6b0] mb-2">Order is locked. To make changes, create a new version.</p>
              <button
                type="button"
                onClick={handleDuplicateOrder}
                disabled={duplicating}
                className="admin-btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl"
              >
                {duplicating ? "Creating…" : "Create new version"}
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="glass rounded-xl p-4 flex items-center gap-2 text-red-600 text-sm">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 space-y-6">
          {/* Customer */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[#2b2f33]">Customer</h2>
            {showNewCustomer ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#9aa6b0] mb-1">Name *</label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer((p) => ({ ...p, name: e.target.value }))}
                      disabled={isReadOnly}
                      className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9aa6b0] mb-1">Company</label>
                    <input
                      type="text"
                      value={newCustomer.company}
                      onChange={(e) => setNewCustomer((p) => ({ ...p, company: e.target.value }))}
                      disabled={isReadOnly}
                      className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9aa6b0] mb-1">Email</label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer((p) => ({ ...p, email: e.target.value }))}
                      disabled={isReadOnly}
                      className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9aa6b0] mb-1">Phone</label>
                    <input
                      type="text"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer((p) => ({ ...p, phone: e.target.value }))}
                      disabled={isReadOnly}
                      className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9aa6b0] mb-1">Address</label>
                  <textarea
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer((p) => ({ ...p, address: e.target.value }))}
                    disabled={isReadOnly}
                    rows={2}
                    className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm resize-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewCustomer(false)}
                  className="text-xs text-[#ff7a2d] hover:underline"
                >
                  Select existing customer instead
                </button>
              </div>
            ) : (
              <CustomerSelector
                selectedCustomerId={customerId}
                onSelect={(c) => setCustomerId(c.id || null)}
                onCreateNew={() => setShowNewCustomer(true)}
                disabled={isReadOnly}
              />
            )}
          </div>

          {/* Line items */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#2b2f33]">
                Order Items ({items.length})
              </h2>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#ff7a2d] hover:underline"
                >
                  <PlusIcon className="w-3.5 h-3.5" /> Add Item
                </button>
              )}
            </div>
            <div className="space-y-3">
              {items.map((item, i) => (
                <OrderItemRow
                  key={i}
                  index={i}
                  item={item}
                  products={products ?? []}
                  onChange={handleItemChange}
                  onRemove={removeItem}
                  disabled={isReadOnly}
                />
              ))}
            </div>
          </div>

          {/* Shipping (visible when status is shipped or later) */}
          {isEdit && (currentStatus === "shipped" || currentStatus === "delivered" || currentStatus === "in_production") && (
            <div className="glass rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-[#2b2f33]">Shipping Details</h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#9aa6b0] mb-1">Shipping Provider</label>
                  <input
                    type="text"
                    value={shippingProvider}
                    onChange={(e) => setShippingProvider(e.target.value)}
                    disabled={isReadOnly}
                    placeholder="e.g. Australia Post"
                    className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9aa6b0] mb-1">Tracking / Delivery ID</label>
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Tracking number"
                    className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9aa6b0] mb-1">Shipped Date</label>
                  <input
                    type="date"
                    value={shippedDate}
                    onChange={(e) => setShippedDate(e.target.value)}
                    disabled={isReadOnly}
                    className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#2b2f33]">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b7280]">Subtotal</span>
                <span className="font-medium text-[#2b2f33]">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm items-center gap-2">
                <span className="text-[#6b7280]">Tax</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  disabled={isReadOnly}
                  className="admin-btn-secondary w-24 py-1 px-2 rounded-lg text-sm text-right"
                />
              </div>
              <div className="border-t border-gray-100/50 pt-2 flex justify-between">
                <span className="font-semibold text-[#2b2f33]">Total</span>
                <span className="font-bold text-lg text-[#ff7a2d]">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[#2b2f33]">Internal Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isReadOnly}
              rows={4}
              placeholder="Add internal notes..."
              className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm resize-none"
            />
          </div>

          {/* Delivered info */}
          {order?.status === "delivered" && (
            <div className="glass rounded-2xl p-5 space-y-2 border-l-4 border-emerald-400">
              <h2 className="text-sm font-semibold text-emerald-700">Order Completed</h2>
              <p className="text-xs text-[#6b7280]">
                Delivered on {order.delivered_date ?? "N/A"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
