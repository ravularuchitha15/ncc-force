import clsx from 'clsx';

const variants = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue: 'bg-blue-100 text-blue-700',
  sky: 'bg-sky-100 text-sky-600',
  navy: 'bg-navy-100 text-navy-600',
  gray: 'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
};

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span className={clsx('badge', variants[variant], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Active: 'green',
    Inactive: 'red',
    Present: 'green',
    Absent: 'red',
    Leave: 'yellow',
    Approved: 'green',
    Rejected: 'red',
    Pending: 'yellow',
    Completed: 'blue',
    Upcoming: 'sky',
    Registered: 'navy',
    Outstanding: 'purple',
    Excellent: 'green',
    Good: 'blue',
    Pass: 'green',
    Fail: 'red',
    Verified: 'green',
  };
  return <Badge variant={map[status] || 'gray'}>{status}</Badge>;
}
