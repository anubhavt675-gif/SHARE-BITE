// ShareBite — Donations Service (Supabase-connected)
// All status strings use lowercase to match PostgreSQL enum values in new schema.

import { supabase } from '../lib/supabase';
import { Donation, CreateDonationForm, DonationStatus } from '../types';

// ─── Category Mappers ─────────────────────────────────────────────────────────

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
  const c = (cat || '').toLowerCase();
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

// ─── DB Status → UI Status mapper ────────────────────────────────────────────
// The new SQL schema uses lowercase enums; the UI uses uppercase constants.
function toUiStatus(dbStatus: string): DonationStatus {
  const s = (dbStatus || '').toLowerCase();
  if (s === 'available') return 'AVAILABLE';
  if (s === 'reserved' || s === 'partially_reserved') return 'CLAIMED';
  if (s === 'picked_up') return 'PICKED_UP';
  if (s === 'completed') return 'COMPLETED';
  if (s === 'expired') return 'EXPIRED';
  if (s === 'cancelled') return 'CANCELLED';
  // Reservation-level statuses
  if (s === 'pending' || s === 'confirmed') return 'CLAIMED';
  if (s === 'ready_for_pickup') return 'PICKUP_CONFIRMED';
  return 'AVAILABLE';
}

// ─── UI Status → DB Status ───────────────────────────────────────────────────
function toDbListingStatus(uiStatus: DonationStatus): string {
  switch (uiStatus) {
    case 'AVAILABLE': return 'available';
    case 'CLAIMED': return 'reserved';
    case 'PICKUP_CONFIRMED': return 'reserved';
    case 'PICKED_UP': return 'picked_up';
    case 'COMPLETED': return 'completed';
    case 'EXPIRED': return 'expired';
    case 'CANCELLED': return 'cancelled';
    default: return 'available';
  }
}

// ─── Listing → Donation mapper ────────────────────────────────────────────────
function mapListingToDonation(listing: any, userLat?: number, userLng?: number): Donation {
  let distanceKm: number | undefined;
  if (
    userLat !== undefined &&
    userLng !== undefined &&
    listing.latitude &&
    listing.longitude
  ) {
    const R = 6371;
    const dLat = (listing.latitude - userLat) * (Math.PI / 180);
    const dLon = (listing.longitude - userLng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLat * (Math.PI / 180)) *
        Math.cos(listing.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distanceKm = Math.round(R * c * 10) / 10;
  }

  const hoursLeft =
    (new Date(listing.available_until).getTime() - Date.now()) / 3_600_000;
  let freshnessStatus: 'FRESH' | 'PICKUP_SOON' | 'URGENT' | 'EXPIRED' = 'FRESH';
  if (hoursLeft <= 0) freshnessStatus = 'EXPIRED';
  else if (hoursLeft <= 2) freshnessStatus = 'URGENT';
  else if (hoursLeft <= 4) freshnessStatus = 'PICKUP_SOON';

  const uiStatus = toUiStatus(listing.status);

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
      totalDonations: listing.donor?.total_donations || 0,
      totalMealsSaved: 0,
      rating: 5.0,
    },
    food: {
      category: toUiCategory(listing.category) as any,
      name: listing.title,
      isVegetarian: listing.food_type === 'veg' || listing.food_type === 'vegan',
      description: listing.description || '',
    },
    quantity: listing.servings,
    servings: listing.available_servings ?? listing.servings,
    imageUrl: listing.image_url || undefined,
    preparedAt: listing.available_from || listing.created_at,
    expiresAt: listing.available_until,
    pickupLocation: {
      latitude: listing.latitude || 28.6139,
      longitude: listing.longitude || 77.209,
      address: listing.pickup_address || 'New Delhi',
      city: listing.city || 'New Delhi',
    },
    packagingType: 'container',
    status: uiStatus,
    freshnessStatus,
    isSafeConfirmed: true,
    notes: listing.description,
    createdAt: listing.created_at,
    updatedAt: listing.updated_at,
    distanceKm,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const DonationsService = {
  // ── Image upload ────────────────────────────────────────────────────────────
  async uploadFoodImage(imageUri: string): Promise<string | null> {
    try {
      if (imageUri.startsWith('http')) return imageUri;
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

      const { error } = await supabase.storage
        .from('food-images')
        .upload(filename, blob, { contentType: 'image/jpeg' });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from('food-images').getPublicUrl(filename);

      return publicUrl;
    } catch (e) {
      console.warn('[ShareBite] Image upload failed:', e);
      return null;
    }
  },

  // ── Nearby listings (uses get_nearby_food RPC when lat/lng available) ───────
  async getNearbyDonations(lat: number, lng: number, radiusKm = 15): Promise<Donation[]> {
    try {
      // Try the Haversine RPC first (most accurate)
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_nearby_food', {
        p_latitude: lat,
        p_longitude: lng,
        p_radius_km: radiusKm,
      });

      if (!rpcError && rpcData && rpcData.length > 0) {
        // RPC returns flattened rows without donor join — fetch donors separately
        const ids: string[] = rpcData.map((r: any) => r.id);
        const { data: fullListings } = await supabase
          .from('food_listings')
          .select('*, donor:profiles(*)')
          .in('id', ids);

        if (fullListings) {
          return fullListings
            .map((l: any) => mapListingToDonation(l, lat, lng))
            .sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
        }
      }

      // Fallback: bounding box query
      const latDelta = radiusKm / 111;
      const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

      const { data, error } = await supabase
        .from('food_listings')
        .select('*, donor:profiles(*)')
        .in('status', ['available', 'partially_reserved'])
        .gt('available_servings', 0)
        .gt('available_until', new Date().toISOString())
        .gte('latitude', lat - latDelta)
        .lte('latitude', lat + latDelta)
        .gte('longitude', lng - lngDelta)
        .lte('longitude', lng + lngDelta);

      if (error || !data) return [];

      return data
        .map((l: any) => mapListingToDonation(l, lat, lng))
        .sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
    } catch (e) {
      console.warn('[ShareBite] getNearbyDonations error:', e);
      return [];
    }
  },

  // ── My donations (donor view) ────────────────────────────────────────────────
  async getMyDonations(donorId: string): Promise<Donation[]> {
    const { data, error } = await supabase
      .from('food_listings')
      .select('*, donor:profiles(*)')
      .eq('donor_id', donorId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((l: any) => mapListingToDonation(l));
  },

  // ── Single listing by id ────────────────────────────────────────────────────
  async getDonationById(id: string): Promise<Donation | null> {
    const { data, error } = await supabase
      .from('food_listings')
      .select('*, donor:profiles(*)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapListingToDonation(data);
  },

  // ── Create donation ─────────────────────────────────────────────────────────
  async createDonation(donorId: string, form: CreateDonationForm): Promise<Donation> {
    // 1. Upload image
    let publicUrl: string | null = null;
    if (form.imageUri) {
      publicUrl = await this.uploadFoodImage(form.imageUri);
    }

    // 2. Determine food_type
    const foodType = form.isVegetarian ? 'veg' : 'non_veg';

    // 3. Insert food_listing (lowercase status = new schema)
    const { data: listing, error: listingErr } = await supabase
      .from('food_listings')
      .insert({
        donor_id: donorId,
        title: form.name,
        description: form.description || '',
        category: toDbCategory(form.category || 'other'),
        food_type: foodType,
        servings: form.servings,
        available_servings: form.servings,
        image_url: publicUrl,
        pickup_address: form.location?.address || '',
        city: form.location?.city || '',
        latitude: form.location?.latitude || null,
        longitude: form.location?.longitude || null,
        available_from: form.preparedAt.toISOString(),
        available_until: form.expiresAt.toISOString(),
        status: 'available',        // ← lowercase enum
        is_urgent: false,
      })
      .select('*, donor:profiles(*)')
      .single();

    if (listingErr || !listing) {
      throw listingErr || new Error('Failed to create food listing');
    }

    // 4. Insert donations history row
    await supabase.from('donations').insert({
      food_listing_id: listing.id,
      donor_id: donorId,
      servings: form.servings,
      status: 'active',             // ← donations table uses text, not enum
    });

    // 5. Insert impact event for donation
    await supabase.from('impact_events').insert({
      user_id: donorId,
      event_type: 'food_donated',
      servings: form.servings,
    });

    return mapListingToDonation(listing);
  },

  // ── Reserve / Claim (uses server-side RPC) ──────────────────────────────────
  async claimDonation(donationId: string, _ngoId: string): Promise<boolean> {
    // Use the RPC name from new schema: reserve_food
    const { data: resId, error } = await supabase.rpc('reserve_food', {
      p_food_listing_id: donationId,
      p_servings: 1,               // Minimum: server checks available
      p_notes: 'NGO food rescue reservation',
    });

    if (error) {
      console.warn('[ShareBite] reserve_food RPC failed:', error);
      return false;
    }

    console.log('[ShareBite] Reservation created:', resId);
    return true;
  },

  // ── Reserve with custom servings ────────────────────────────────────────────
  async reserveFood(
    foodListingId: string,
    servings: number,
    pickupTime?: string,
    notes?: string,
  ): Promise<string | null> {
    const { data: reservationId, error } = await supabase.rpc('reserve_food', {
      p_food_listing_id: foodListingId,
      p_servings: servings,
      p_pickup_time: pickupTime || null,
      p_notes: notes || null,
    });

    if (error) {
      console.warn('[ShareBite] reserve_food error:', error);
      throw new Error(error.message || 'Reservation failed');
    }

    return reservationId as string;
  },

  // ── Update listing status ───────────────────────────────────────────────────
  async updateDonationStatus(donationId: string, status: DonationStatus): Promise<boolean> {
    const dbStatus = toDbListingStatus(status);

    const { error } = await supabase
      .from('food_listings')
      .update({ status: dbStatus })
      .eq('id', donationId);

    if (error) return false;

    // Sync reservations and donations tables
    if (status === 'COMPLETED' || status === 'PICKED_UP') {
      const resStatus = status === 'COMPLETED' ? 'completed' : 'picked_up';
      const donStatus = status === 'COMPLETED' ? 'completed' : 'rescued';

      await supabase
        .from('reservations')
        .update({ status: resStatus })
        .eq('food_listing_id', donationId);

      await supabase
        .from('donations')
        .update({ status: donStatus, completed_at: new Date().toISOString() })
        .eq('food_listing_id', donationId);

      // Record impact event if completed
      if (status === 'COMPLETED') {
        const { data: listing } = await supabase
          .from('food_listings')
          .select('donor_id, servings')
          .eq('id', donationId)
          .single();

        if (listing) {
          await supabase.from('impact_events').insert({
            user_id: listing.donor_id,
            event_type: 'food_rescued',
            servings: listing.servings,
          });
        }
      }
    }

    return true;
  },

  // ── Claimed donations (NGO/receiver activity view) ──────────────────────────
  async getClaimedDonations(userId: string): Promise<Donation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, food_listing:food_listings(*, donor:profiles(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data
      .filter((res: any) => res.food_listing)
      .map((res: any) => {
        const donation = mapListingToDonation(res.food_listing);
        // Show reservation status, not listing status
        donation.status = toUiStatus(res.status);
        return donation;
      });
  },

  // ── All active listings (home feed) ─────────────────────────────────────────
  async getActiveDonations(): Promise<Donation[]> {
    const { data, error } = await supabase
      .from('food_listings')
      .select('*, donor:profiles(*)')
      .in('status', ['available', 'partially_reserved'])
      .gt('available_servings', 0)
      .gt('available_until', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return data.map((l: any) => mapListingToDonation(l));
  },
};
