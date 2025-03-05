export interface PartnerReferral {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  date: string;
  status: 'converted' | 'pending' | 'lost';
  fee: number;
}

export interface Partner {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'inactive';
  avatar?: string;
  referralCount: number;
  successRate: number;
  lastReferral?: string;
  referrals: PartnerReferral[];
  referralPercentage: number;
  totalEarnings: number;
  activeProjects: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
} 