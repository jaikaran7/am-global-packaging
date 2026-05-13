"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
};

type AlertOptions = {
  title: string;
  description?: string;
  okLabel?: string;
};

type AppConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /** One-button informational dialog (replaces window.alert) */
  showAlert: (options: AlertOptions) => Promise<void>;
};

const AppConfirmContext = React.createContext<AppConfirmContextValue | null>(null);

type PendingConfirm = ConfirmOptions & { resolve: (value: boolean) => void };
type PendingAlert = AlertOptions & { resolve: () => void };

export function AppConfirmProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [open, setOpen] = React.useState(false);
  const [panel, setPanel] = React.useState<
    | { mode: "confirm"; payload: PendingConfirm }
    | { mode: "alert"; payload: PendingAlert }
    | null
  >(null);
  const settledRef = React.useRef(false);

  const settleConfirm = React.useCallback((value: boolean) => {
    if (settledRef.current) return;
    settledRef.current = true;
    setPanel((p) => {
      if (p?.mode === "confirm") p.payload.resolve(value);
      return null;
    });
    setOpen(false);
  }, []);

  const settleAlert = React.useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;
    setPanel((p) => {
      if (p?.mode === "alert") p.payload.resolve();
      return null;
    });
    setOpen(false);
  }, []);

  const confirm = React.useCallback((options: ConfirmOptions) => {
    settledRef.current = false;
    return new Promise<boolean>((resolve) => {
      const payload: PendingConfirm = { ...options, resolve };
      setPanel({ mode: "confirm", payload });
      setOpen(true);
    });
  }, []);

  const showAlert = React.useCallback((options: AlertOptions) => {
    settledRef.current = false;
    return new Promise<void>((resolve) => {
      const payload: PendingAlert = { ...options, resolve };
      setPanel({ mode: "alert", payload });
      setOpen(true);
    });
  }, []);

  const value = React.useMemo(() => ({ confirm, showAlert }), [confirm, showAlert]);

  const handleOpenChange = React.useCallback((next: boolean) => {
    if (next) return;
    if (!settledRef.current) {
      setPanel((cur) => {
        if (cur?.mode === "confirm") cur.payload.resolve(false);
        if (cur?.mode === "alert") cur.payload.resolve();
        return null;
      });
    }
    settledRef.current = false;
    setOpen(false);
  }, []);

  const p = panel?.mode === "confirm" ? panel.payload : null;
  const a = panel?.mode === "alert" ? panel.payload : null;

  return (
    <AppConfirmContext.Provider value={value}>
      {children}
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent
          className={cn(
            "glass glass-strong z-[200] border-white/60 sm:max-w-md rounded-2xl p-6 shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out"
          )}
        >
          {p && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-left text-lg font-semibold tracking-tight text-[#2b2f33]">
                  {p.title}
                </AlertDialogTitle>
                {p.description ? (
                  <AlertDialogDescription className="text-left text-sm leading-relaxed text-[#6b7280]">
                    {p.description}
                  </AlertDialogDescription>
                ) : (
                  <AlertDialogDescription className="sr-only">{p.title}</AlertDialogDescription>
                )}
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-2 gap-2 sm:gap-3">
                <AlertDialogCancel
                  type="button"
                  className="admin-btn-secondary mt-0 rounded-xl border-gray-200/80 text-[#2b2f33]"
                >
                  {p.cancelLabel ?? "Cancel"}
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <button
                    type="button"
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm font-medium text-white shadow-md transition-opacity hover:opacity-95",
                      p.variant === "danger" ? "bg-red-600 hover:bg-red-600" : "admin-btn-primary border-0"
                    )}
                    onClick={() => settleConfirm(true)}
                  >
                    {p.confirmLabel ?? "Confirm"}
                  </button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
          {a && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-left text-lg font-semibold tracking-tight text-[#2b2f33]">
                  {a.title}
                </AlertDialogTitle>
                {a.description ? (
                  <AlertDialogDescription className="text-left text-sm leading-relaxed text-[#6b7280]">
                    {a.description}
                  </AlertDialogDescription>
                ) : (
                  <AlertDialogDescription className="sr-only">{a.title}</AlertDialogDescription>
                )}
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-2">
                <AlertDialogAction asChild>
                  <button
                    type="button"
                    className="admin-btn-primary rounded-xl border-0 px-5 py-2.5 text-sm font-medium"
                    onClick={() => settleAlert()}
                  >
                    {a.okLabel ?? "OK"}
                  </button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </AppConfirmContext.Provider>
  );
}

export function useAppConfirm(): AppConfirmContextValue {
  const ctx = React.useContext(AppConfirmContext);
  if (!ctx) {
    throw new Error("useAppConfirm must be used within AppConfirmProvider");
  }
  return ctx;
}
