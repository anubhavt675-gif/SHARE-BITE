// ShareBite — TypeScript Type Definitions

// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserRole = 'donor' | 'ngo' | 'household' | 'admin';

export type DonationStatus =
  | 'AVAILABLE'
  | 'CLAIMED'
  | 'PICKUP_CONFIRMED'
  | 'PICKED_UP'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type FreshnesStatus = 'FRESH' | 'PICKUP_SOON' | 'URGENT' | 'EXPIRED';

export type FoodCategory =
  | 'rice'
  | 'roti'
  | 'sabzi'
  | 'dal'
  | 'biryani'
  | 'snacks'
  | 'sweets'
  | 'fruits'
  | 'bakery'
  | 'beverages'
  | 'other';

export type PackagingType = 'container' | 'box' | 'bag' | 'open' | 'wrapped';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'under_review';

export type NotificationType =
  | 'new_donation'
  | 'donation_claimed'
  | 'pickup_confirmed'
  | 'donation_completed'
  | 'donation_expiring'
  | 'verification_update'
  | 'impact_milestone';

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  pincode?: string;
  landmark?: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  avatar?: string;
  location?: Location;
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Donor extends User {
  role: 'donor' | 'household';
  organizationName?: string;
  organizationType?: 'restaurant' | 'hotel' | 'caterer' | 'household' | 'event' | 'hostel';
  totalDonations: number;
  totalMealsSaved: number;
  rating: number;
}

export interface NGO extends User {
  role: 'ngo';
  organizationName: string;
  registrationNumber: string;
  organizationType: 'ngo' | 'shelter' | 'orphanage' | 'old_age_home' | 'community';
  serviceArea: string;
  capacity: number;
  totalClaimedDonations: number;
  totalMealsReceived: number;
  verificationDocuments?: string[];
}

export interface FoodItem {
  category: FoodCategory;
  name: string;
  isVegetarian: boolean;
  description?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donor: Donor;
  food: FoodItem;
  quantity: number;
  servings: number;
  imageUrl?: string;
  preparedAt: string;
  expiresAt: string;
  pickupLocation: Location;
  packagingType: PackagingType;
  status: DonationStatus;
  freshnessStatus: FreshnesStatus;
  isSafeConfirmed: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  claimedBy?: string;
  claimedAt?: string;
  distanceKm?: number; // Calculated field for NGO view
}

export interface DonationClaim {
  id: string;
  donationId: string;
  ngoId: string;
  ngo: NGO;
  claimedAt: string;
  estimatedPickupTime: string;
  actualPickupTime?: string;
  status: 'claimed' | 'pickup_confirmed' | 'picked_up' | 'completed' | 'cancelled';
  contactName: string;
  contactPhone: string;
  notes?: string;
}

export interface Pickup {
  id: string;
  donationId: string;
  claimId: string;
  donation: Donation;
  claim: DonationClaim;
  timeline: PickupTimelineItem[];
  currentStatus: DonationStatus;
  estimatedArrival?: string;
}

export interface PickupTimelineItem {
  status: DonationStatus;
  label: string;
  description: string;
  timestamp?: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

export interface ImpactStats {
  mealsSaved: number;
  foodRedistributedKg: number;
  peopleReached: number;
  wastePreventedKg: number;
  co2SavedKg: number;
  donationsCount: number;
  claimsCount: number;
}

export interface CommunityImpact extends ImpactStats {
  activeNGOs: number;
  activeDonors: number;
  citiesCovered: number;
  thisMonthMeals: number;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface CreateDonationForm {
  category: FoodCategory | null;
  name: string;
  imageUri: string | null;
  quantity: number;
  servings: number;
  isVegetarian: boolean;
  preparedAt: Date;
  expiresAt: Date;
  packagingType: PackagingType;
  location: Location | null;
  notes: string;
  isSafeConfirmed: boolean;
  description: string;
}

export interface AuthForm {
  email: string;
  phone: string;
  password: string;
  name: string;
  role: UserRole;
  otp: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Navigation Types ─────────────────────────────────────────────────────────

export interface TabRoute {
  name: string;
  icon: string;
  label: string;
  badge?: number;
}
