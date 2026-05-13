import type { Metadata } from "next";

/** Short document title for print/PDF tab (avoids long marketing suffix in browser chrome). */
export const metadata: Metadata = {
  title: "Invoice — AM Global Packaging Solutions",
  robots: { index: false, follow: false },
};

export default function InvoicePrintLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
