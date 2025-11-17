import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Vendor } from '../types';

export interface CreateVendorData {
  householdId: string;
  name: string;
  type: 'utility' | 'maintenance' | 'service' | 'other';
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  contracts?: {
    startDate: Date;
    endDate?: Date;
    monthlyCost?: number;
    notes?: string;
  }[];
  maintenanceSchedule?: {
    type: string;
    frequency: number; // Days
    lastService?: Date;
    nextService?: Date;
    notes?: string;
  }[];
  documents?: {
    name: string;
    url: string;
    uploadedAt: Date;
  }[];
  notes?: string;
}

export const createVendor = async (userId: string, vendorData: CreateVendorData): Promise<string> => {
  const vendorsRef = collection(db, 'vendors');
  
  const vendor = {
    ...vendorData,
    contracts: vendorData.contracts?.map((c) => ({
      ...c,
      startDate: Timestamp.fromDate(c.startDate),
      endDate: c.endDate ? Timestamp.fromDate(c.endDate) : undefined,
    })),
    maintenanceSchedule: vendorData.maintenanceSchedule?.map((m) => ({
      ...m,
      lastService: m.lastService ? Timestamp.fromDate(m.lastService) : undefined,
      nextService: m.nextService ? Timestamp.fromDate(m.nextService) : undefined,
    })),
    documents: vendorData.documents?.map((d) => ({
      ...d,
      uploadedAt: Timestamp.fromDate(d.uploadedAt),
    })),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
  };

  const docRef = await addDoc(vendorsRef, vendor);
  return docRef.id;
};

export const getVendors = async (householdId: string): Promise<Vendor[]> => {
  const vendorsRef = collection(db, 'vendors');
  const q = query(
    vendorsRef,
    where('householdId', '==', householdId),
    orderBy('name', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      householdId: data.householdId,
      name: data.name,
      type: data.type,
      contactInfo: data.contactInfo || {},
      contracts: (data.contracts || []).map((c: any) => ({
        ...c,
        startDate: c.startDate?.toDate() || new Date(),
        endDate: c.endDate?.toDate() || undefined,
      })),
      maintenanceSchedule: (data.maintenanceSchedule || []).map((m: any) => ({
        ...m,
        lastService: m.lastService?.toDate() || undefined,
        nextService: m.nextService?.toDate() || undefined,
      })),
      documents: (data.documents || []).map((d: any) => ({
        ...d,
        uploadedAt: d.uploadedAt?.toDate() || new Date(),
      })),
      notes: data.notes,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy,
    } as Vendor;
  });
};

type MaintenanceItem = NonNullable<Vendor['maintenanceSchedule']>[0];

export const getUpcomingMaintenance = async (
  householdId: string,
  daysAhead: number = 30
): Promise<{ vendor: Vendor; maintenance: MaintenanceItem }[]> => {
  const vendors = await getVendors(householdId);
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + daysAhead);

  const upcoming: { vendor: Vendor; maintenance: MaintenanceItem }[] = [];

  vendors.forEach((vendor) => {
    vendor.maintenanceSchedule?.forEach((maintenance) => {
      if (maintenance.nextService) {
        const nextService = new Date(maintenance.nextService);
        if (nextService >= now && nextService <= futureDate) {
          upcoming.push({ vendor, maintenance });
        }
      }
    });
  });

  return upcoming.sort((a, b) => {
    const dateA = a.maintenance.nextService ? new Date(a.maintenance.nextService).getTime() : 0;
    const dateB = b.maintenance.nextService ? new Date(b.maintenance.nextService).getTime() : 0;
    return dateA - dateB;
  });
};

export const updateVendor = async (
  vendorId: string,
  updates: Partial<CreateVendorData>
): Promise<void> => {
  const vendorRef = doc(db, 'vendors', vendorId);
  const updateData: any = { ...updates };
  
  if (updates.contracts) {
    updateData.contracts = updates.contracts.map((c) => ({
      ...c,
      startDate: Timestamp.fromDate(c.startDate),
      endDate: c.endDate ? Timestamp.fromDate(c.endDate) : undefined,
    }));
  }
  
  if (updates.maintenanceSchedule) {
    updateData.maintenanceSchedule = updates.maintenanceSchedule.map((m) => ({
      ...m,
      lastService: m.lastService ? Timestamp.fromDate(m.lastService) : undefined,
      nextService: m.nextService ? Timestamp.fromDate(m.nextService) : undefined,
    }));
  }
  
  if (updates.documents) {
    updateData.documents = updates.documents.map((d) => ({
      ...d,
      uploadedAt: Timestamp.fromDate(d.uploadedAt),
    }));
  }
  
  updateData.updatedAt = serverTimestamp();
  
  await updateDoc(vendorRef, updateData);
};

export const markMaintenanceDone = async (
  vendorId: string,
  maintenanceType: string
): Promise<void> => {
  const vendorRef = doc(db, 'vendors', vendorId);
  const vendorSnap = await getDoc(vendorRef);
  
  if (!vendorSnap.exists()) return;
  
  const vendorData = vendorSnap.data() as Vendor;
  const now = new Date();
  
  const updatedSchedule = vendorData.maintenanceSchedule?.map((m) => {
    if (m.type === maintenanceType) {
      const nextService = new Date(now);
      nextService.setDate(now.getDate() + m.frequency);
      return {
        ...m,
        lastService: now,
        nextService,
      };
    }
    return m;
  });
  
  await updateDoc(vendorRef, {
    maintenanceSchedule: updatedSchedule?.map((m) => ({
      ...m,
      lastService: m.lastService ? Timestamp.fromDate(m.lastService) : undefined,
      nextService: m.nextService ? Timestamp.fromDate(m.nextService) : undefined,
    })),
    updatedAt: serverTimestamp(),
  });
};

export const deleteVendor = async (vendorId: string): Promise<void> => {
  const vendorRef = doc(db, 'vendors', vendorId);
  await deleteDoc(vendorRef);
};

