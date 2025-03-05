import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import {
  getPartners,
  getPartnersByStatus,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
  searchPartners,
  getPartnerAnalytics
} from './firestore-service';
import type { Partner, PartnerReferral } from '@/types/partner';

interface PartnerContextType {
  partners: Partner[];
  loading: boolean;
  error: string | null;
  addPartner: (partner: Omit<Partner, 'id'>) => Promise<void>;
  updatePartner: (id: string, partner: Partial<Partner>) => Promise<void>;
  removePartner: (id: string) => Promise<void>;
  getPartnerById: (id: string) => Promise<Partner | undefined>;
  getPartnersByStatus: (status: Partner['status']) => Promise<Partner[]>;
  searchPartnersByTerm: (searchTerm: string) => Promise<Partner[]>;
  fetchPartnerAnalytics: (partnerId: string) => Promise<{
    totalProjects: number;
    convertedProjects: number;
    pendingProjects: number;
    lostProjects: number;
    totalEarnings: number;
    averageFee: number;
  }>;
  refreshPartners: () => Promise<Partner[]>;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export function usePartners() {
  const context = useContext(PartnerContext);
  if (context === undefined) {
    throw new Error('usePartners must be used within a PartnerProvider');
  }
  return context;
}

export function PartnerProvider({ children }: { children: ReactNode }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const partnersData = await getPartners();
      setPartners(partnersData);
      return partnersData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch partners';
      setError(errorMessage);
      toast.error(`Error loading partners: ${errorMessage}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Initialize partners on mount
  useEffect(() => {
    fetchPartners();
  }, []);

  async function addPartner(partner: Omit<Partner, 'id'>) {
    setLoading(true);
    try {
      const docRef = await createPartner(partner);
      const newPartner = await getPartner(docRef.id);
      setPartners(prev => [newPartner, ...prev]);
      toast.success('Partner added successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add partner';
      setError(errorMessage);
      toast.error(`Error adding partner: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updatePartnerState(id: string, updatedPartner: Partial<Partner>) {
    setLoading(true);
    try {
      const updated = await updatePartner(id, updatedPartner);
      setPartners(prev =>
        prev.map(partner => (partner.id === id ? updated : partner))
      );
      toast.success('Partner updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update partner';
      setError(errorMessage);
      toast.error(`Error updating partner: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function removePartner(id: string) {
    setLoading(true);
    try {
      await deletePartner(id);
      setPartners(prev => prev.filter(partner => partner.id !== id));
      toast.success('Partner removed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete partner';
      setError(errorMessage);
      toast.error(`Error removing partner: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getPartnerById(id: string): Promise<Partner | undefined> {
    try {
      // First check if we already have the partner in state
      const existingPartner = partners.find(p => p.id === id);
      if (existingPartner) return existingPartner;

      // Otherwise fetch from Firestore
      const partner = await getPartner(id);
      return partner;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get partner';
      setError(errorMessage);
      toast.error(`Error fetching partner: ${errorMessage}`);
      return undefined;
    }
  }

  async function fetchPartnersByStatus(status: Partner['status']): Promise<Partner[]> {
    try {
      const partnersData = await getPartnersByStatus(status);
      return partnersData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch partners by status';
      setError(errorMessage);
      toast.error(`Error loading partners: ${errorMessage}`);
      return [];
    }
  }

  async function searchPartnersByTerm(searchTerm: string): Promise<Partner[]> {
    try {
      const partnersData = await searchPartners(searchTerm);
      return partnersData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search partners';
      setError(errorMessage);
      toast.error(`Error searching partners: ${errorMessage}`);
      return [];
    }
  }

  async function fetchPartnerAnalytics(partnerId: string) {
    try {
      const analytics = await getPartnerAnalytics(partnerId);
      return analytics;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch partner analytics';
      setError(errorMessage);
      toast.error(`Error loading partner analytics: ${errorMessage}`);
      throw err;
    }
  }

  const value = {
    partners,
    loading,
    error,
    addPartner,
    updatePartner: updatePartnerState,
    removePartner,
    getPartnerById,
    getPartnersByStatus: fetchPartnersByStatus,
    searchPartnersByTerm,
    fetchPartnerAnalytics,
    refreshPartners: fetchPartners
  };

  return (
    <PartnerContext.Provider value={value}>
      {children}
    </PartnerContext.Provider>
  );
} 