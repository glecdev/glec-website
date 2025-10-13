/**
 * Status Badge Component
 *
 * Displays color-coded status badges for various admin entities
 * Used in: Partnerships, Notices, Events, etc.
 *
 * Design System: GLEC-Design-System-Standards.md
 */

interface StatusBadgeProps {
  status: 'NEW' | 'IN_PROGRESS' | 'ACCEPTED' | 'REJECTED' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const styles = {
    NEW: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    ACCEPTED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    PUBLISHED: 'bg-green-100 text-green-700',
    DRAFT: 'bg-gray-100 text-gray-700',
    ARCHIVED: 'bg-gray-100 text-gray-500',
  };

  const labels = {
    NEW: '신규',
    IN_PROGRESS: '진행중',
    ACCEPTED: '승인',
    REJECTED: '거절',
    PUBLISHED: '게시',
    DRAFT: '초안',
    ARCHIVED: '보관',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-block font-semibold rounded-full ${styles[status]} ${sizeClasses[size]}`}
    >
      {labels[status]}
    </span>
  );
}
