import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  subLabel?: string;
  variant?: 'rose' | 'emerald' | 'amber' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  subLabel,
  variant = 'rose',
  size = 'md',
  showPercentage = true
}) => {
  const safeValue = Math.min(100, Math.max(0, Math.round(value)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const colorClasses = {
    rose: 'bg-rose-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500'
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
          <span>{label}</span>
          {showPercentage && <span className="text-slate-500">{safeValue}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
        className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses[size]}`}
      >
        <div
          className={`${heightClasses[size]} ${colorClasses[variant]} transition-all duration-500 motion-reduce:transition-none rounded-full`}
          style={{ width: `${safeValue}%` }}
        ></div>
      </div>
      {subLabel && <p className="text-[11px] text-slate-400 mt-1">{subLabel}</p>}
    </div>
  );
};
