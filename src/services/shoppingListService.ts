import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ShoppingList, ShoppingListItem } from '../types';

// Get or create shopping list for household
export const getShoppingList = async (householdId: string): Promise<ShoppingList | null> => {
  const listsRef = collection(db, 'shoppingLists');
  const q = query(listsRef, where('householdId', '==', householdId), limit(1));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    // Convert Firestore Timestamps to Dates in items array
    const items = (data.items || []).map((item: any) => ({
      ...item,
      addedAt: item.addedAt?.toDate ? item.addedAt.toDate() : (item.addedAt instanceof Date ? item.addedAt : new Date(item.addedAt)),
      checkedAt: item.checkedAt?.toDate ? item.checkedAt.toDate() : (item.checkedAt instanceof Date ? item.checkedAt : (item.checkedAt ? new Date(item.checkedAt) : undefined)),
    }));
    
    return {
      id: doc.id,
      ...data,
      items,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as ShoppingList;
  }

  // Create new shopping list if doesn't exist
  const newListRef = doc(collection(db, 'shoppingLists'));
  const newList: Omit<ShoppingList, 'id'> = {
    householdId,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(newListRef, {
    ...newList,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: newListRef.id,
    ...newList,
  };
};

// Helper function to clean undefined values from objects
const cleanUndefined = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  }
  if (obj && typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefined(value);
      }
    }
    return cleaned;
  }
  return obj;
};

export const addShoppingItem = async (
  householdId: string,
  itemName: string,
  userId: string
): Promise<void> => {
  const list = await getShoppingList(householdId);
  if (!list) throw new Error('Shopping list not found');

  const newItem: ShoppingListItem = {
    id: Date.now().toString(),
    name: itemName.trim(),
    addedBy: userId,
    addedAt: new Date(),
    checked: false,
  };

  const listRef = doc(db, 'shoppingLists', list.id);
  await updateDoc(listRef, {
    items: arrayUnion(cleanUndefined(newItem)),
    updatedAt: serverTimestamp(),
  });
};

export const toggleShoppingItem = async (
  householdId: string,
  itemId: string,
  userId: string
): Promise<void> => {
  const list = await getShoppingList(householdId);
  if (!list) throw new Error('Shopping list not found');

  const item = list.items.find((i) => i.id === itemId);
  if (!item) throw new Error('Item not found');

  const updatedItem: ShoppingListItem = {
    ...item,
    checked: !item.checked,
    checkedBy: !item.checked ? userId : undefined,
    checkedAt: !item.checked ? new Date() : undefined,
  };

  const listRef = doc(db, 'shoppingLists', list.id);
  const updatedItems = list.items.map((i) => {
    if (i.id === itemId) {
      return updatedItem;
    }
    return i;
  });

  // Clean undefined values before saving
  const cleanedItems = cleanUndefined(updatedItems);

  await updateDoc(listRef, {
    items: cleanedItems,
    updatedAt: serverTimestamp(),
  });
};

export const removeShoppingItem = async (
  householdId: string,
  itemId: string
): Promise<void> => {
  const list = await getShoppingList(householdId);
  if (!list) throw new Error('Shopping list not found');

  const listRef = doc(db, 'shoppingLists', list.id);
  const updatedItems = list.items.filter((i) => i.id !== itemId);

  // Clean undefined values before saving
  const cleanedItems = cleanUndefined(updatedItems);

  await updateDoc(listRef, {
    items: cleanedItems,
    updatedAt: serverTimestamp(),
  });
};

export const clearCheckedItems = async (householdId: string): Promise<void> => {
  const list = await getShoppingList(householdId);
  if (!list) throw new Error('Shopping list not found');

  const listRef = doc(db, 'shoppingLists', list.id);
  const uncheckedItems = list.items.filter((i) => !i.checked);

  // Clean undefined values before saving
  const cleanedItems = cleanUndefined(uncheckedItems);

  await updateDoc(listRef, {
    items: cleanedItems,
    updatedAt: serverTimestamp(),
  });
};

// Get purchase history from expenses (for suggestions)
export const getPurchaseHistory = async (
  householdId: string,
  limitCount: number = 50
): Promise<string[]> => {
  // Get expenses with "groceries" category
  const expensesRef = collection(db, 'expenses');
  const q = query(
    expensesRef,
    where('householdId', '==', householdId),
    where('category', '==', 'groceries'),
    orderBy('date', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  const items: Set<string> = new Set();

  querySnapshot.docs.forEach((doc) => {
    const expense = doc.data();
    const description = expense.description?.toLowerCase() || '';
    
    // Extract common grocery items from descriptions
    // Simple keyword matching - can be improved
    const groceryKeywords = [
      'milk', 'bread', 'pasta', 'rice', 'cheese', 'eggs', 'butter',
      'tomatoes', 'onions', 'garlic', 'potatoes', 'chicken', 'beef',
      'fish', 'salmon', 'yogurt', 'cereal', 'coffee', 'tea', 'sugar',
      'salt', 'pepper', 'oil', 'vinegar', 'flour', 'bananas', 'apples',
      'oranges', 'lettuce', 'carrots', 'cucumber', 'peppers', 'mushrooms',
    ];

    groceryKeywords.forEach((keyword) => {
      if (description.includes(keyword)) {
        items.add(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    });

    // Also add the full description if it's short (likely a single item)
    if (description.length < 30 && description.split(' ').length <= 3) {
      items.add(description.charAt(0).toUpperCase() + description.slice(1));
    }
  });

  return Array.from(items).slice(0, 20); // Return top 20 suggestions
};

// Get frequently purchased items (items that appear in multiple expenses)
export const getFrequentItems = async (
  householdId: string
): Promise<{ name: string; count: number }[]> => {
  const history = await getPurchaseHistory(householdId, 100);
  const itemCounts: { [key: string]: number } = {};

  history.forEach((item) => {
    itemCounts[item] = (itemCounts[item] || 0) + 1;
  });

  return Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 most frequent
};

