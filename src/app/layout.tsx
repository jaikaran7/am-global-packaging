import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/shared/ErrorReporter";
import { AppConfirmProvider } from "@/contexts/AppConfirmContext";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "AM Global Packaging Solutions",
  description: "Leading manufacturer of premium corrugated packaging solutions. Custom boxes, sheets, and bulk supply for global industries.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppConfirmProvider>
          <ErrorReporter />
          {children}
          <Toaster />
          <VisualEditsMessenger />
        </AppConfirmProvider>
      </body>
    </html>
  );
}
