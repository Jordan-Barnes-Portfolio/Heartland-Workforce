import { Project } from './project';

export interface ClaimReadyCustomer {
  id: string;
  name: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'pending';
  email: string;
  phone: string;
  accountType: 'basic' | 'premium' | 'enterprise';
  lastActivityDate: string;
  projects: string[]; // Project IDs
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  billingInfo: {
    plan: string;
    amount: number;
    nextBillingDate: string;
    paymentMethod: string;
  };
  notes?: string;
}