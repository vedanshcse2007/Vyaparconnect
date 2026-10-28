export function formatTimeAgo(isoDateString: string): string {
  const date = new Date(isoDateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
}

export type AvailabilityTier = 'recently_confirmed' | 'needs_confirmation' | 'unavailable';

export function getFreshnessStatus(
  isoDateString: string,
  isConfirmed: boolean,
  stockQuantity: number = 1
): {
  tier: AvailabilityTier;
  confidenceScore: number;
  label: string;
  badgeClass: string;
  dotClass: string;
  description: string;
  recommendation: string;
} {
  const date = new Date(isoDateString);
  const diffHours = (Date.now() - date.getTime()) / (1000 * 60 * 60);

  // 1. Confirmed Out of Stock
  if (stockQuantity <= 0) {
    return {
      tier: 'unavailable',
      confidenceScore: 100,
      label: 'Unavailable (Out of Stock)',
      badgeClass: 'text-rose-800 bg-rose-50 border border-rose-200',
      dotClass: 'bg-rose-500',
      description: 'The shop has confirmed that this item is currently out of stock.',
      recommendation: 'Check other nearby shops listed below or send an enquiry to request restocking.',
    };
  }

  // 2. Needs Confirmation (stale > 24 hours or unconfirmed flag)
  if (!isConfirmed || diffHours > 24) {
    return {
      tier: 'needs_confirmation',
      confidenceScore: 35,
      label: 'Needs Confirmation',
      badgeClass: 'text-amber-800 bg-amber-50 border border-amber-200',
      dotClass: 'bg-amber-500',
      description: 'This listing has not been updated within 24 hours. Price or availability may have shifted.',
      recommendation: 'Call the shop or send an in-app enquiry before visiting.',
    };
  }

  // 3. Recently Confirmed (< 2 hours)
  if (diffHours <= 2) {
    return {
      tier: 'recently_confirmed',
      confidenceScore: 98,
      label: 'Recently Confirmed',
      badgeClass: 'text-emerald-800 bg-emerald-50 border border-emerald-200',
      dotClass: 'bg-emerald-500',
      description: 'Confirmed by retailer very recently. High availability confidence.',
      recommendation: 'Safe to visit now. Item is confirmed on the shelf.',
    };
  }

  // 4. Confirmed Today (2 to 24 hours)
  return {
    tier: 'recently_confirmed',
    confidenceScore: 85,
    label: 'Confirmed Today',
    badgeClass: 'text-teal-800 bg-teal-50 border border-teal-200',
    dotClass: 'bg-teal-500',
    description: 'Confirmed during today’s business hours by merchant.',
    recommendation: 'High confidence. Store has reported active stock today.',
  };
}
