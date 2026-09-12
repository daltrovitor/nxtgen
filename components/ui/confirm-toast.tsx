"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning";
  timeoutMs?: number;
}

interface ToastItem {
  id: string;
  isConfirm: boolean;
  type: "danger" | "warning" | "success" | "error" | "info";
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  resolve?: (value: boolean) => void;
}

interface ConfirmToastContextType {
  confirmDelete: (options: ConfirmOptions | string) => Promise<boolean>;
  showToast: (type: "success" | "error" | "info", message: string, title?: string) => void;
}

const ConfirmToastContext = createContext<ConfirmToastContextType | undefined>(undefined);

export function ConfirmToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    const t = timeoutsRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const confirmDelete = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      const id = `confirm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const normalized: ConfirmOptions =
        typeof options === "string"
          ? {
              message: options,
              title: "Confirmar Exclusão",
              confirmText: "Sim, Excluir",
              cancelText: "Cancelar",
              type: "danger",
            }
          : {
              title: options.title || "Confirmar Exclusão",
              message: options.message,
              confirmText: options.confirmText || "Sim, Excluir",
              cancelText: options.cancelText || "Cancelar",
              type: options.type || "danger",
              timeoutMs: options.timeoutMs,
            };

      const newItem: ToastItem = {
        id,
        isConfirm: true,
        type: normalized.type || "danger",
        title: normalized.title,
        message: normalized.message,
        confirmText: normalized.confirmText,
        cancelText: normalized.cancelText,
        resolve,
      };

      setToasts((prev) => [...prev, newItem]);

      // Optional auto-dismiss after timeout (defaults to 15s)
      const timeoutMs = normalized.timeoutMs || 15000;
      const timer = setTimeout(() => {
        resolve(false);
        removeToast(id);
      }, timeoutMs);
      timeoutsRef.current.set(id, timer);
    });
  }, [removeToast]);

  const showToast = useCallback(
    (type: "success" | "error" | "info", message: string, title?: string) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const newItem: ToastItem = {
        id,
        isConfirm: false,
        type,
        title,
        message,
      };

      setToasts((prev) => [...prev, newItem]);

      const timer = setTimeout(() => {
        removeToast(id);
      }, 4500);
      timeoutsRef.current.set(id, timer);
    },
    [removeToast]
  );

  const handleUserDecision = (item: ToastItem, choice: boolean) => {
    if (item.resolve) {
      item.resolve(choice);
    }
    removeToast(item.id);
  };

  return (
    <ConfirmToastContext.Provider value={{ confirmDelete, showToast }}>
      {children}

      {/* Fixed Toast Container */}
      <aside
        aria-live="polite"
        aria-label="Notificações"
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-md w-[calc(100vw-2rem)] sm:w-[420px] pointer-events-none"
      >
        <AnimatePresence mode="sync">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 25, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
                toast.isConfirm || toast.type === "danger" || toast.type === "error"
                  ? "bg-[#0E1017]/95 border-red-500/35 shadow-[0_10px_35px_rgba(0,0,0,0.7),0_0_25px_rgba(239,68,68,0.2)]"
                  : toast.type === "success"
                  ? "bg-[#0E1017]/95 border-emerald-500/35 shadow-[0_10px_35px_rgba(0,0,0,0.7),0_0_25px_rgba(16,185,129,0.2)]"
                  : "bg-[#0E1017]/95 border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.7)]"
              }`}
            >
              {/* Top Accent Gradient Bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-[2px] ${
                  toast.isConfirm || toast.type === "danger" || toast.type === "error"
                    ? "bg-gradient-to-r from-red-500 via-rose-500 to-amber-500"
                    : toast.type === "success"
                    ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-[#00F0FF]"
                    : "bg-gradient-to-r from-[#8B24F0] to-[#00F0FF]"
                }`}
              />

              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    toast.isConfirm || toast.type === "danger" || toast.type === "error"
                      ? "bg-red-500/15 border-red-500/30 text-red-400"
                      : toast.type === "success"
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                      : "bg-[#8B24F0]/15 border-[#8B24F0]/30 text-[#C084FC]"
                  }`}
                >
                  {toast.isConfirm ? (
                    <Trash2 className="w-4 h-4" />
                  ) : toast.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : toast.type === "error" ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  {toast.title && (
                    <h4 className="text-sm font-bold font-heading text-white leading-tight">
                      {toast.title}
                    </h4>
                  )}
                  <p className="text-xs text-white/80 mt-1 leading-relaxed break-words font-sans">
                    {toast.message}
                  </p>

                  {/* Actions for Confirmation Toast */}
                  {toast.isConfirm && (
                    <div className="flex items-center gap-2 mt-3.5 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => handleUserDecision(toast, false)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
                      >
                        {toast.cancelText || "Cancelar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUserDecision(toast, true)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold font-heading text-white shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{toast.confirmText || "Sim, Excluir"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => (toast.isConfirm ? handleUserDecision(toast, false) : removeToast(toast.id))}
                  className="absolute top-3.5 right-3.5 text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </aside>
    </ConfirmToastContext.Provider>
  );
}

export function useConfirmToast() {
  const context = useContext(ConfirmToastContext);
  if (!context) {
    return {
      confirmDelete: async (options: ConfirmOptions | string) => {
        const msg = typeof options === "string" ? options : options.message;
        if (typeof window !== "undefined") {
          return window.confirm(msg);
        }
        return false;
      },
      showToast: (type: string, message: string) => {
        if (typeof window !== "undefined") {
          console.log(`[Toast ${type}]: ${message}`);
        }
      },
    };
  }
  return context;
}
