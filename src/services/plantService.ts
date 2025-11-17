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
import type { Plant } from '../types';

export interface CreatePlantData {
  householdId: string;
  name: string;
  location: string;
  wateringFrequency: number; // Days between watering
  lightNotes?: string;
  fertilizerNotes?: string;
  notes?: string;
}

export const createPlant = async (userId: string, plantData: CreatePlantData): Promise<string> => {
  const plantsRef = collection(db, 'plants');
  
  const now = new Date();
  const nextWatering = new Date(now);
  nextWatering.setDate(now.getDate() + plantData.wateringFrequency);
  
  const plant = {
    ...plantData,
    lastWatered: undefined,
    nextWatering: Timestamp.fromDate(nextWatering),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
  };

  const docRef = await addDoc(plantsRef, plant);
  return docRef.id;
};

export const getPlants = async (householdId: string): Promise<Plant[]> => {
  const plantsRef = collection(db, 'plants');
  const q = query(
    plantsRef,
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
      location: data.location,
      wateringFrequency: data.wateringFrequency,
      lastWatered: data.lastWatered?.toDate() || undefined,
      nextWatering: data.nextWatering?.toDate() || undefined,
      lightNotes: data.lightNotes,
      fertilizerNotes: data.fertilizerNotes,
      notes: data.notes,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy,
    } as Plant;
  });
};

export const getPlantsNeedingWater = async (householdId: string): Promise<Plant[]> => {
  const allPlants = await getPlants(householdId);
  const now = new Date();
  
  return allPlants.filter((plant) => {
    if (!plant.nextWatering) return false;
    return new Date(plant.nextWatering) <= now;
  });
};

export const waterPlant = async (plantId: string): Promise<void> => {
  const plantRef = doc(db, 'plants', plantId);
  const plantSnap = await getDoc(plantRef);
  
  if (!plantSnap.exists()) return;
  
  const plantData = plantSnap.data() as Plant;
  const now = new Date();
  const nextWatering = new Date(now);
  nextWatering.setDate(now.getDate() + plantData.wateringFrequency);
  
  await updateDoc(plantRef, {
    lastWatered: Timestamp.fromDate(now),
    nextWatering: Timestamp.fromDate(nextWatering),
    updatedAt: serverTimestamp(),
  });
};

export const updatePlant = async (
  plantId: string,
  updates: Partial<CreatePlantData & { nextWatering?: Date }>
): Promise<void> => {
  const plantRef = doc(db, 'plants', plantId);
  const updateData: any = { ...updates };
  
  if (updates.nextWatering) {
    updateData.nextWatering = Timestamp.fromDate(updates.nextWatering);
  }
  
  updateData.updatedAt = serverTimestamp();
  
  await updateDoc(plantRef, updateData);
};

export const deletePlant = async (plantId: string): Promise<void> => {
  const plantRef = doc(db, 'plants', plantId);
  await deleteDoc(plantRef);
};

