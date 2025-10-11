/**
 * Admin Modal Component
 *
 * Based on: GLEC-Design-System-Standards.md + Website LaunchModal design
 * Purpose: Reusable modal dialog for admin operations
 * Design: Premium gradient header, smooth animations, backdrop blur
 *
 * Features:
 * - Gradient header with animated background pattern
 * - Smooth fade-in/slide-up animations
 * - Backdrop blur effect
 * - ESC key to close
 * - Click outside to close (optional)
 * - Custom header colors (primary, success, warning, danger)
 * - Flexible content area
 * - Footer with action buttons
 */

'use client';

import React, { useEffect, useRef } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
}

const gradientClasses = {
  primary: 'bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600',
  success: 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-600',
  warning: 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500',
  danger: 'bg-gradient-to-br from-red-500 via-red-600 to-rose-600',
  info: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600',
};

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-7xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  variant = 'primary',
  closeOnBackdropClick = true,
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={modalRef}
          className={`relative bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-fade-in-up`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-lg transition-colors z-10"
              aria-label="닫기"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Header */}
          <div className={`relative ${gradientClasses[variant]} text-white p-8 rounded-t-2xl overflow-hidden`}>
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="relative">
              <h2 id="modal-title" className="text-2xl lg:text-3xl font-bold mb-2">
                {title}
              </h2>
              {description && (
                <p id="modal-description" className="text-lg text-white/90">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-8">{children}</div>

          {/* Footer */}
          {footer && <div className="px-8 pb-8 pt-0">{footer}</div>}
        </div>
      </div>
    </>
  );
}

/**
 * ConfirmDialog Component
 *
 * Specialized modal for confirmation dialogs (delete, submit, etc.)
 */

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  const buttonVariantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      variant={variant}
      closeOnBackdropClick={!isLoading}
      showCloseButton={!isLoading}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-6 py-2.5 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 ${buttonVariantClasses[variant]}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                처리중...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      }
    >
      <p className="text-gray-700 text-lg leading-relaxed">{message}</p>
    </Modal>
  );
}

/**
 * InfoDialog Component
 *
 * Specialized modal for informational messages (success, info, etc.)
 */

export interface InfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'info' | 'warning' | 'danger';
  buttonText?: string;
  icon?: 'success' | 'info' | 'warning' | 'error';
}

const iconComponents = {
  success: (
    <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </svg>
  ),
  warning: (
    <svg className="w-16 h-16 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  ),
  error: (
    <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

export function InfoDialog({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
  buttonText = '확인',
  icon,
}: InfoDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      variant={variant}
      footer={
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            {buttonText}
          </button>
        </div>
      }
    >
      <div className="text-center">
        {icon && <div className="flex justify-center mb-6">{iconComponents[icon]}</div>}
        <p className="text-gray-700 text-lg leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}
