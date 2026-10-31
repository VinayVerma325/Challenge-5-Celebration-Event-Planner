import React from 'react';
import { Card } from './Card.js';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  iconBg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  iconBg = 'bg-rose-50 text-rose-600'
}) => {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        <div className={`p-2 rounded-xl ${iconBg}`}>{icon}</div>
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
      </div>
    </Card>
  );
};
