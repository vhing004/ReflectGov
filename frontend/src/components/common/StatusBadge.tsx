import React from 'react';
import { FeedbackStatus } from '../../types';

interface StatusBadgeProps {
  status: FeedbackStatus | string | number;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  let label = 'Đã gửi';
  let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
  let dotColor = 'bg-blue-500';

  const statusStr = typeof status === 'number'
    ? ['Submitted', 'Processing', 'InProgress', 'ResolvedPendingApproval', 'Published', 'Rejected', 'Closed'][status] || 'Submitted'
    : status;

  switch (statusStr) {
    case 'Submitted':
      label = 'Đã tiếp nhận';
      badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
      dotColor = 'bg-blue-500';
      break;
    case 'Processing':
      label = 'Đã phân công';
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
      dotColor = 'bg-amber-500';
      break;
    case 'InProgress':
      label = 'Đang xử lý';
      badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      dotColor = 'bg-indigo-500 animate-pulse';
      break;
    case 'ResolvedPendingApproval':
      label = 'Chờ duyệt nghiệm thu';
      badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
      dotColor = 'bg-purple-500';
      break;
    case 'Published':
      label = 'Đã hoàn thành';
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;
    case 'Rejected':
      label = 'Từ chối tiếp nhận';
      badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
      dotColor = 'bg-rose-500';
      break;
    case 'Closed':
      label = 'Đã đóng';
      badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
      dotColor = 'bg-slate-400';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
};
