// ShareBite — Partners Service

import { supabase } from '../lib/supabase';

export type PartnerType =
  | 'restaurant'
  | 'hostel'
  | 'ngo'
  | 'community_kitchen'
  | 'farmer'
  | 'organization'
  | 'other';

export interface Partner {
  id: string;
  profileId?: string;
  organizationName: string;
  organizationType: PartnerType;
  description?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

function mapPartner(p: any): Partner {
  return {
    id: p.id,
    profileId: p.profile_id,
    organizationName: p.organization_name,
    organizationType: p.organization_type as PartnerType,
    description: p.description,
    address: p.address,
    city: p.city,
    latitude: p.latitude,
    longitude: p.longitude,
    logoUrl: p.logo_url,
    isVerified: p.is_verified || false,
    createdAt: p.created_at,
  };
}

export const PartnersService = {
  // ── Get all verified partners ────────────────────────────────────────────────
  async getVerifiedPartners(): Promise<Partner[]> {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('is_verified', true)
      .order('organization_name');

    if (error || !data) return [];
    return data.map(mapPartner);
  },

  // ── Get partners by type ─────────────────────────────────────────────────────
  async getPartnersByType(type: PartnerType): Promise<Partner[]> {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('organization_type', type)
      .order('is_verified', { ascending: false });

    if (error || !data) return [];
    return data.map(mapPartner);
  },

  // ── Get partner by profile id ────────────────────────────────────────────────
  async getPartnerByProfileId(profileId: string): Promise<Partner | null> {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error || !data) return null;
    return mapPartner(data);
  },

  // ── Create or update partner profile ────────────────────────────────────────
  async upsertPartner(
    profileId: string,
    partnerData: Partial<Partner>,
  ): Promise<Partner | null> {
    const { data, error } = await supabase
      .from('partners')
      .upsert({
        profile_id: profileId,
        organization_name: partnerData.organizationName,
        organization_type: partnerData.organizationType || 'other',
        description: partnerData.description,
        address: partnerData.address,
        city: partnerData.city,
        latitude: partnerData.latitude,
        longitude: partnerData.longitude,
        logo_url: partnerData.logoUrl,
      })
      .select()
      .single();

    if (error || !data) return null;
    return mapPartner(data);
  },
};
