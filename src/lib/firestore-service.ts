import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Project } from '@/types/project';
import type { Partner } from '@/types/partner';

// Utility function to format currency values in USD
export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '$0.00';
  
  // Convert string to number if needed
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  
  // Handle NaN
  if (isNaN(numValue)) return '$0.00';
  
  // Format with USD currency format
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

// Helper function to convert Firestore documents to regular objects with IDs
const convertDoc = <T>(doc: QueryDocumentSnapshot<DocumentData>): T => {
  return { id: doc.id, ...doc.data() } as T;
};

// Projects
export const getProjects = async (): Promise<Project[]> => {
  const projectsQuery = query(
    collection(db, 'projects'),
    orderBy('dates.created', 'desc')
  );
  const querySnapshot = await getDocs(projectsQuery);
  return querySnapshot.docs.map(doc => convertDoc<Project>(doc));
};

export const getProjectsByStatus = async (status: Project['status']): Promise<Project[]> => {
  const projectsQuery = query(
    collection(db, 'projects'),
    where('status', '==', status),
    orderBy('dates.created', 'desc')
  );
  const querySnapshot = await getDocs(projectsQuery);
  return querySnapshot.docs.map(doc => convertDoc<Project>(doc));
};

export const getProject = async (id: string): Promise<Project> => {
  const docRef = doc(db, 'projects', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Project;
  } else {
    throw new Error('Project not found');
  }
};

export const createProject = async (projectData: Omit<Project, 'id'>) => {
  // Sanitize referrers to ensure referralPercentage is always a number
  const sanitizedData = { ...projectData };
  if (sanitizedData.referrers) {
    sanitizedData.referrers = sanitizedData.referrers.map(referrer => ({
      ...referrer,
      referralPercentage: typeof referrer.referralPercentage === 'string'
        ? parseFloat(referrer.referralPercentage) || 0
        : (referrer.referralPercentage || 0)
    }));
  }

  // Calculate total referral fee
  if (sanitizedData.referrers && sanitizedData.referrers.length > 0) {
    sanitizedData.totalReferralFee = sanitizedData.referrers.reduce(
      (total, referrer) => total + (referrer.referralFee || 0), 
      0
    );
  } else {
    sanitizedData.totalReferralFee = 0;
  }

  // Add timestamps
  sanitizedData.dates = {
    ...sanitizedData.dates,
    created: sanitizedData.dates?.created || new Date().toISOString()
  };

  const projectsRef = collection(db, 'projects');
  return await addDoc(projectsRef, sanitizedData);
};

export const updateProject = async (projectId: string, projectData: Partial<Project>): Promise<Project> => {
  console.log('🔍 firestore-service: updateProject called with:', {
    projectId,
    projectData: JSON.stringify(projectData, null, 2)
  });
  
  const projectRef = doc(db, 'projects', projectId);
  console.log('🔍 firestore-service: Created document reference for project ID:', projectId);
  
  // Sanitize referrers to ensure referralPercentage is always a number
  const sanitizedData = { ...projectData };
  if (sanitizedData.referrers) {
    console.log('🔍 firestore-service: Sanitizing referrers');
    sanitizedData.referrers = sanitizedData.referrers.map(referrer => ({
      ...referrer,
      referralPercentage: typeof referrer.referralPercentage === 'string'
        ? parseFloat(referrer.referralPercentage) || 0
        : (referrer.referralPercentage || 0)
    }));
    console.log('🔍 firestore-service: Sanitized referrers:', JSON.stringify(sanitizedData.referrers, null, 2));
  }
  
  // Create a filtered data object with only defined values
  const filteredData: Record<string, any> = {};
  console.log('🔍 firestore-service: Filtering undefined values');
  
  // Recursive function to filter out undefined values
  const filterUndefined = (data: Record<string, any>, target: Record<string, any>, path: string = '') => {
    for (const key in data) {
      const value = data[key];
      const newPath = path ? `${path}.${key}` : key;
      
      if (value === undefined) {
        continue;
      } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        target[key] = {};
        filterUndefined(value, target[key], newPath);
        // Remove empty objects
        if (Object.keys(target[key]).length === 0) {
          delete target[key];
        }
      } else {
        target[key] = value;
      }
    }
  };
  
  filterUndefined(sanitizedData, filteredData);
  console.log('🔍 firestore-service: Filtered data after removing undefined values:', JSON.stringify(filteredData, null, 2));
  
  // Recalculate referral fees if we have both referrers and a completion estimate
  if (filteredData.referrers && filteredData.estimates?.completionEstimates) {
    console.log('🔍 firestore-service: Recalculating referral fees based on completion estimate');
    console.log('🔍 firestore-service: Original referrers:', JSON.stringify(filteredData.referrers, null, 2));
    console.log('🔍 firestore-service: Completion estimate:', filteredData.estimates.completionEstimates);
    
    const completionEstimate = parseFloat(filteredData.estimates.completionEstimates.replace(/[^0-9.]/g, ''));
    console.log('🔍 firestore-service: Parsed completion estimate:', completionEstimate);
    
    if (!isNaN(completionEstimate) && completionEstimate > 0) {
      filteredData.referrers = filteredData.referrers.map((referrer: any) => {
        console.log(`🔍 firestore-service: Processing referrer ${referrer.companyName} with percentage ${referrer.referralPercentage}`);
        const fee = Math.round((referrer.referralPercentage / 100) * completionEstimate * 100) / 100;
        console.log(`🔍 firestore-service: Calculated fee: ${fee}`);
        return {
          ...referrer,
          referralFee: fee
        };
      });
      
      console.log('🔍 firestore-service: Updated referrers with recalculated fees:', JSON.stringify(filteredData.referrers, null, 2));
      
      // Update total referral fee
      filteredData.totalReferralFee = filteredData.referrers.reduce(
        (total: number, referrer: any) => total + referrer.referralFee, 
        0
      );
      console.log('🔍 firestore-service: Updated total referral fee:', filteredData.totalReferralFee);
    }
  }
  
  // Add updatedAt timestamp
  filteredData.updatedAt = serverTimestamp();
  console.log('🔍 firestore-service: Added updatedAt timestamp');
  
  try {
    // Only update if there are fields to update
    if (Object.keys(filteredData).length > 0) {
      console.log('🔍 firestore-service: Updating document in Firestore with:', JSON.stringify(filteredData, null, 2));
      await updateDoc(projectRef, filteredData);
      console.log('🔍 firestore-service: Document updated successfully');
    } else {
      console.log('🔍 firestore-service: No fields to update in Firestore');
    }
    
    // Get the updated document
    console.log('🔍 firestore-service: Fetching updated document');
    const updatedDoc = await getDoc(projectRef);
    if (!updatedDoc.exists()) {
      console.error('🔍 firestore-service: Document not found after update');
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    const result = { id: updatedDoc.id, ...updatedDoc.data() } as Project;
    console.log('🔍 firestore-service: Updated document from Firestore:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('🔍 firestore-service: Error updating project in Firestore:', error);
    throw error;
  }
};

export const deleteProject = async (id: string): Promise<string> => {
  await deleteDoc(doc(db, 'projects', id));
  return id;
};

// Get recent projects (for dashboard widgets, etc.)
export const getRecentProjects = async (count: number = 5): Promise<Project[]> => {
  const projectsQuery = query(
    collection(db, 'projects'),
    orderBy('dates.created', 'desc'),
    limit(count)
  );
  const querySnapshot = await getDocs(projectsQuery);
  return querySnapshot.docs.map(doc => convertDoc<Project>(doc));
};

// Search projects by client name
export const searchProjectsByClient = async (clientName: string): Promise<Project[]> => {
  // Note: This is a simple implementation. For better search, consider using Firestore's
  // array-contains or Firebase Extensions like Search with Algolia
  const projectsQuery = query(
    collection(db, 'projects'),
    where('clientName', '>=', clientName),
    where('clientName', '<=', clientName + '\uf8ff')
  );
  const querySnapshot = await getDocs(projectsQuery);
  return querySnapshot.docs.map(doc => convertDoc<Project>(doc));
};

// You can add similar functions for other collections (users, metrics, etc.) 

// Partner-related functions
export const getPartners = async (): Promise<Partner[]> => {
  const partnersQuery = query(
    collection(db, 'partners'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(partnersQuery);
  return querySnapshot.docs.map(doc => convertDoc<Partner>(doc));
};

export const getPartnersByStatus = async (status: Partner['status']): Promise<Partner[]> => {
  const partnersQuery = query(
    collection(db, 'partners'),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(partnersQuery);
  return querySnapshot.docs.map(doc => convertDoc<Partner>(doc));
};

export const getPartner = async (id: string): Promise<Partner> => {
  const docRef = doc(db, 'partners', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Partner;
  } else {
    throw new Error('Partner not found');
  }
};

export const createPartner = async (partnerData: Omit<Partner, 'id'>) => {
  // Ensure referralPercentage is a number
  const sanitizedData = {
    ...partnerData,
    referralPercentage: typeof partnerData.referralPercentage === 'string' 
      ? parseFloat(partnerData.referralPercentage) || 0 
      : (partnerData.referralPercentage || 0)
  };

  // Add createdAt timestamp
  sanitizedData.createdAt = new Date().toISOString();
  sanitizedData.updatedAt = new Date().toISOString();

  const partnersRef = collection(db, 'partners');
  return await addDoc(partnersRef, sanitizedData);
};

export const updatePartner = async (partnerId: string, partnerData: Partial<Partner>): Promise<Partner> => {
  const partnerRef = doc(db, 'partners', partnerId);
  
  // Ensure referralPercentage is a number if it's being updated
  const sanitizedData = { ...partnerData };
  if (sanitizedData.referralPercentage !== undefined) {
    sanitizedData.referralPercentage = typeof sanitizedData.referralPercentage === 'string'
      ? parseFloat(sanitizedData.referralPercentage) || 0
      : (sanitizedData.referralPercentage || 0);
  }
  
  // Create a filtered data object with only defined values
  const filteredData: Record<string, any> = {};
  
  // Recursive function to filter out undefined values (reusing from updateProject)
  const filterUndefined = (data: Record<string, any>, target: Record<string, any>, path: string = '') => {
    for (const key in data) {
      const value = data[key];
      const newPath = path ? `${path}.${key}` : key;
      
      if (value === undefined) {
        continue;
      } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        target[key] = {};
        filterUndefined(value, target[key], newPath);
        // Remove empty objects
        if (Object.keys(target[key]).length === 0) {
          delete target[key];
        }
      } else {
        target[key] = value;
      }
    }
  };
  
  filterUndefined(sanitizedData, filteredData);
  
  // Add updatedAt timestamp
  filteredData.updatedAt = serverTimestamp();
  
  // Only update if there are fields to update
  if (Object.keys(filteredData).length > 0) {
    await updateDoc(partnerRef, filteredData);
  }
  
  // Get the updated document
  const updatedDoc = await getDoc(partnerRef);
  if (!updatedDoc.exists()) {
    throw new Error(`Partner with ID ${partnerId} not found`);
  }
  
  return { id: updatedDoc.id, ...updatedDoc.data() } as Partner;
};

export const deletePartner = async (id: string): Promise<string> => {
  await deleteDoc(doc(db, 'partners', id));
  return id;
};

export const searchPartners = async (searchTerm: string): Promise<Partner[]> => {
  // Note: This is a simple implementation. For better search, consider using Firestore's
  // array-contains or Firebase Extensions like Search with Algolia
  const partnersQuery = query(
    collection(db, 'partners'),
    where('name', '>=', searchTerm),
    where('name', '<=', searchTerm + '\uf8ff')
  );
  const querySnapshot = await getDocs(partnersQuery);
  return querySnapshot.docs.map(doc => convertDoc<Partner>(doc));
};

export const getPartnerAnalytics = async (partnerId?: string): Promise<any> => {
  // If partnerId is provided, get analytics for a specific partner
  if (partnerId) {
    try {
      const partner = await getPartner(partnerId);
      
      // Calculate analytics based on partner's referrals
      const totalProjects = partner.referrals.length;
      const convertedProjects = partner.referrals.filter(r => r.status === 'converted').length;
      const pendingProjects = partner.referrals.filter(r => r.status === 'pending').length;
      const lostProjects = partner.referrals.filter(r => r.status === 'lost').length;
      const totalEarnings = partner.totalEarnings || 
        partner.referrals.reduce((sum, ref) => sum + (ref.fee || 0), 0);
      const averageFee = totalProjects > 0 ? totalEarnings / totalProjects : 0;
      
      return {
        totalProjects,
        convertedProjects,
        pendingProjects,
        lostProjects,
        totalEarnings,
        averageFee,
        successRate: totalProjects > 0 ? (convertedProjects / totalProjects) * 100 : 0
      };
    } catch (error) {
      console.error("Error getting partner analytics:", error);
      throw error;
    }
  }
  
  // Otherwise, get general analytics for all partners
  const partners = await getPartners();
  
  return {
    totalPartners: partners.length,
    activePartners: partners.filter(p => p.status === 'active').length,
    inactivePartners: partners.filter(p => p.status === 'inactive').length,
    // Add more analytics as needed
  };
}; 