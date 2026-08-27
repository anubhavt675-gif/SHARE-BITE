// ShareBite — Food UI Constants
// UI display helpers: labels, emojis, colors, onboarding slides.
// These are not data — they are purely presentation-layer constants.

import { FoodCategory } from '../types';

// ─── Food Category UI Data ────────────────────────────────────────────────────

export interface FoodCategoryUI {
  key: FoodCategory;
  label: string;
  emoji: string;
  color: string;
}

export const FOOD_CATEGORIES: FoodCategoryUI[] = [
  { key: 'rice',      label: 'Rice',      emoji: '🍚', color: '#F5C842' },
  { key: 'roti',      label: 'Roti',      emoji: '🫓', color: '#E8823A' },
  { key: 'sabzi',     label: 'Sabzi',     emoji: '🥬', color: '#4CAF7D' },
  { key: 'dal',       label: 'Dal',       emoji: '🫘', color: '#C4612A' },
  { key: 'biryani',   label: 'Biryani',   emoji: '🍛', color: '#E8823A' },
  { key: 'snacks',    label: 'Snacks',    emoji: '🥨', color: '#F5C842' },
  { key: 'sweets',    label: 'Sweets',    emoji: '🍬', color: '#E91E63' },
  { key: 'fruits',    label: 'Fruits',    emoji: '🍎', color: '#E53935' },
  { key: 'bakery',    label: 'Bakery',    emoji: '🥐', color: '#8D6E63' },
  { key: 'beverages', label: 'Beverages', emoji: '🥤', color: '#1976D2' },
  { key: 'other',     label: 'Other',     emoji: '🍽️', color: '#5A6B62' },
];

// ─── Status Labels ────────────────────────────────────────────────────────────

export const DONATION_STATUS_LABELS: Record<string, string> = {
  AVAILABLE:        'Available',
  CLAIMED:          'Claimed',
  PICKUP_CONFIRMED: 'Pickup Confirmed',
  PICKED_UP:        'Picked Up',
  COMPLETED:        'Food Reached Its Destination',
  CANCELLED:        'Cancelled',
  EXPIRED:          'Expired',
};

export const FRESHNESS_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  FRESH:       { label: 'Fresh',       color: '#2D9B5A' },
  PICKUP_SOON: { label: 'Pickup Soon', color: '#E8823A' },
  URGENT:      { label: 'Urgent',      color: '#E53935' },
  EXPIRED:     { label: 'Expired',     color: '#5A6B62' },
};

// ─── Pickup Timeline Steps ────────────────────────────────────────────────────

export const PICKUP_TIMELINE_STEPS = [
  { status: 'AVAILABLE'        as const, label: 'Food Listed',      description: 'Donation posted by donor'  },
  { status: 'CLAIMED'          as const, label: 'NGO Matched',       description: 'NGO found and notified'    },
  { status: 'PICKUP_CONFIRMED' as const, label: 'Pickup Confirmed',  description: 'Pickup time confirmed'     },
  { status: 'PICKED_UP'        as const, label: 'Food Collected',    description: 'Food picked up from donor' },
  { status: 'COMPLETED'        as const, label: 'Completed',         description: 'Food reached its destination' },
];

// ─── Onboarding Slides ────────────────────────────────────────────────────────

export const ONBOARDING_SLIDES = [
  {
    id: 1,
    emoji: '🌱',
    title: 'Share Food.\nShare Hope.',
    subtitle: 'Turning surplus into someone\'s next meal — one click at a time.',
    bgColor: '#EDF7F1',
  },
  {
    id: 2,
    emoji: '🍽️',
    title: 'Good Food Should\nNever Go To Waste.',
    subtitle: 'Every day, restaurants and events discard tonnes of safe, edible food while communities nearby go hungry.',
    bgColor: '#FFF8F0',
  },
  {
    id: 3,
    emoji: '⚡',
    title: 'Donate.\nMatch. Feed.',
    subtitle: 'Real-time matching connects your surplus food with the nearest NGO in minutes.',
    bgColor: '#EDF7F1',
  },
  {
    id: 4,
    emoji: '🏆',
    title: 'Make Every\nMeal Count.',
    subtitle: 'Track your impact — meals saved, CO₂ reduced, lives touched. Be the change.',
    bgColor: '#FFF8F0',
  },
];
