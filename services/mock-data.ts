// ShareBite — Mock Data Service

import {
  Donor,
  NGO,
  Donation,
  DonationClaim,
  AppNotification,
  ImpactStats,
  CommunityImpact,
  FoodCategory,
} from '../types';

// ─── Mock Users ───────────────────────────────────────────────────────────────

export const MOCK_DONOR: Donor = {
  id: 'donor_001',
  email: 'raj.sharma@restaurant.com',
  phone: '+91 98765 43210',
  name: 'Raj Sharma',
  role: 'donor',
  organizationName: 'Sharma Dhaba & Catering',
  organizationType: 'restaurant',
  totalDonations: 47,
  totalMealsSaved: 1240,
  rating: 4.8,
  verificationStatus: 'verified',
  isVerified: true,
  createdAt: '2024-03-15T10:00:00Z',
  updatedAt: '2024-08-10T09:00:00Z',
  location: {
    latitude: 28.6139,
    longitude: 77.2090,
    address: '45, Karol Bagh Market',
    city: 'New Delhi',
    pincode: '110005',
  },
};

export const MOCK_NGO: NGO = {
  id: 'ngo_001',
  email: 'info@greenhope.org',
  phone: '+91 98700 12345',
  name: 'Priya Mehta',
  role: 'ngo',
  organizationName: 'GreenHope Foundation',
  registrationNumber: 'NGO/DL/2019/00421',
  organizationType: 'ngo',
  serviceArea: 'Central Delhi, Karol Bagh, Paharganj',
  capacity: 500,
  totalClaimedDonations: 183,
  totalMealsReceived: 8750,
  verificationStatus: 'verified',
  isVerified: true,
  createdAt: '2024-01-10T08:00:00Z',
  updatedAt: '2024-08-12T11:00:00Z',
  location: {
    latitude: 28.6459,
    longitude: 77.1926,
    address: '12, Patel Nagar',
    city: 'New Delhi',
    pincode: '110008',
  },
};

// ─── Mock Donations ───────────────────────────────────────────────────────────

const now = new Date();
const inMinutes = (m: number) => new Date(now.getTime() + m * 60000).toISOString();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString();

export const MOCK_DONATIONS: Donation[] = [
  {
    id: 'don_001',
    donorId: 'donor_001',
    donor: MOCK_DONOR,
    food: {
      category: 'biryani',
      name: 'Veg Biryani',
      isVegetarian: true,
      description: 'Freshly prepared vegetable biryani with raita',
    },
    quantity: 5,
    servings: 25,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    preparedAt: minutesAgo(90),
    expiresAt: inMinutes(150),
    pickupLocation: {
      latitude: 28.6139,
      longitude: 77.2090,
      address: '45, Karol Bagh Market',
      city: 'New Delhi',
      pincode: '110005',
    },
    packagingType: 'container',
    status: 'AVAILABLE',
    freshnessStatus: 'FRESH',
    isSafeConfirmed: true,
    createdAt: minutesAgo(5),
    updatedAt: minutesAgo(5),
    distanceKm: 1.2,
  },
  {
    id: 'don_002',
    donorId: 'donor_002',
    donor: {
      ...MOCK_DONOR,
      id: 'donor_002',
      name: 'Sunita Patel',
      organizationName: 'Hotel Sunrise',
      totalDonations: 32,
      totalMealsSaved: 890,
    },
    food: {
      category: 'roti',
      name: 'Chapati & Dal Makhani',
      isVegetarian: true,
      description: 'Soft rotis with creamy dal makhani',
    },
    quantity: 3,
    servings: 18,
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
    preparedAt: minutesAgo(120),
    expiresAt: inMinutes(60),
    pickupLocation: {
      latitude: 28.6300,
      longitude: 77.2150,
      address: '78, Ajmal Khan Road',
      city: 'New Delhi',
      pincode: '110005',
    },
    packagingType: 'box',
    status: 'AVAILABLE',
    freshnessStatus: 'PICKUP_SOON',
    isSafeConfirmed: true,
    createdAt: minutesAgo(15),
    updatedAt: minutesAgo(15),
    distanceKm: 2.4,
  },
  {
    id: 'don_003',
    donorId: 'donor_003',
    donor: {
      ...MOCK_DONOR,
      id: 'donor_003',
      name: 'Amit Gupta',
      organizationName: 'Wedding Catering Co.',
      organizationType: 'caterer',
      totalDonations: 18,
      totalMealsSaved: 2100,
    },
    food: {
      category: 'sweets',
      name: 'Assorted Sweets & Snacks',
      isVegetarian: true,
      description: 'Wedding leftovers — gulab jamun, barfi, namkeen',
    },
    quantity: 8,
    servings: 60,
    imageUrl: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400',
    preparedAt: minutesAgo(180),
    expiresAt: inMinutes(30),
    pickupLocation: {
      latitude: 28.6200,
      longitude: 77.2000,
      address: 'Marriage Garden, Pusa Road',
      city: 'New Delhi',
      pincode: '110005',
    },
    packagingType: 'box',
    status: 'AVAILABLE',
    freshnessStatus: 'URGENT',
    isSafeConfirmed: true,
    notes: 'Please carry your own containers.',
    createdAt: minutesAgo(30),
    updatedAt: minutesAgo(30),
    distanceKm: 3.1,
  },
  {
    id: 'don_004',
    donorId: 'donor_001',
    donor: MOCK_DONOR,
    food: {
      category: 'rice',
      name: 'Plain Rice & Rajma',
      isVegetarian: true,
    },
    quantity: 4,
    servings: 20,
    preparedAt: minutesAgo(300),
    expiresAt: minutesAgo(60),
    pickupLocation: MOCK_DONOR.location!,
    packagingType: 'container',
    status: 'CLAIMED',
    freshnessStatus: 'FRESH',
    isSafeConfirmed: true,
    createdAt: minutesAgo(360),
    updatedAt: minutesAgo(120),
    claimedBy: 'ngo_001',
    claimedAt: minutesAgo(120),
    distanceKm: 0.8,
  },
  {
    id: 'don_005',
    donorId: 'donor_004',
    donor: {
      ...MOCK_DONOR,
      id: 'donor_004',
      name: 'Kavya Reddy',
      organizationName: 'Hostel 9',
      organizationType: 'hostel',
      totalDonations: 25,
      totalMealsSaved: 450,
    },
    food: {
      category: 'sabzi',
      name: 'Mixed Veg Curry',
      isVegetarian: true,
      description: 'Hostel mess leftover curry',
    },
    quantity: 6,
    servings: 30,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
    preparedAt: minutesAgo(60),
    expiresAt: inMinutes(240),
    pickupLocation: {
      latitude: 28.6250,
      longitude: 77.2200,
      address: 'Hostel 9, Karol Bagh',
      city: 'New Delhi',
      pincode: '110005',
    },
    packagingType: 'container',
    status: 'AVAILABLE',
    freshnessStatus: 'FRESH',
    isSafeConfirmed: true,
    createdAt: minutesAgo(10),
    updatedAt: minutesAgo(10),
    distanceKm: 1.8,
  },
];

// ─── My Donations (Donor view) ───────────────────────────────────────────────

export const MY_DONATIONS = MOCK_DONATIONS.filter(d => d.donorId === 'donor_001');

// ─── Mock Notifications ───────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_001',
    userId: 'ngo_001',
    type: 'new_donation',
    title: '🍛 New food available nearby!',
    body: 'Veg Biryani (25 servings) available 1.2 km away. Pickup before 9:30 PM.',
    isRead: false,
    createdAt: minutesAgo(5),
  },
  {
    id: 'notif_002',
    userId: 'donor_001',
    type: 'donation_claimed',
    title: '✅ Donation claimed!',
    body: 'GreenHope Foundation claimed your Rajma Rice donation. Pickup in ~30 min.',
    isRead: false,
    createdAt: minutesAgo(25),
  },
  {
    id: 'notif_003',
    userId: 'donor_001',
    type: 'donation_completed',
    title: '🎉 Food reached its destination!',
    body: 'Your Biryani donation helped feed 25 people today. Amazing work!',
    isRead: true,
    createdAt: minutesAgo(120),
  },
  {
    id: 'notif_004',
    userId: 'ngo_001',
    type: 'new_donation',
    title: '⚡ Urgent pickup needed!',
    body: 'Wedding sweets (60 servings) expiring in 30 min — 3.1 km away.',
    isRead: false,
    createdAt: minutesAgo(2),
  },
  {
    id: 'notif_005',
    userId: 'donor_001',
    type: 'impact_milestone',
    title: '🏆 Milestone reached!',
    body: 'You\'ve saved 1,000 meals! Your donations are making a real difference.',
    isRead: true,
    createdAt: minutesAgo(1440),
  },
];

// ─── Mock Impact Stats ───────────────────────────────────────────────────────

export const MOCK_DONOR_IMPACT: ImpactStats = {
  mealsSaved: 1240,
  foodRedistributedKg: 310,
  peopleReached: 890,
  wastePreventedKg: 248,
  co2SavedKg: 620,
  donationsCount: 47,
  claimsCount: 0,
};

export const MOCK_NGO_IMPACT: ImpactStats = {
  mealsSaved: 8750,
  foodRedistributedKg: 2187,
  peopleReached: 4200,
  wastePreventedKg: 1750,
  co2SavedKg: 4375,
  donationsCount: 0,
  claimsCount: 183,
};

export const MOCK_COMMUNITY_IMPACT: CommunityImpact = {
  mealsSaved: 124580,
  foodRedistributedKg: 31145,
  peopleReached: 58000,
  wastePreventedKg: 24916,
  co2SavedKg: 62290,
  donationsCount: 4820,
  claimsCount: 4731,
  activeNGOs: 247,
  activeDonors: 1893,
  citiesCovered: 12,
  thisMonthMeals: 12450,
};

// ─── Food Category UI Data ────────────────────────────────────────────────────

export interface FoodCategoryUI {
  key: FoodCategory;
  label: string;
  emoji: string;
  color: string;
}

export const FOOD_CATEGORIES: FoodCategoryUI[] = [
  { key: 'rice', label: 'Rice', emoji: '🍚', color: '#F5C842' },
  { key: 'roti', label: 'Roti', emoji: '🫓', color: '#E8823A' },
  { key: 'sabzi', label: 'Sabzi', emoji: '🥬', color: '#4CAF7D' },
  { key: 'dal', label: 'Dal', emoji: '🫘', color: '#C4612A' },
  { key: 'biryani', label: 'Biryani', emoji: '🍛', color: '#E8823A' },
  { key: 'snacks', label: 'Snacks', emoji: '🥨', color: '#F5C842' },
  { key: 'sweets', label: 'Sweets', emoji: '🍬', color: '#E91E63' },
  { key: 'fruits', label: 'Fruits', emoji: '🍎', color: '#E53935' },
  { key: 'bakery', label: 'Bakery', emoji: '🥐', color: '#8D6E63' },
  { key: 'beverages', label: 'Beverages', emoji: '🥤', color: '#1976D2' },
  { key: 'other', label: 'Other', emoji: '🍽️', color: '#5A6B62' },
];

// ─── Status Labels ────────────────────────────────────────────────────────────

export const DONATION_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  CLAIMED: 'Claimed',
  PICKUP_CONFIRMED: 'Pickup Confirmed',
  PICKED_UP: 'Picked Up',
  COMPLETED: 'Food Reached Its Destination',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};

export const FRESHNESS_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  FRESH: { label: 'Fresh', color: '#2D9B5A' },
  PICKUP_SOON: { label: 'Pickup Soon', color: '#E8823A' },
  URGENT: { label: 'Urgent', color: '#E53935' },
  EXPIRED: { label: 'Expired', color: '#5A6B62' },
};

// ─── Pickup Timeline ──────────────────────────────────────────────────────────

export const PICKUP_TIMELINE_STEPS = [
  { status: 'AVAILABLE' as const, label: 'Food Listed', description: 'Donation posted by donor' },
  { status: 'CLAIMED' as const, label: 'NGO Matched', description: 'NGO found and notified' },
  { status: 'PICKUP_CONFIRMED' as const, label: 'Pickup Confirmed', description: 'Pickup time confirmed' },
  { status: 'PICKED_UP' as const, label: 'Food Collected', description: 'Food picked up from donor' },
  { status: 'COMPLETED' as const, label: 'Completed', description: 'Food reached its destination' },
];

// ─── Onboarding Screens ───────────────────────────────────────────────────────

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
