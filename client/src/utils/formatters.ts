export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const safeAmount = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2
    }).format(safeAmount);
  } catch (error) {
    return `${currency.toUpperCase()} ${safeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getDaysRemaining(dateString: string | Date): {
  days: number;
  label: string;
  isPast: boolean;
} {
  const target = new Date(dateString);
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const diffTime = targetMidnight - todayMidnight;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: Math.abs(diffDays), label: `${Math.abs(diffDays)} days ago`, isPast: true };
  }
  if (diffDays === 0) {
    return { days: 0, label: 'Today!', isPast: false };
  }
  if (diffDays === 1) {
    return { days: 1, label: 'Tomorrow', isPast: false };
  }
  return { days: diffDays, label: `${diffDays} days remaining`, isPast: false };
}

export function getEventTypeBadge(type: string): { bg: string; text: string; label: string } {
  switch (type.toLowerCase()) {
    case 'wedding':
      return { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Wedding' };
    case 'birthday':
      return { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Birthday' };
    case 'anniversary':
      return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Anniversary' };
    case 'community':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Community' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Celebration' };
  }
}
