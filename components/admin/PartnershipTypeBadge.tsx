/**
 * Partnership Type Badge Component
 *
 * Displays partnership type badges with Korean labels
 * Used in: Partnership List, Partnership Detail
 *
 * Design System: GLEC-Design-System-Standards.md
 */

interface PartnershipTypeBadgeProps {
  type: 'tech' | 'reseller' | 'consulting' | 'other';
  size?: 'sm' | 'md' | 'lg';
}

export function PartnershipTypeBadge({ type, size = 'md' }: PartnershipTypeBadgeProps) {
  const labels = {
    tech: '기술 파트너',
    reseller: '리셀러',
    consulting: '컨설팅',
    other: '기타',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-block font-semibold rounded-full bg-gray-100 text-gray-700 ${sizeClasses[size]}`}
    >
      {labels[type]}
    </span>
  );
}
