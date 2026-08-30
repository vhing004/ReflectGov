import React from 'react';
import { FeedbackPriority } from '../../types';

interface PriorityBadgeProps {
  priority: FeedbackPriority | string | number;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  let label = 'Bình thường';
  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';

  const priorityStr = typeof priority === 'number'
    ? ['Low', 'Normal', 'High', 'Urgent'][priority] || 'Normal'
    : priority;

  switch (priorityStr) {
    case 'Low':
      label = 'Thấp';
      badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
    case 'Normal':
      label = 'Bình thường';
      badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
    case 'High':
      label = 'Cao';
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'Urgent':
      label = 'Khẩn cấp';
      badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${badgeColor} ${className}`}
    >
      {label}
    </span>
  );
};
