// ShareBite — Pickup Service
// Manages the pickup lifecycle: pending → confirmed → ready_for_pickup → picked_up → completed

import { supabase } from '../lib/supabase';

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'completed'
  | 'cancelled'
  | 'expired';

export interface Reservation {
  id: string;
  foodListingId: string;
  userId: string;
  servings: number;
  status: ReservationStatus;
  pickupTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PickupEvent {
  id: string;
  reservationId: string;
  performedBy?: string;
  eventType: 'confirmed' | 'ready' | 'picked_up' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export const PickupService = {
  // ── Get reservation by id ────────────────────────────────────────────────────
  async getReservation(reservationId: string): Promise<Reservation | null> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      foodListingId: data.food_listing_id,
      userId: data.user_id,
      servings: data.servings,
      status: data.status as ReservationStatus,
      pickupTime: data.pickup_time,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // ── Get latest reservation for a food listing ────────────────────────────────
  async getReservationByFood(foodListingId: string): Promise<Reservation | null> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('food_listing_id', foodListingId)
      .not('status', 'in', '(cancelled,expired)')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      foodListingId: data.food_listing_id,
      userId: data.user_id,
      servings: data.servings,
      status: data.status as ReservationStatus,
      pickupTime: data.pickup_time,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // ── Advance reservation status ───────────────────────────────────────────────
  async advanceStatus(
    reservationId: string,
    newStatus: ReservationStatus,
    notes?: string,
  ): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Update reservation
    const { error: resError } = await supabase
      .from('reservations')
      .update({ status: newStatus })
      .eq('id', reservationId);

    if (resError) return false;

    // Record pickup event
    const eventTypeMap: Partial<Record<ReservationStatus, PickupEvent['eventType']>> = {
      confirmed: 'confirmed',
      ready_for_pickup: 'ready',
      picked_up: 'picked_up',
      completed: 'completed',
      cancelled: 'cancelled',
    };

    const eventType = eventTypeMap[newStatus];
    if (eventType) {
      await supabase.from('pickup_events').insert({
        reservation_id: reservationId,
        performed_by: user.id,
        event_type: eventType,
        notes: notes || null,
      });
    }

    // If completed, create impact event
    if (newStatus === 'completed') {
      const { data: res } = await supabase
        .from('reservations')
        .select('servings, user_id')
        .eq('id', reservationId)
        .single();

      if (res) {
        await supabase.from('impact_events').insert({
          user_id: res.user_id,
          reservation_id: reservationId,
          event_type: 'food_rescued',
          servings: res.servings,
        });
      }
    }

    // If completed or picked_up → update food listing status
    if (newStatus === 'completed' || newStatus === 'picked_up') {
      const { data: res } = await supabase
        .from('reservations')
        .select('food_listing_id')
        .eq('id', reservationId)
        .single();

      if (res) {
        const listingStatus = newStatus === 'completed' ? 'completed' : 'picked_up';
        await supabase
          .from('food_listings')
          .update({ status: listingStatus })
          .eq('id', res.food_listing_id);
      }
    }

    return true;
  },

  // ── Get pickup events timeline for a reservation ─────────────────────────────
  async getPickupEvents(reservationId: string): Promise<PickupEvent[]> {
    const { data, error } = await supabase
      .from('pickup_events')
      .select('*')
      .eq('reservation_id', reservationId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data.map((e: any) => ({
      id: e.id,
      reservationId: e.reservation_id,
      performedBy: e.performed_by,
      eventType: e.event_type,
      notes: e.notes,
      createdAt: e.created_at,
    }));
  },

  // ── Create notification for a user ──────────────────────────────────────────
  async createNotification(params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedFoodId?: string;
    relatedReservationId?: string;
  }): Promise<void> {
    await supabase.from('notifications').insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      related_food_id: params.relatedFoodId || null,
      related_reservation_id: params.relatedReservationId || null,
    });
  },
};
