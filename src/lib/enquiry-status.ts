/**
 * Enquiry status options: new, contact, cancelled, successful, follow_up
 * (removed: closed)
 */
export const ENQUIRY_STATUSES = [
  "new",
  "contact",
  "cancelled",
  "successful",
  "follow_up",
] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const ENQUIRY_STATUS_CONFIG: Record<
  EnquiryStatus,
  { label: string; pillClass: string; icon: "new" | "contact" | "cancelled" | "successful" | "follow_up" }
> = {
  new: {
    label: "New",
    pillClass: "bg-orange-50 text-[#ff7a2d]",
    icon: "new",
  },
  contact: {
    label: "Contact",
    pillClass: "bg-blue-50 text-blue-600",
    icon: "contact",
  },
  cancelled: {
    label: "Cancelled",
    pillClass: "bg-red-50 text-red-600",
    icon: "cancelled",
  },
  successful: {
    label: "Successful",
    pillClass: "bg-emerald-50 text-emerald-600",
    icon: "successful",
  },
  follow_up: {
    label: "Follow up",
    pillClass: "bg-violet-50 text-violet-600",
    icon: "follow_up",
  },
};

/** Normalize legacy DB values for display */
export function normalizeEnquiryStatus(status: string): EnquiryStatus {
  const s = status?.toLowerCase().replaceAll(/\s+/g, "_") ?? "new";
  if (ENQUIRY_STATUSES.includes(s as EnquiryStatus)) return s as EnquiryStatus;
  if (s === "contacted") return "contact";
  if (s === "closed") return "cancelled";
  return "new";
}
