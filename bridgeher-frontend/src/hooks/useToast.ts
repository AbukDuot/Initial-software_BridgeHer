import { useState, useCallback } from "react";

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  id: number;
}

let toastCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now() + toastCounter++;
    setToasts((prev) => [...prev, { message, type, id }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
};

if (toastCounter > 1000) toastCounter = 0;
