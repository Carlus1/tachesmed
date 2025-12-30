import React from 'react';

interface RoleBadgeProps {
  role?: string | null;
  className?: string;
}

export default function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  if (!role) return null;

  const base = 'text-xs font-semibold px-2 py-0.5 rounded-full';
  const variant = role === 'owner'
    ? 'bg-primary-600 text-white'
    : role === 'admin'
      ? 'bg-accent-600 text-white'
      : 'bg-primary-100 text-primary-700';

  const label = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <span className={`${base} ${variant} ${className}`}>{label}</span>
  );
}
