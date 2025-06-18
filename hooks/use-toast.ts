"use client";

import type React from "react";

import { useState, useCallback } from "react";

type ToastType = "default" | "destructive" | "success" | "warning" | "info";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: ToastType;
  duration?: number;
}

interface ToastOptions {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: ToastType;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    ({
      title,
      description,
      action,
      variant = "default",
      duration = 5000,
    }: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = {
        id,
        title,
        description,
        action,
        variant,
        duration,
      };

      setToasts((prevToasts) => [...prevToasts, newToast]);

      if (duration !== Number.POSITIVE_INFINITY) {
        setTimeout(() => {
          setToasts((prevToasts) =>
            prevToasts.filter((toast) => toast.id !== id)
          );
        }, duration);
      }

      return id;
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toast,
    dismiss,
    dismissAll,
    toasts,
  };
}
