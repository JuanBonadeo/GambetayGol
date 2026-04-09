"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DialogState {
  open: boolean;
  message: string;
  description?: string;
}

interface ConfirmDialogContextValue {
  confirm: (message: string, description?: string) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue>({
  confirm: async () => false,
});

export function useConfirmDialog() {
  return useContext(ConfirmDialogContext);
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>({ open: false, message: "" });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((message: string, description?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ open: true, message, description });
    });
  }, []);

  const handleConfirm = () => {
    setState((s) => ({ ...s, open: false }));
    resolveRef.current?.(true);
  };

  const handleCancel = () => {
    setState((s) => ({ ...s, open: false }));
    resolveRef.current?.(false);
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state.open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleCancel}
          >
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm mx-4 rounded-xl border border-[#2a2a2a] bg-[#161616] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              </div>

              {/* Text */}
              <h2 className="text-sm font-semibold text-white">{state.message}</h2>
              {state.description && (
                <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">{state.description}</p>
              )}

              {/* Actions */}
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white transition-colors duration-150 border border-[#2a2a2a]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-500 transition-colors duration-150"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmDialogContext.Provider>
  );
}
