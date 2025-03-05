import { User } from './user';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Contact {
  name: string;
  phone: string;
  email: string;
}

export interface Referrer {
  id: string;
  companyName: string;
  contact: Contact;
  referralFee: number;
  referralPercentage: number;
}

export interface Client {
  name: string;
  address: Address;
  contact: Contact;
}

export interface ProjectDates {
  created: string;
  estimatedCompletion: string;
  actualCompletion?: string;
}

export interface ProjectEstimates {
  mitigation: string;
  putBack: string;
  completionEstimates: string;
}

export interface ProjectIndicators {
  claimRecommended: boolean;
  mitigationRequired: boolean;
  emergencyCall: boolean;
  asbestosConcerns: boolean;
  moldConcerns: boolean;
  healthConcerns: boolean;
  nonStandardDryTimes: boolean;
  ppeRequired: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface Technology {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'tools';
}

export interface DocumentationItem {
  id: string;
  type: 'photo' | 'video' | 'report';
  title: string;
  description?: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  content?: string; // For reports
}

export interface DailyDocumentation {
  date: string;
  photos: DocumentationItem[];
  videos: DocumentationItem[];
  reports: DocumentationItem[];
}

export interface Project {
  id: string;
  clientName: string;
  projectType: string;
  status: 'not-started' | 'in-progress' | 'completed';
  referrers: Referrer[]; // Updated to support multiple referrers
  client: Client;
  dates: ProjectDates;
  estimates: ProjectEstimates;
  indicators: ProjectIndicators;
  description: string;
  totalReferralFee: number;
  team?: TeamMember[];
  technologies?: Technology[];
  synopsis?: string;
  documentation?: DailyDocumentation[];
}