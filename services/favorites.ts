// ShareBite — Favorites Service

import { supabase } from '../lib/supabase';

export interface FavoriteItem {
  id: string;
  userId: string;
  foodListingId: string;
  createdAt: string;
}

export const FavoritesService = {
  // ── Get all favorites for user ───────────────────────────────────────────────
  async getFavorites(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('food_listing_id')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data.map((f: any) => f.food_listing_id);
  },

  // ── Check if a specific listing is favorited ─────────────────────────────────
  async isFavorite(userId: string, foodListingId: string): Promise<boolean> {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('food_listing_id', foodListingId)
      .maybeSingle();

    return !!data;
  },

  // ── Toggle favorite ──────────────────────────────────────────────────────────
  async toggleFavorite(userId: string, foodListingId: string): Promise<boolean> {
    const exists = await this.isFavorite(userId, foodListingId);

    if (exists) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('food_listing_id', foodListingId);
      return false; // now unfavorited
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, food_listing_id: foodListingId });
      return true; // now favorited
    }
  },

  // ── Add favorite ─────────────────────────────────────────────────────────────
  async addFavorite(userId: string, foodListingId: string): Promise<void> {
    await supabase
      .from('favorites')
      .insert({ user_id: userId, food_listing_id: foodListingId })
      .on('conflict', 'do_nothing' as any); // upsert-style
  },

  // ── Remove favorite ──────────────────────────────────────────────────────────
  async removeFavorite(userId: string, foodListingId: string): Promise<void> {
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('food_listing_id', foodListingId);
  },
};
