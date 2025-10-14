'use client';

/**
 * Admin Notifications Utility
 *
 * Purpose: Centralized notification system for admin portal
 * Replaces: alert(), confirm(), console.log()
 * Based on: GLEC-Design-System-Standards.md (Toast notifications)
 *
 * IMPORTANT: 'use client' directive is required because this file uses:
 * - react-hot-toast (client-side library)
 * - document API (browser-only)
 * - DOM manipulation for showConfirm modal
 *
 * Usage:
 * ```typescript
 * import { showSuccess, showError, showConfirm } from '@/lib/admin-notifications';
 *
 * // Success notification
 * showSuccess('데이터가 저장되었습니다');
 *
 * // Error notification
 * showError('데이터 저장에 실패했습니다');
 *
 * // Confirmation dialog
 * const confirmed = await showConfirm('정말 삭제하시겠습니까?');
 * if (confirmed) {
 *   // Proceed with action
 * }
 * ```
 */

import toast from 'react-hot-toast';

// ============================================================
// Toast Notifications (replaces alert())
// ============================================================

export interface ToastOptions {
  duration?: number; // milliseconds (default: 3000)
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  icon?: string; // emoji or icon
}

/**
 * Show success toast
 */
export function showSuccess(message: string, options?: ToastOptions): void {
  toast.success(message, {
    duration: options?.duration || 3000,
    position: options?.position || 'top-right',
    icon: options?.icon || '✅',
    style: {
      background: '#10b981', // green-500
      color: '#ffffff',
      fontWeight: '600',
      padding: '16px',
      borderRadius: '8px',
    },
  });
}

/**
 * Show error toast
 */
export function showError(message: string, options?: ToastOptions): void {
  toast.error(message, {
    duration: options?.duration || 4000,
    position: options?.position || 'top-right',
    icon: options?.icon || '❌',
    style: {
      background: '#ef4444', // red-500
      color: '#ffffff',
      fontWeight: '600',
      padding: '16px',
      borderRadius: '8px',
    },
  });
}

/**
 * Show warning toast
 */
export function showWarning(message: string, options?: ToastOptions): void {
  toast(message, {
    duration: options?.duration || 3500,
    position: options?.position || 'top-right',
    icon: options?.icon || '⚠️',
    style: {
      background: '#f59e0b', // amber-500
      color: '#ffffff',
      fontWeight: '600',
      padding: '16px',
      borderRadius: '8px',
    },
  });
}

/**
 * Show info toast
 */
export function showInfo(message: string, options?: ToastOptions): void {
  toast(message, {
    duration: options?.duration || 3000,
    position: options?.position || 'top-right',
    icon: options?.icon || 'ℹ️',
    style: {
      background: '#3b82f6', // blue-500
      color: '#ffffff',
      fontWeight: '600',
      padding: '16px',
      borderRadius: '8px',
    },
  });
}

/**
 * Show loading toast (returns toast id for dismissal)
 */
export function showLoading(message: string, options?: ToastOptions): string {
  return toast.loading(message, {
    position: options?.position || 'top-right',
    style: {
      background: '#6b7280', // gray-500
      color: '#ffffff',
      fontWeight: '600',
      padding: '16px',
      borderRadius: '8px',
    },
  });
}

/**
 * Dismiss a specific toast by id
 */
export function dismissToast(toastId: string): void {
  toast.dismiss(toastId);
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts(): void {
  toast.dismiss();
}

// ============================================================
// Confirmation Dialog (replaces confirm())
// ============================================================

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
  isDangerous?: boolean; // red confirm button for delete actions
}

/**
 * Show confirmation dialog (async)
 *
 * Returns: Promise<boolean> - true if confirmed, false if cancelled
 *
 * Example:
 * ```typescript
 * const confirmed = await showConfirm({
 *   title: '삭제 확인',
 *   message: '정말 삭제하시겠습니까? 이 작업은 복구할 수 없습니다.',
 *   confirmText: '삭제',
 *   cancelText: '취소',
 *   isDangerous: true,
 * });
 * ```
 */
export function showConfirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('role', 'dialog');

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-all';

    // Title
    if (options.title) {
      const title = document.createElement('h3');
      title.className = 'text-lg font-bold text-gray-900 mb-2';
      title.textContent = options.title;
      modal.appendChild(title);
    }

    // Message
    const message = document.createElement('p');
    message.className = 'text-gray-600 mb-6';
    message.textContent = options.message;
    modal.appendChild(message);

    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex items-center justify-end gap-3';

    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = options.cancelText || '취소';
    cancelButton.className = options.cancelButtonClass || 'px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors';
    cancelButton.onclick = () => {
      document.body.removeChild(backdrop);
      resolve(false);
    };

    // Confirm button
    const confirmButton = document.createElement('button');
    confirmButton.textContent = options.confirmText || '확인';
    confirmButton.className = options.confirmButtonClass || (
      options.isDangerous
        ? 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors'
        : 'px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium transition-colors'
    );
    confirmButton.onclick = () => {
      document.body.removeChild(backdrop);
      resolve(true);
    };

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    modal.appendChild(buttonContainer);

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // ESC key to cancel
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.body.removeChild(backdrop);
        document.removeEventListener('keydown', handleEsc);
        resolve(false);
      }
    };
    document.addEventListener('keydown', handleEsc);

    // Click outside to cancel
    backdrop.onclick = (e) => {
      if (e.target === backdrop) {
        document.body.removeChild(backdrop);
        resolve(false);
      }
    };

    // Prevent modal click from closing
    modal.onclick = (e) => {
      e.stopPropagation();
    };
  });
}

// ============================================================
// Logging Utilities (replaces console.log/error/warn)
// ============================================================

export interface LogOptions {
  context?: string; // e.g., '[Admin Notices]', '[API]'
  data?: unknown; // additional data to log
  showToast?: boolean; // also show a toast notification
}

/**
 * Log info (development only)
 */
export function logInfo(message: string, options?: LogOptions): void {
  if (process.env.NODE_ENV === 'development') {
    const prefix = options?.context ? `${options.context} ` : '';
    console.log(`[INFO] ${prefix}${message}`, options?.data || '');
  }

  if (options?.showToast) {
    showInfo(message);
  }
}

/**
 * Log error (always logs, optionally shows toast)
 */
export function logError(message: string, error?: Error | unknown, options?: LogOptions): void {
  const prefix = options?.context ? `${options.context} ` : '';
  console.error(`[ERROR] ${prefix}${message}`, error || '', options?.data || '');

  if (options?.showToast) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    showError(`${message}: ${errorMessage}`);
  }
}

/**
 * Log warning (development only, optionally shows toast)
 */
export function logWarning(message: string, options?: LogOptions): void {
  if (process.env.NODE_ENV === 'development') {
    const prefix = options?.context ? `${options.context} ` : '';
    console.warn(`[WARN] ${prefix}${message}`, options?.data || '');
  }

  if (options?.showToast) {
    showWarning(message);
  }
}

// ============================================================
// Helper: API Error Handler
// ============================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

/**
 * Handle API errors uniformly
 *
 * Returns: user-friendly error message
 */
export function handleApiError(error: unknown, context?: string): string {
  let message = '알 수 없는 오류가 발생했습니다';

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    if (apiError.message) {
      message = apiError.message;
    }
    if (apiError.details && apiError.details.length > 0) {
      message += `\n\n${apiError.details.map((d) => `- ${d.field}: ${d.message}`).join('\n')}`;
    }
  }

  logError(message, error, { context, showToast: false });

  return message;
}

// ============================================================
// Validation Helper
// ============================================================

/**
 * Validate required fields and show error toast if invalid
 *
 * Returns: true if valid, false if invalid
 */
export function validateRequired(
  fields: Record<string, unknown>,
  fieldLabels: Record<string, string>
): boolean {
  const emptyFields: string[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      emptyFields.push(fieldLabels[key] || key);
    }
  }

  if (emptyFields.length > 0) {
    showError(`다음 필수 항목을 입력해주세요:\n${emptyFields.join(', ')}`);
    return false;
  }

  return true;
}
