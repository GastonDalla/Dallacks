"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type ToastVariant = "default" | "success" | "error";
interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "default") => {
      const id = (idRef.current += 1);
      setToasts((current) => [...current, { id, message, variant }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,22rem)] flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur-md",
              t.variant === "success" && "border-success/30 bg-success/10 text-success",
              t.variant === "error" && "border-danger/30 bg-danger/10 text-danger",
              t.variant === "default" && "border-border bg-surface-2 text-fg",
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
