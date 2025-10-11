/**
 * Admin Toast/Notification Component
 *
 * Based on: GLEC-Design-System-Standards.md + Modern toast patterns
 * Purpose: Non-blocking notifications for user actions
 * Design: Slide-in animations, auto-dismiss, multiple variants
 *
 * Features:
 * - 4 variants: success, error, warning, info
 * - Auto-dismiss with configurable duration
 * - Manual dismiss button
 * - Slide-in from top-right
 * - Progress bar for auto-dismiss
 * - Stacked toasts support
 * - Accessible (ARIA live region)
 */

'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number; // milliseconds, 0 = no auto-dismiss
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

/**
 * ToastProvider Component
 *
 * Wrap your admin layout with this provider
 */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, ...toast };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss
    if (toast.duration !== 0) {
      const duration = toast.duration ?? 5000;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ variant: 'success', title, message, duration });
    },
    [addToast]
  );

  const showError = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ variant: 'error', title, message, duration });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ variant: 'warning', title, message, duration });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ variant: 'info', title, message, duration });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * ToastContainer Component
 *
 * Renders toast notifications in a fixed position
 */

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-md w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

/**
 * ToastItem Component
 *
 * Individual toast notification
 */

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const variantStyles = {
  success: {
    bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-gradient-to-r from-red-500 to-rose-600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    ),
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
        />
      </svg>
    ),
  },
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration ?? 5000;

  useEffect(() => {
    if (toast.duration === 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const decrement = (100 / duration) * 50; // Update every 50ms
        return Math.max(0, prev - decrement);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [toast.duration, duration]);

  const style = variantStyles[toast.variant];

  return (
    <div
      className="relative pointer-events-auto bg-white rounded-xl shadow-2xl overflow-hidden animate-slide-in-right max-w-md"
      role="alert"
    >
      {/* Progress bar */}
      {toast.duration !== 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
          <div
            className={`h-full ${style.bg} transition-all duration-50 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start gap-3 p-4 pt-5">
        {/* Icon */}
        <div className={`flex-shrink-0 ${style.bg} text-white rounded-lg p-2`}>{style.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-900 mb-0.5">{toast.title}</h4>
          {toast.message && <p className="text-sm text-gray-600 leading-relaxed">{toast.message}</p>}
        </div>

        {/* Close button */}
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="닫기"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Custom CSS for slide-in animation
 * Add to globals.css:
 *
 * @keyframes slide-in-right {
 *   from {
 *     transform: translateX(100%);
 *     opacity: 0;
 *   }
 *   to {
 *     transform: translateX(0);
 *     opacity: 1;
 *   }
 * }
 *
 * .animate-slide-in-right {
 *   animation: slide-in-right 0.3s ease-out;
 * }
 */
