# AM Global Packaging – ERP Quotation & Order Flow

## 1. Current System Analysis

### 1.1 Database Tables (Current)

| Table | Key fields |
|-------|------------|
| **quotations** | id, quote_number (QUO-YYYYMMDD-XXXX), customer_id, status (draft \| sent \| accepted \| rejected \| expired), subtotal, gst_percent, tax, total, notes, terms_text, valid_until, created_by, created_at, updated_at |
| **quotation_items** | id, quotation_id, product_id, variant_id, description, custom_name, custom_spec, custom_notes, quantity, unit_price, subtotal |
| **orders** | id, order_number, customer_id, status (draft \| confirmed \| in_production \| shipped \| delivered \| cancelled), subtotal, tax, total, notes, quotation_id (FK), shipping_provider, tracking_id, shipped_date, delivered_date |
| **order_items** | id, order_id, product_id, variant_id, custom_name, custom_spec, custom_notes, quantity, unit_price, subtotal |
| **stock_movements** | product_id, variant_id, movement_type (e.g. adjustment, reserved, released, outgoing), qty, reference_type, reference_id, note |
| **product_variants** | stock (computed from stock_movements), reserved_stock |

### 1.2 Current Quotation → Order Flow

1. **Create quote** – Admin creates quotation (status `draft`). Quote number auto-generated on insert.
2. **Send** – Admin sends email with PDF; status can be updated to `sent` (send route updates to `sent` after email).
3. **Accept** – Admin clicks “Mark Accepted & Convert”:
   - Creates order with status `draft`, copies customer_id, subtotal, tax, total, notes, quotation_id, source_quote_id, source_quote_version.
   - Copies quotation_items → order_items (including product_title_snapshot, variant_name_snapshot).
   - Sets quotation status to `accepted`. No stock change.
4. **Order status** – Admin moves order: draft → confirmed → in_production → shipped → delivered (or cancelled). Orders in confirmed/in_production/shipped/delivered are **not editable**; use “Create new version” to duplicate.
5. **Stock** – **Reserve only** when moving to Confirmed (draft or pending_confirmation → confirmed/in_production). **Deduct only** when moving to **Shipped** (in_production → shipped): system re-checks availability; if any line has insufficient stock, shipping is blocked. No negative Available at shipping. On Shipped, reservation is released and outgoing movement is created.
6. **Delivered** – No stock change. Placeholder for accounting (revenue entry / close order).

### 1.3 Current Problems

- **No versioning** – Accepted quote is a single row; no revision history.
- **No snapshot** – Orders reference quotation_id but don’t store quote version; if quote were edited, order would conceptually point at mutable data.
- **Stock timing** – Reservation on draft→confirmed, deduction on in_production→shipped. Requirement is: **no stock change on acceptance**, **deduct only on order confirmation**.
- **Draft update bug** – Frontend can send custom line items with `product_id: ""` (from DB null); backend schema expects UUID or `"custom"`, so validation fails.
- **Hard delete** – Deleting a draft removes the row; no soft delete for audit/recovery.
- **Status set** – Missing `revised`, `locked`, `cancelled` for quotations; orders missing `pending_confirmation`.

---

## 2. New Business Rules (Target)

- **Quotation versioning** – Versions (v1, v2, …); after accept, no direct edit; changes create a new revision.
- **Status flow** – draft → sent → accepted \| revised \| locked \| cancelled.
- **Orders as snapshots** – Store snapshot of quote data; store source_quote_id + source_quote_version.
- **Quotation accept** – Creates order in **Draft**. Admin finalizes then moves to Confirmed (lock; optional reserve). No stock deduction on accept.
- **Stock** – Reserve when moving to Confirmed (planning). **Deduct only when moving to Shipped**; re-check availability and block if insufficient. No negative Available at shipping.
- **Editing after confirm** – Order is locked from Confirmed onward. Use “Create new version” (duplicate order) to create a new Draft; old order marked obsolete.

---

## 3. Identified Bugs & UX Issues

### 3.1 Draft update fails

- **Cause** – For custom line items loaded from DB, `product_id` and `variant_id` are null → frontend sets `""`. Payload then has `product_id: ""`, which fails Zod (`uuid` or `"custom"`).
- **Fix** – Frontend: when building save payload, send `product_id: "custom"` and `variant_id: "custom"` for items that have custom_name and no product/variant. Backend: treat `""` as “custom” when custom_name is present (coerce before validation).

### 3.2 Soft delete for drafts

- **Current** – DELETE removes row.
- **Fix** – Add `deleted_at` (timestamptz, nullable). On “delete” draft, set `deleted_at = now()`. All list/GET queries filter `deleted_at IS NULL`. No hard delete for drafts.

### 3.3 UI overlap (QuotationItemRow)

- **Issue** – Quantity and unit price inputs overlap; variant select text overflows; cramped layout.
- **Fix** – Use a responsive grid with explicit column widths/gaps; ensure inputs don’t shrink below min-width; variant field with ellipsis or constrained width so text doesn’t overlap.

---

## 4. New Architecture Summary

- **Quotations** – Add `version` (integer), `parent_quote_id` (self-FK for revisions), `deleted_at`, and extend status to include revised, locked, cancelled.
- **Orders** – Add `source_quote_id`, `source_quote_version`; add status `pending_confirmation`; create order from quote as snapshot (copy totals + line data); do not reserve/deduct stock on creation.
- **Quotation accept** – Create order in **Draft** with snapshot (source_quote_id, source_quote_version, product_title_snapshot, variant_name_snapshot). No stock change.
- **Order confirmation** – When moving to Confirmed (from draft or pending_confirmation): **reserve only** (reserved_stock += qty). No deduction.
- **Order shipped** – **Single stock control point**: when moving in_production → shipped, re-check that Available ≥ Required for every line; if any short, block with 400. If OK, insert outgoing movements, release reservation, then update status. No negative Available.
- **Order delivered** – No stock change. Placeholder for accounting (revenue entry / close order).
- **Duplicate order** – For orders in confirmed or in_production, “Create new version” creates a new order (Draft) and sets old order to `obsolete` with `superseded_by_order_id`. No stock impact on old order.
- **Revisions** – “Create revision” creates a new quotation row with parent_quote_id set, version = parent.version + 1; old version remains immutable for audit.

---

## 5. Database Changes (Migrations)

- **quotations**: `version` (integer, default 1), `parent_quote_id` (uuid FK quotations(id)), `deleted_at` (timestamptz), status check extended to include revised, locked, cancelled.
- **orders**: `source_quote_id` (uuid, FK quotations), `source_quote_version` (integer), status check extended to include `pending_confirmation`; order status transitions updated.
- **order_items**: Optional snapshot display fields (e.g. `product_title`, `variant_name`) for readability; can be filled from quote at order creation.
- Indexes: quotations(deleted_at), quotations(parent_quote_id), orders(source_quote_id).

---

## 6. Step-by-Step Logic (Target)

| Step | Action |
|------|--------|
| Create quote | INSERT quotation (status draft, version 1, parent_quote_id null, deleted_at null). INSERT quotation_items. |
| Update draft | Only if status = draft and deleted_at IS NULL. Validate payload (custom → product_id/variant_id "custom" or null). Replace quotation_items (delete + insert). |
| Delete draft | SET deleted_at = now(). No hard delete. |
| Send quote | Update status to sent (if needed). Send email. |
| Accept quote | Create order (status **draft**, source_quote_id, source_quote_version, snapshot totals + items). Update quotation status to accepted. **No stock change.** |
| Confirm order | Draft (or pending_confirmation) → confirmed or in_production: **reserve only** (reserved_stock += qty, stock_movements “reserved”). No deduction. Order locked. |
| Ship order | in_production → shipped: **re-check** Available ≥ Required for every line; if any short, **block** (400). If OK: insert outgoing movements, release reservation, update status. **Stock deducted only here.** |
| Deliver order | shipped → delivered: set delivered_date. **No stock change.** Placeholder for accounting (revenue / close). |
| Duplicate order | For confirmed/in_production: POST duplicate creates new order (draft), old order status = obsolete, superseded_by_order_id = new id. |
| Create revision | INSERT new quotation (parent_quote_id = accepted quote, version = parent.version + 1, status draft). Copy items from parent (or allow edit). |

---

## 7. Edge Cases

- **Quote revised, order not confirmed** – New version accepted → new order. Old order (pending_confirmation) can be cancelled or left as-is; no stock involved until confirmation.
- **Quote revised, order already confirmed** – Confirmed order is immutable; tied to source_quote_id + source_quote_version. New version creates a new order on accept.
- **Multiple revisions** – Each revision is a new quotation row; each accept creates one order (pending_confirmation) per accepted version.
- **Cancelled quote** – Status = cancelled; no order created from it; can still keep for audit.
- **Soft-deleted draft** – Excluded from lists; can add “restore” (set deleted_at = null) later.
- **Stock shortage on shipping** – Before allowing in_production → shipped, check Available ≥ Required for every line; if any insufficient, return 400 (“Cannot ship. Insufficient stock…”). No negative Available at shipping.
- **Order changes after confirm** – No edits; use “Create new version” (duplicate order); old order marked obsolete.

---

## 8. Implementation Summary (Done)

- **Migration** `20250223000000_quotation_versioning_orders_snapshot.sql`: quotations (version, parent_quote_id, deleted_at, status extended), orders (source_quote_id, source_quote_version, pending_confirmation), order_items (product_title_snapshot, variant_name_snapshot).
- **Draft update fix**: Frontend sends `product_id`/`variant_id` `"custom"` for custom items; backend coerces `""` to `"custom"` when custom_name present. Clear validation error messages.
- **Soft delete**: DELETE draft sets `deleted_at`; list and GET exclude `deleted_at IS NOT NULL`; stats exclude soft-deleted.
- **QuotationItemRow**: Grid with gap-4, min-w-0, responsive col-span; Qty/Unit Price given space; variant select wrapper for truncation.
- **Accept flow**: Order created with `status: "draft"`, `source_quote_id`, `source_quote_version`; items include `product_title_snapshot`, `variant_name_snapshot`. Quote set to accepted. No stock change.
- **Order status**: Reserve only when moving to Confirmed (draft or pending_confirmation → confirmed/in_production). **Deduct only on Shipped** (in_production → shipped): re-check stock, block if insufficient, then outgoing + release reservation. Delivered: accounting placeholder (TODO).
- **Order editability**: Only draft and pending_confirmation editable; confirmed, in_production, shipped, delivered are read-only. PATCH returns 400 if not draft/pending_confirmation.
- **Duplicate order**: POST `/api/admin/orders/[id]/duplicate` when status is confirmed or in_production; creates new draft order, sets old order to `obsolete`, `superseded_by_order_id`. Migration adds `obsolete` and `superseded_by_order_id`.
- **Order schema & UI**: `ORDER_STATUSES` include `pending_confirmation`, `obsolete`; timeline shows obsolete; “Create new version” button when confirmed/in_production. Order detail shows “From quote (vN)” link.
- **Stock at ship**: UI shows Available, Required, Short by per line; Shipped button disabled when client-side check shows insufficient stock; server blocks with clear message if insufficient.
- **Stock columns**: Available = product_variants.stock (never negative at shipping). Reserved = reserved for confirmed/in_production orders. Remaining = Available - Reserved (computed in API/UI). Deduct only at Shipped.
- **Quotation revision**: POST `/api/admin/quotations/[id]/revision` creates draft with parent_quote_id, version = parent.version + 1, copies items. “Create Revision” button on accepted/sent/revised/locked quote.
- **Quotation status**: Schema and badge support revised, locked, cancelled; editing locked for accepted, rejected, expired, revised, locked, cancelled.
