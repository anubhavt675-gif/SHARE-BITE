// ShareBite — Impact Service (Supabase-connected)
// Uses lowercase status values matching new PostgreSQL enum schema.

import { supabase } from '../lib/supabase';
import { ImpactStats, CommunityImpact } from '../types';

export const ImpactService = {
  // ── Per-user impact ──────────────────────────────────────────────────────────
  async getUserImpact(userId: string, role: string): Promise<ImpactStats> {
    try {
      // Try the user_impact view first
      const { data: viewData } = await supabase
        .from('user_impact')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (viewData) {
        const mealsDonated = Number(viewData.meals_donated) || 0;
        const mealsRescued = Number(viewData.meals_rescued) || 0;
        const mealsSaved = role === 'ngo' ? mealsRescued : mealsDonated;
        const foodKg = Math.round(mealsSaved * 0.25);
        const co2Kg = Math.round(foodKg * 0.5);

        return {
          mealsSaved,
          foodRedistributedKg: foodKg,
          co2SavedKg: co2Kg,
          peopleReached: Math.round(mealsSaved * 0.9),
          wastePreventedKg: foodKg,
          donationsCount: Number(viewData.donation_count) || 0,
          claimsCount: Number(viewData.reservation_count) || 0,
        };
      }

      // Fallback: manual aggregation
      if (role === 'ngo' || role === 'receiver' || role === 'volunteer') {
        const { data } = await supabase
          .from('reservations')
          .select('servings')
          .eq('user_id', userId)
          .eq('status', 'completed');  // ← lowercase

        const mealsSaved = data ? data.reduce((acc, r) => acc + r.servings, 0) : 0;
        const foodKg = Math.round(mealsSaved * 0.25);
        const co2Kg = Math.round(foodKg * 0.5);

        return {
          mealsSaved,
          foodRedistributedKg: foodKg,
          co2SavedKg: co2Kg,
          peopleReached: Math.round(mealsSaved * 0.9),
          wastePreventedKg: foodKg,
          donationsCount: mealsSaved ? Math.ceil(mealsSaved / 15) : 0,
          claimsCount: data ? data.length : 0,
        };
      } else {
        // Donor
        const { data } = await supabase
          .from('impact_events')
          .select('servings')
          .eq('user_id', userId)
          .eq('event_type', 'food_donated');

        const mealsSaved = data ? data.reduce((acc, r) => acc + r.servings, 0) : 0;
        const foodKg = Math.round(mealsSaved * 0.25);
        const co2Kg = Math.round(foodKg * 0.5);

        const { count: donCount } = await supabase
          .from('food_listings')
          .select('*', { count: 'exact', head: true })
          .eq('donor_id', userId);

        return {
          mealsSaved,
          foodRedistributedKg: foodKg,
          co2SavedKg: co2Kg,
          peopleReached: Math.round(mealsSaved * 0.9),
          wastePreventedKg: foodKg,
          donationsCount: donCount || 0,
          claimsCount: 0,
        };
      }
    } catch {
      return {
        mealsSaved: 0,
        foodRedistributedKg: 0,
        co2SavedKg: 0,
        peopleReached: 0,
        wastePreventedKg: 0,
        donationsCount: 0,
        claimsCount: 0,
      };
    }
  },

  // ── Community-wide impact ────────────────────────────────────────────────────
  async getCommunityImpact(): Promise<CommunityImpact> {
    try {
      // Total rescued (completed reservations)
      const { data: resData } = await supabase
        .from('reservations')
        .select('servings')
        .eq('status', 'completed');  // ← lowercase

      const totalMeals = resData
        ? resData.reduce((acc, r) => acc + r.servings, 0)
        : 0;
      const foodRedistributedKg = Math.round(totalMeals * 0.25);
      const co2SavedKg = Math.round(foodRedistributedKg * 0.5);

      // Count distinct donor profiles
      const { count: donorsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'donor');

      // Count NGO profiles
      const { count: ngosCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'ngo');

      // Count total donations
      const { count: donationCount } = await supabase
        .from('food_listings')
        .select('*', { count: 'exact', head: true });

      return {
        activeDonors: donorsCount || 0,
        activeNGOs: ngosCount || 0,
        citiesCovered: 1,
        thisMonthMeals: totalMeals,
        foodRedistributedKg,
        co2SavedKg,
        mealsSaved: totalMeals,
        peopleReached: Math.round(totalMeals * 0.9),
        wastePreventedKg: foodRedistributedKg,
        donationsCount: donationCount || 0,
        claimsCount: resData ? resData.length : 0,
      };
    } catch {
      return {
        activeDonors: 0,
        activeNGOs: 0,
        citiesCovered: 0,
        thisMonthMeals: 0,
        foodRedistributedKg: 0,
        co2SavedKg: 0,
        mealsSaved: 0,
        peopleReached: 0,
        wastePreventedKg: 0,
        donationsCount: 0,
        claimsCount: 0,
      };
    }
  },

  calculateCO2Savings(foodKg: number): number {
    return Math.round(foodKg * 0.5);
  },

  estimateMeals(foodKg: number): number {
    return Math.round(foodKg * 4);
  },
};
