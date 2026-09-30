import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
  showDot = true,
}) => {
  const normalized = status.toLowerCase();

  // Green states (Success / Normal / Active)
  const isGreen = [
    'ready',
    'in session',
    'on duty',
    'checked in',
    'online',
    'resolved',
    'in progress',
    'completed',
    'active',
    'low',
  ].includes(normalized);

  // Yellow / Amber states (Caution / Pending / Notice)
  const isYellow = [
    'setup needed',
    'late',
    'standby',
    'warning',
    'scheduled',
    'investigating',
    'inactive',
    'medium',
    'moderate',
  ].includes(normalized);

  // Red states (Critical / Danger / Problem / Fault / Absent)
  const isRed = [
    'problem',
    'absent',
    'offline',
    'delayed',
    'fault',
    'high',
    'open',
  ].includes(normalized);

  let styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotClasses = 'bg-slate-400';

  if (isGreen) {
    styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold';
    dotClasses = 'bg-emerald-500';
  } else if (isYellow) {
    styleClasses = 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
    dotClasses = 'bg-amber-500';
  } else if (isRed) {
    styleClasses = 'bg-rose-50 text-rose-700 border-rose-300 font-semibold';
    dotClasses = 'bg-rose-500 ring-2 ring-rose-200';
  } else {
    styleClasses = 'bg-slate-100 text-slate-700 border-slate-300 font-semibold';
    dotClasses = 'bg-slate-400';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-medium px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide whitespace-nowrap ${sizeClasses} ${styleClasses} ${className}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotClasses} ${
            isRed ? 'animate-pulse' : ''
          }`}
        />
      )}
      <span>{status}</span>
    </span>
  );
};
