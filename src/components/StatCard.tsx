import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  variant?: 'default' | 'maroon' | 'green' | 'yellow' | 'red';
  badgeText?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  badgeText,
  onClick,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'maroon':
        return {
          iconBg: 'bg-maroon-50 text-maroon-700 ring-1 ring-maroon-200',
          border: 'border-slate-200 hover:border-maroon-300',
          badge: 'bg-maroon-100/70 text-maroon-800',
        };
      case 'green':
        return {
          iconBg: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
          border: 'border-slate-200 hover:border-emerald-300',
          badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        };
      case 'yellow':
        return {
          iconBg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
          border: 'border-slate-200 hover:border-amber-300',
          badge: 'bg-amber-50 text-amber-700 border border-amber-200',
        };
      case 'red':
        return {
          iconBg: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
          border: 'border-slate-200 hover:border-rose-300',
          badge: 'bg-rose-50 text-rose-700 border border-rose-200',
        };
      default:
        return {
          iconBg: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
          border: 'border-slate-200 hover:border-slate-300',
          badge: 'bg-slate-100 text-slate-700',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white rounded-xl border ${styles.border} p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {badgeText && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles.badge}`}>
            {badgeText}
          </span>
        )}
      </div>

      <p className="mt-2 text-xs font-medium text-slate-500 line-clamp-1">
        {subtitle}
      </p>
    </div>
  );
};
