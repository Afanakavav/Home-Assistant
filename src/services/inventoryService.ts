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
import type { InventoryItem, InventoryItemStatus } from '../types';

export interface CreateInventoryItemData {
  householdId: string;
  name: string;
  category: 'groceries' | 'cleaning' | 'personal' | 'other';
  status?: InventoryItemStatus;
  quantity?: number;
  unit?: string;
  minQuantity?: number;
  linkedToTasks?: string[];
  notes?: string;
}

export const createInventoryItem = async (
  userId: string,
  itemData: CreateInventoryItemData
): Promise<string> => {
  const inventoryRef = collection(db, 'inventory');
  
  const item = {
    ...itemData,
    status: itemData.status || 'ok',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
  };

  const docRef = await addDoc(inventoryRef, item);
  return docRef.id;
};

export const getInventoryItems = async (
  householdId: string,
  options?: {
    status?: InventoryItemStatus;
    category?: string;
  }
): Promise<InventoryItem[]> => {
  const inventoryRef = collection(db, 'inventory');
  let q = query(
    inventoryRef,
    where('householdId', '==', householdId),
    orderBy('name', 'asc')
  );

  if (options?.status) {
    q = query(q, where('status', '==', options.status));
  }

  if (options?.category) {
    q = query(q, where('category', '==', options.category));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      householdId: data.householdId,
      name: data.name,
      category: data.category,
      status: data.status || 'ok',
      quantity: data.quantity,
      unit: data.unit,
      minQuantity: data.minQuantity,
      lastPurchased: data.lastPurchased?.toDate() || undefined,
      lastUsed: data.lastUsed?.toDate() || undefined,
      linkedToTasks: data.linkedToTasks || [],
      notes: data.notes,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy,
    } as InventoryItem;
  });
};

export const getLowStockItems = async (householdId: string): Promise<InventoryItem[]> => {
  const items = await getInventoryItems(householdId);
  return items.filter((item) => item.status === 'low' || item.status === 'out');
};

export const updateInventoryItem = async (
  itemId: string,
  updates: Partial<CreateInventoryItemData & { status?: InventoryItemStatus; quantity?: number; lastPurchased?: Date; lastUsed?: Date }>
): Promise<void> => {
  const itemRef = doc(db, 'inventory', itemId);
  const updateData: any = { ...updates };
  
  if (updates.lastPurchased) {
    updateData.lastPurchased = Timestamp.fromDate(updates.lastPurchased);
  }
  
  if (updates.lastUsed) {
    updateData.lastUsed = Timestamp.fromDate(updates.lastUsed);
  }
  
  updateData.updatedAt = serverTimestamp();
  
  await updateDoc(itemRef, updateData);
};

export const updateInventoryStatus = async (
  itemId: string,
  quantity?: number
): Promise<void> => {
  const itemRef = doc(db, 'inventory', itemId);
  const itemSnap = await getDoc(itemRef);
  
  if (!itemSnap.exists()) return;
  
  const itemData = itemSnap.data() as InventoryItem;
  const currentQuantity = quantity !== undefined ? quantity : itemData.quantity;
  const minQuantity = itemData.minQuantity || 0;
  
  let newStatus: InventoryItemStatus = 'ok';
  if (currentQuantity === undefined || currentQuantity === 0) {
    newStatus = 'out';
  } else if (currentQuantity <= minQuantity) {
    newStatus = 'low';
  }
  
  await updateDoc(itemRef, {
    status: newStatus,
    quantity: currentQuantity,
    updatedAt: serverTimestamp(),
  });
};

export const deleteInventoryItem = async (itemId: string): Promise<void> => {
  const itemRef = doc(db, 'inventory', itemId);
  await deleteDoc(itemRef);
};

// Add inventory item to shopping list
export const addInventoryItemToShoppingList = async (
  householdId: string,
  itemName: string,
  userId: string
): Promise<void> => {
  const { addShoppingItem } = await import('./shoppingListService');
  await addShoppingItem(householdId, itemName, userId);
};

// Predefined critical items
export const criticalItems: CreateInventoryItemData[] = [
  { name: 'Pasta', category: 'groceries', minQuantity: 2, unit: 'pcs', householdId: '' },
  { name: 'Olio', category: 'groceries', minQuantity: 1, unit: 'bottiglia', householdId: '' },
  { name: 'Sale', category: 'groceries', minQuantity: 1, unit: 'pcs', householdId: '' },
  { name: 'Carta igienica', category: 'personal', minQuantity: 4, unit: 'rotoli', householdId: '' },
  { name: 'Detersivo lavatrice', category: 'cleaning', minQuantity: 1, unit: 'bottiglia', householdId: '' },
  { name: 'Detersivo piatti', category: 'cleaning', minQuantity: 1, unit: 'bottiglia', householdId: '' },
  { name: 'Sapone', category: 'personal', minQuantity: 2, unit: 'pcs', householdId: '' },
  { name: 'Sacchi spazzatura', category: 'cleaning', minQuantity: 5, unit: 'pcs', householdId: '' },
];

