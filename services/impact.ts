// ShareBite — Impact Service

import { ImpactStats, CommunityImpact } from '../types';
import { MOCK_DONOR_IMPACT, MOCK_NGO_IMPACT, MOCK_COMMUNITY_IMPACT } from './mock-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ImpactService = {
  async getUserImpact(userId: string, role: string): Promise<ImpactStats> {
    await delay(600);
    return role === 'ngo' ? MOCK_NGO_IMPACT : MOCK_DONOR_IMPACT;
  },

  async getCommunityImpact(): Promise<CommunityImpact> {
    await delay(400);
    return MOCK_COMMUNITY_IMPACT;
  },

  // Calculate CO2 savings (0.5 kg CO2 per kg food saved from landfill)
  calculateCO2Savings(foodKg: number): number {
    return Math.round(foodKg * 0.5);
  },

  // Estimate meals from kg
  estimateMeals(foodKg: number): number {
    return Math.round(foodKg * 4); // ~250g per meal
  },
};
