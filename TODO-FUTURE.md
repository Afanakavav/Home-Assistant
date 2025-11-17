# 🚀 Funzionalità Future - Peronciolillo Home Assistant

Questo documento contiene le funzionalità da implementare in futuro, come richiesto dall'utente.

## Priorità Alta

### 1. Dialog per Aggiungere Spese Ricorrenti
**Stato attuale:** Le spese ricorrenti sono solo visualizzate in ExpensesPage, ma non c'è modo di crearle dall'UI.

**Da implementare:**
- Creare componente `RecurringExpenseAdd.tsx` (simile a `ExpenseQuickAdd.tsx`)
- Aggiungere dialog in ExpensesPage con pulsante "Aggiungi Spesa Ricorrente"
- Permettere di configurare:
  - Titolo (es. "Affitto", "Bolletta Enel")
  - Importo
  - Categoria
  - Frequenza (mensile/settimanale/annuale)
  - Giorno del mese/settimana
  - Auto-creazione spesa quando scade
  - Utente predefinito che paga

**File da creare/modificare:**
- `src/components/RecurringExpenseAdd.tsx` (nuovo)
- `src/pages/ExpensesPage.tsx` (aggiungere dialog)

---

### 2. Collegamento Inventory → Shopping List
**Stato attuale:** Inventory e Shopping List sono separati.

**Da implementare:**
- Quando un prodotto in Inventory passa a stato "low" o "out", aggiungerlo automaticamente alla Shopping List
- Aggiungere pulsante "Aggiungi alla lista spesa" nella pagina Inventory per prodotti in esaurimento
- Opzione per sincronizzare automaticamente (toggle nelle impostazioni)

**File da modificare:**
- `src/pages/InventoryPage.tsx` (aggiungere logica di sincronizzazione)
- `src/services/inventoryService.ts` (aggiungere funzione `addToShoppingList`)
- `src/services/shoppingListService.ts` (usare funzione esistente)

---

### 3. Collegamento Tasks → Inventory
**Stato attuale:** Tasks e Inventory sono separati.

**Da implementare:**
- Quando si completa un task, se il task ha prodotti collegati (`linkedToTasks` in InventoryItem), decrementare la quantità
- Aggiungere campo "prodotti necessari" nei task (lista di InventoryItem IDs)
- Quando si completa un task con prodotti, aggiornare automaticamente l'inventory
- Mostrare notifica se un prodotto finisce dopo il completamento del task

**File da modificare:**
- `src/types/index.ts` (aggiungere `requiredProducts?: string[]` a Task)
- `src/components/TaskQuickAdd.tsx` (aggiungere selezione prodotti)
- `src/pages/TasksPage.tsx` (logica di consumo prodotti al completamento)
- `src/services/taskService.ts` (logica di aggiornamento inventory)

---

### 4. Notifiche Push per Piante e Manutenzioni
**Stato attuale:** Nessuna notifica push implementata.

**Da implementare:**
- Integrare Firebase Cloud Messaging (FCM)
- Notifiche per piante da annaffiare (24 ore prima e il giorno stesso)
- Notifiche per manutenzioni in arrivo (7 giorni prima, 1 giorno prima)
- Permessi utente per notifiche
- Settings per abilitare/disabilitare notifiche per tipo

**File da creare/modificare:**
- `src/services/notificationService.ts` (nuovo - gestione FCM)
- `src/contexts/NotificationContext.tsx` (estendere con push notifications)
- `src/pages/PlantsPage.tsx` (integrare notifiche)
- `src/pages/VendorsPage.tsx` (integrare notifiche)
- `public/firebase-messaging-sw.js` (service worker per FCM)

**Note:**
- Richiede configurazione Firebase Cloud Messaging
- Richiede permessi browser per notifiche
- Funziona solo su HTTPS (o localhost per sviluppo)

---

## Note di Implementazione

### Ordine Consigliato
1. **Dialog Spese Ricorrenti** - Più semplice, migliora subito l'UX
2. **Inventory → Shopping List** - Logica diretta, alto valore
3. **Tasks → Inventory** - Richiede modifiche ai types, più complesso
4. **Notifiche Push** - Richiede setup FCM, più complesso ma alto valore

### Considerazioni Tecniche
- Per le notifiche push, considerare anche notifiche email come fallback
- Per Inventory → Shopping List, evitare duplicati nella lista
- Per Tasks → Inventory, gestire casi edge (prodotto finito durante task)

---

**Ultimo aggiornamento:** 2024-12-19
**Creato da:** AI Assistant su richiesta utente

