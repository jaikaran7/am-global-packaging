import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/shared/ErrorReporter";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "AM Global Packaging Solutions | Premium Corrugated Packaging",
  description: "Leading manufacturer of premium corrugated packaging solutions. Custom boxes, sheets, and bulk supply for global industries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        {children}
        <Toaster />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
