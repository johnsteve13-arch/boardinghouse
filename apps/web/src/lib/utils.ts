import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AvailabilityStatus, GenderPolicy } from '@seait-stay/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString('en-PH')}`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function getAvailabilityInfo(status: AvailabilityStatus) {
  switch (status) {
    case 'available':
      return {
        label: 'Available',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        dot: 'bg-emerald-500',
        badge: '🟢 Available'
      };
    case 'few_slots':
      return {
        label: 'Few Slots Left',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        dot: 'bg-amber-500',
        badge: '🟡 Few Slots'
      };
    case 'fully_occupied':
      return {
        label: 'Fully Occupied',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        dot: 'bg-rose-500',
        badge: '🔴 Fully Occupied'
      };
    default:
      return {
        label: 'Unknown',
        color: 'text-slate-700 bg-slate-50 border-slate-200',
        dot: 'bg-slate-400',
        badge: '⚪ Unknown'
      };
  }
}

export function getGenderPolicyInfo(policy: GenderPolicy) {
  switch (policy) {
    case 'female_only':
      return { label: 'Female Only', badgeColor: 'bg-pink-100 text-pink-700 border-pink-200' };
    case 'male_only':
      return { label: 'Male Only', badgeColor: 'bg-blue-100 text-blue-700 border-blue-200' };
    case 'all':
    default:
      return { label: 'Co-ed / All Welcome', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}
