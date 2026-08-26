// ShareBite — Donations Service (Mock)

import { Donation, CreateDonationForm, DonationStatus } from '../types';
import { MOCK_DONATIONS, MY_DONATIONS } from './mock-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const DonationsService = {
  async getNearbyDonations(
    _lat: number,
    _lng: number,
    radiusKm: number = 10,
  ): Promise<Donation[]> {
    await delay(800);
    return MOCK_DONATIONS
      .filter(d => d.status === 'AVAILABLE' && d.freshnessStatus !== 'EXPIRED')
      .sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
  },

  async getMyDonations(donorId: string): Promise<Donation[]> {
    await delay(600);
    return MY_DONATIONS;
  },

  async getDonationById(id: string): Promise<Donation | null> {
    await delay(400);
    return MOCK_DONATIONS.find(d => d.id === id) ?? null;
  },

  async createDonation(
    donorId: string,
    form: CreateDonationForm,
  ): Promise<Donation> {
    await delay(1200);
    const newDonation: Donation = {
      id: `don_${Date.now()}`,
      donorId,
      donor: MOCK_DONATIONS[0].donor, // Mock donor reference
      food: {
        category: form.category!,
        name: form.name,
        isVegetarian: form.isVegetarian,
        description: form.description,
      },
      quantity: form.quantity,
      servings: form.servings,
      imageUrl: form.imageUri ?? undefined,
      preparedAt: form.preparedAt.toISOString(),
      expiresAt: form.expiresAt.toISOString(),
      pickupLocation: form.location!,
      packagingType: form.packagingType,
      status: 'AVAILABLE',
      freshnessStatus: 'FRESH',
      isSafeConfirmed: form.isSafeConfirmed,
      notes: form.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_DONATIONS.unshift(newDonation);
    return newDonation;
  },

  async claimDonation(donationId: string, ngoId: string): Promise<boolean> {
    await delay(1000);
    const donation = MOCK_DONATIONS.find(d => d.id === donationId);
    if (donation && donation.status === 'AVAILABLE') {
      donation.status = 'CLAIMED';
      donation.claimedBy = ngoId;
      donation.claimedAt = new Date().toISOString();
      return true;
    }
    return false;
  },

  async updateDonationStatus(
    donationId: string,
    status: DonationStatus,
  ): Promise<boolean> {
    await delay(600);
    const donation = MOCK_DONATIONS.find(d => d.id === donationId);
    if (donation) {
      donation.status = status;
      donation.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  },

  async getClaimedDonations(ngoId: string): Promise<Donation[]> {
    await delay(600);
    return MOCK_DONATIONS.filter(
      d => d.claimedBy === ngoId && d.status !== 'AVAILABLE',
    );
  },
};
