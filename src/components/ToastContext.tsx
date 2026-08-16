import React, { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (toast: Omit<ToastItem, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = { ...toast, id, type: toast.type || "info" };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Toast Notification Layer */}
      <div className="fixed bottom-6 right-6 z-[250] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => {
            const iconMap = {
              success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
              error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
              info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
            };

            const borderMap = {
              success: "border-emerald-200 bg-white",
              error: "border-red-200 bg-white",
              warning: "border-amber-200 bg-white",
              info: "border-sky-200 bg-white",
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto p-4 rounded-xl shadow-xl border ${borderMap[toast.type || "info"]} flex items-start gap-3 font-sans relative overflow-hidden`}
              >
                {iconMap[toast.type || "info"]}

                <div className="flex-1 space-y-0.5">
                  <h5 className="font-serif font-bold text-xs text-[#1C1F22]">{toast.title}</h5>
                  {toast.description && (
                    <p className="text-[11px] text-[#5A6351] font-light leading-snug">
                      {toast.description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="p-1 min-w-[32px] min-h-[32px] hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-700 transition cursor-pointer flex items-center justify-center shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
