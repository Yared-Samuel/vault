import React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className = '', variant = 'default', ...props }) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    danger: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-white',
    info: 'bg-green-700 text-white'

  };
  return (
    <span className={cn(base, variants[variant], className)} {...props} />
  );
}

export function BadgeSecondary({ children }) {
  return <Badge variant="secondary">{children || 'Secondary'}</Badge>;
} 