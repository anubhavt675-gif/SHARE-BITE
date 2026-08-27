// ShareBite — Donations Service (Supabase-connected)

import { supabase } from '../lib/supabase';
import { Donation, CreateDonationForm, DonationStatus } from '../types';

// Helper to translate categories
function toDbCategory(cat: string): string {
  const c = cat.toLowerCase();
  if (c === 'biryani') return 'Biryani';
  if (c === 'rice') return 'Rice';
  if (c === 'roti') return 'Roti';
  if (c === 'dal') return 'Curry';
  if (c === 'sabzi') return 'Vegetables';
  if (c === 'bakery') return 'Bakery';
  if (c === 'fruits') return 'Fruits';
  if (c === 'snacks' || c === 'packaged food') return 'Packaged Food';
  return 'Other';
}

function toUiCategory(cat: string): string {
  const c = cat.toLowerCase();
  if (c === 'biryani') return 'biryani';
  if (c === 'rice') return 'rice';
  if (c === 'roti') return 'roti';
  if (c === 'curry') return 'dal';
  if (c === 'vegetables') return 'sabzi';
  if (c === 'bakery') return 'bakery';
  if (c === 'fruits') return 'fruits';
  if (c === 'packaged food') return 'snacks';
  return 'other';
}

function mapListingToDonation(listing: any, userLat?: number, userLng?: number): Donation {
  let distanceKm = undefined;
  if (userLat !== undefined && userLng !== undefined && listing.latitude && listing.longitude) {
    const R = 6371; // Earth radius in km
    const dLat = (listing.latitude - userLat) * Math.PI / 180;
    const dLon = (listing.longitude - userLng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLat * Math.PI / 180) * Math.cos(listing.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distanceKm = Math.round(R * c * 10) / 10;
  }

  const hoursLeft = (new Date(listing.available_until).getTime() - Date.now()) / 3600000;
  let freshnessStatus: 'FRESH' | 'PICKUP_SOON' | 'URGENT' | 'EXPIRED' = 'FRESH';
  if (hoursLeft <= 0) freshnessStatus = 'EXPIRED';
  else if (hoursLeft <= 2) freshnessStatus = 'URGENT';
  else if (hoursLeft <= 4) freshnessStatus = 'PICKUP_SOON';

  return {
    id: listing.id,
    donorId: listing.donor_id,
    donor: {
      id: listing.donor?.id || listing.donor_id,
      name: listing.donor?.full_name || 'Anonymous Donor',
      email: listing.donor?.email || '',
      phone: listing.donor?.phone || '',
      role: listing.donor?.role || 'donor',
      avatar: listing.donor?.avatar_url,
      isVerified: listing.donor?.is_verified || false,
      verificationStatus: listing.donor?.is_verified ? 'verified' : 'pending',
      createdAt: listing.donor?.created_at || listing.created_at,
      updatedAt: listing.donor?.updated_at || listing.updated_at,
      totalDonations: 0,
      totalMealsSaved: 0,
      rating: 5.0,
    },
    food: {
      category: toUiCategory(listing.category) as any,
      name: listing.title,
      isVegetarian: !listing.description?.toLowerCase().includes('non-veg'),
      description: listing.description || '',
    },
    quantity: listing.servings,
    servings: listing.servings,
    imageUrl: listing.image_url || undefined,
    preparedAt: listing.available_from || listing.created_at,
    expiresAt: listing.available_until,
    pickupLocation: {
      latitude: listing.latitude || 28.6139,
      longitude: listing.longitude || 77.2090,
      address: listing.pickup_address || 'Karol Bagh, New Delhi',
      city: listing.city || 'New Delhi',
    },
    packagingType: 'container',
    status: listing.status as DonationStatus,
    freshnessStatus,
    isSafeConfirmed: listing.is_safe_confirmed ?? true,
    notes: listing.description,
    createdAt: listing.created_at,
    updatedAt: listing.updated_at,
    distanceKm,
  };
}

export const DonationsService = {
  async uploadFoodImage(imageUri: string): Promise<string | null> {
    try {
      if (imageUri.startsWith('http')) {
        return imageUri; // Already uploaded / remote URL
      }
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

      const { data, error } = await supabase.storage
        .from('food-images')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('food-images')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (e) {
      console.warn('Image upload failed, using fallback:', e);
      return null;
    }
  },

  async getNearbyDonations(
    lat: number,
    lng: number,
    radiusKm: number = 15,
  ): Promise<Donation[]> {
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const { data, error } = await supabase
      .from('food_listings')
      .select('*, donor:profiles(*)')
      .eq('status', 'AVAILABLE')
      .gt('available_until', new Date().toISOString())
      .gte('latitude', lat - latDelta)
      .lte('latitude', lat + latDelta)
      .gte('longitude', lng - lngDelta)
      .lte('longitude', lng + lngDelta);

    if (error || !data) {
      return [];
    }

    return data
      .map(listing => mapListingToDonation(listing, lat, lng))
      .sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
  },

  async getMyDonations(donorId: string): Promise<Donation[]> {
    const { data, error } = await supabase
      .from('food_listings')
      .select('*, donor:profiles(*)')
      .eq('donor_id', donorId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(listing => mapListingToDonation(listing));
  },

  async getDonationById(id: string): Promise<Donation | null> {
    const { data, error } = await supabase
      .from('food_listings')
      .select('*, donor:profiles(*)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapListingToDonation(data);
  },

  async createDonation(
    donorId: string,
    form: CreateDonationForm,
  ): Promise<Donation> {
    // 1. Upload photo if present
    let publicUrl = null;
    if (form.imageUri) {
      publicUrl = await this.uploadFoodImage(form.imageUri);
    }

    // 2. Insert into food_listings
    const { data: listing, error: listingErr } = await supabase
      .from('food_listings')
      .insert({
        donor_id: donorId,
        title: form.name,
        description: form.description || '',
        category: toDbCategory(form.category || 'other'),
        servings: form.servings,
        available_servings: form.servings,
        image_url: publicUrl,
        pickup_address: form.location?.address || '',
        latitude: form.location?.latitude || 28.6139,
        longitude: form.location?.longitude || 77.2090,
        available_from: form.preparedAt.toISOString(),
        available_until: form.expiresAt.toISOString(),
        status: 'AVAILABLE',
      })
      .select('*, donor:profiles(*)')
      .single();

    if (listingErr || !listing) {
      throw listingErr || new Error('Failed to create food listing');
    }

    // 3. Insert into donations history record
    await supabase
      .from('donations')
      .insert({
        food_listing_id: listing.id,
        donor_id: donorId,
        servings: form.servings,
        status: 'AVAILABLE',
      });

    return mapListingToDonation(listing);
  },

  async claimDonation(donationId: string, ngoId: string): Promise<boolean> {
    const donation = await this.getDonationById(donationId);
    if (!donation) return false;

    // Call atomic RPC
    const { data: resId, error } = await supabase.rpc('reserve_food_servings', {
      p_food_listing_id: donationId,
      p_user_id: ngoId,
      p_servings: donation.servings,
      p_pickup_time: donation.expiresAt,
      p_notes: 'NGO Claimed surplus meal package',
    });

    if (error) {
      console.warn('RPC Reservation failed:', error);
      return false;
    }

    // Update donations history
    await supabase
      .from('donations')
      .update({ status: 'CLAIMED' })
      .eq('food_listing_id', donationId);

    return true;
  },

  async updateDonationStatus(
    donationId: string,
    status: DonationStatus,
  ): Promise<boolean> {
    const { error } = await supabase
      .from('food_listings')
      .update({ status: status })
      .eq('id', donationId);

    if (error) return false;

    if (status === 'COMPLETED' || status === 'PICKED_UP') {
      const dbStatus = status === 'COMPLETED' ? 'COMPLETED' : 'PICKED_UP';
      await supabase
        .from('reservations')
        .update({ status: dbStatus })
        .eq('food_listing_id', donationId);

      await supabase
        .from('donations')
        .update({
          status: dbStatus,
          completed_at: new Date().toISOString(),
        })
        .eq('food_listing_id', donationId);
    }

    return true;
  },

  async getClaimedDonations(ngoId: string): Promise<Donation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, food_listing:food_listings(*, donor:profiles(*))')
      .eq('user_id', ngoId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data
      .filter((res: any) => res.food_listing)
      .map((res: any) => {
        const donation = mapListingToDonation(res.food_listing);
        // Overlay the reservation status
        donation.status = res.status as DonationStatus;
        return donation;
      });
  },
};
