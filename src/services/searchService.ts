import { getExpenses } from './expenseService';
import { getTasks } from './taskService';
import { getInventoryItems } from './inventoryService';
import { getPlants } from './plantService';
import { getVendors } from './vendorService';
import { getShoppingList } from './shoppingListService';
import { logger } from '../utils/logger';

export interface SearchResult {
  type: 'expense' | 'task' | 'inventory' | 'plant' | 'vendor' | 'shopping';
  id: string;
  title: string;
  description?: string;
  url: string;
  metadata?: Record<string, any>;
}

export const searchAll = async (
  householdId: string,
  query: string
): Promise<SearchResult[]> => {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  try {
    // Search expenses
    const expenses = await getExpenses(householdId, { limitCount: 100 });
    expenses.forEach((expense) => {
      const matchesDescription = expense.description.toLowerCase().includes(searchTerm);
      const matchesCategory = expense.category.toLowerCase().includes(searchTerm);
      const matchesAmount = expense.amount.toString().includes(searchTerm);

      if (matchesDescription || matchesCategory || matchesAmount) {
        results.push({
          type: 'expense',
          id: expense.id,
          title: expense.description,
          description: `€${expense.amount.toFixed(2)} - ${expense.category}`,
          url: '/expenses',
          metadata: { expense },
        });
      }
    });

    // Search tasks
    const tasks = await getTasks(householdId);
    tasks.forEach((task) => {
      const matchesTitle = task.title.toLowerCase().includes(searchTerm);
      const matchesDescription = task.description?.toLowerCase().includes(searchTerm) || false;
      const matchesRoom = task.room.toLowerCase().includes(searchTerm);

      if (matchesTitle || matchesDescription || matchesRoom) {
        results.push({
          type: 'task',
          id: task.id,
          title: task.title,
          description: task.description || `${task.room} - ${task.frequency}`,
          url: '/tasks',
          metadata: { task },
        });
      }
    });

    // Search inventory
    const inventoryItems = await getInventoryItems(householdId);
    inventoryItems.forEach((item) => {
      const matchesName = item.name.toLowerCase().includes(searchTerm);
      const matchesCategory = item.category.toLowerCase().includes(searchTerm);
      const matchesStatus = item.status.toLowerCase().includes(searchTerm);

      if (matchesName || matchesCategory || matchesStatus) {
        results.push({
          type: 'inventory',
          id: item.id,
          title: item.name,
          description: `${item.category} - ${item.status}`,
          url: '/inventory',
          metadata: { item },
        });
      }
    });

    // Search plants
    const plants = await getPlants(householdId);
    plants.forEach((plant) => {
      const matchesName = plant.name.toLowerCase().includes(searchTerm);
      const matchesLocation = plant.location.toLowerCase().includes(searchTerm);

      if (matchesName || matchesLocation) {
        results.push({
          type: 'plant',
          id: plant.id,
          title: plant.name,
          description: plant.location,
          url: '/plants',
          metadata: { plant },
        });
      }
    });

    // Search vendors
    const vendors = await getVendors(householdId);
    vendors.forEach((vendor) => {
      const matchesName = vendor.name.toLowerCase().includes(searchTerm);
      const matchesType = vendor.type.toLowerCase().includes(searchTerm);

      if (matchesName || matchesType) {
        results.push({
          type: 'vendor',
          id: vendor.id,
          title: vendor.name,
          description: vendor.type,
          url: '/vendors',
          metadata: { vendor },
        });
      }
    });

    // Search shopping list
    const shoppingList = await getShoppingList(householdId);
    if (shoppingList) {
      shoppingList.items.forEach((item) => {
        const matchesName = item.name.toLowerCase().includes(searchTerm);

        if (matchesName) {
          results.push({
            type: 'shopping',
            id: item.id,
            title: item.name,
            description: item.checked ? 'Completato' : 'Da comprare',
            url: '/shopping-list',
            metadata: { item },
          });
        }
      });
    }
  } catch (error) {
    logger.error('Error searching:', error);
  }

  // Sort by relevance (exact matches first, then partial)
  return results.sort((a, b) => {
    const aExact = a.title.toLowerCase() === searchTerm;
    const bExact = b.title.toLowerCase() === searchTerm;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return a.title.localeCompare(b.title);
  });
};

