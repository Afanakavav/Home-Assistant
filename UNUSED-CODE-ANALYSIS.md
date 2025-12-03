# 🗑️ Analisi Codice Non Utilizzato

## 📋 Codice da Verificare/Rimuovere

### 1. **Import Non Utilizzati**

#### `src/components/ExpenseChart.tsx`
```typescript
// ⚠️ DA VERIFICARE:
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
// - startOfMonth: usato?
// - endOfMonth: usato?
// - subMonths: usato in getMonthlyTrendData() ✓
```

#### `src/components/GlobalSearch.tsx`
```typescript
// ⚠️ DA VERIFICARE:
import { useState, useEffect, useRef } from 'react';
// - useRef: importato ma non sembra essere usato nel codice
```

#### `src/pages/Dashboard.tsx`
```typescript
// ⚠️ DA VERIFICARE:
// Verificare se tutti gli import MUI sono utilizzati
// Potrebbero esserci import non usati dopo le modifiche
```

### 2. **Funzioni Non Utilizzate**

#### `src/services/expenseService.ts`
```typescript
// ⚠️ DA VERIFICARE:
export const splitExpenseEqually = (
  amount: number,
  memberIds: string[]
): { [userId: string]: number } => {
  // Questa funzione è usata da qualche parte?
  // Cercare: splitExpenseEqually
}
```

#### `src/services/expenseService.ts`
```typescript
// ⚠️ DA VERIFICARE:
export const calculateTotalExpenses = (expenses: Expense[]): number => {
  // Usata in ExpensesPage ✓
  // Verificare se usata altrove
}
```

### 3. **Variabili Non Utilizzate**

#### `src/pages/Dashboard.tsx`
```typescript
// ❌ CODICE NON UTILIZZATO:
const taskCount: number = 0; // TODO: Get from tasks
const lowStockCount: number = 0; // TODO: Get from inventory
const upcomingBills: number = 0; // TODO: Get from expenses

// Queste variabili sono dichiarate ma sempre 0
// Usate solo in getEmotionalTemperature() che restituisce sempre messaggio generico
// ✅ AZIONE: Implementare o rimuovere
```

### 4. **Componenti Potenzialmente Non Utilizzati**

#### Service Workers
```typescript
// ⚠️ DA VERIFICARE:
// public/firebase-messaging-sw.js
// public/sw.js
// Entrambi sono necessari? O uno è duplicato?
```

### 5. **Console Statements da Rimuovere**

#### Produzione
```typescript
// ❌ RIMUOVERE IN PRODUZIONE (33+ occorrenze):

// src/main.tsx
console.log('Service Worker registered:', registration);
console.log('Service Worker registration failed:', error);

// Tutti i console.error dovrebbero essere wrappati o rimossi
// Mantenere solo in development mode
```

### 6. **Codice Commentato o Dead Code**

_No dead code or commented code found._

### 7. **Dipendenze Non Utilizzate**

#### `package.json`
```json
// ⚠️ DA VERIFICARE:
// Tutte le dipendenze sono utilizzate?
// Eseguire: npm install -g depcheck
// depcheck per trovare dipendenze non usate
```

---

## 🔍 Come Verificare

### 1. **Usare ESLint**
```bash
# Installare ESLint se non presente
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Eseguire
npx eslint src --ext .ts,.tsx
```

### 2. **Usare TypeScript Compiler**
```bash
# Verificare errori TypeScript
npm run build
# TS6133 = variabile dichiarata ma non usata
# TS6192 = import non usato
```

### 3. **Usare depcheck**
```bash
# Verificare dipendenze non usate
npm install -g depcheck
depcheck
```

### 4. **Usare unimport**
```bash
# Trova import non usati
npm install -D unimport
```

---

## ✅ Checklist Rimozione

- [ ] Rimuovere tutti i `console.log` in produzione
- [ ] Implementare o rimuovere TODO comments
- [ ] Verificare e rimuovere import non usati
- [ ] Verificare e rimuovere funzioni non usate
- [ ] Rimuovere variabili sempre a 0 (taskCount, lowStockCount, upcomingBills)
- [ ] Verificare service workers duplicati
- [ ] Eseguire depcheck per dipendenze
- [ ] Eseguire build e correggere tutti i warning TypeScript

---

## 📊 Impatto Rimozione

### Performance
- **Riduzione bundle size**: ~5-10KB (rimuovendo codice non usato)
- **Tempo di build**: Leggermente più veloce
- **Tree shaking**: Più efficace

### Manutenibilità
- **Codice più pulito**: Più facile da capire
- **Meno confusione**: Nessun codice "morto"
- **Build warnings**: Meno rumore

---

## 🚨 ATTENZIONE

**NON rimuovere**:
- Codice commentato che potrebbe essere utile in futuro
- Funzioni helper che potrebbero essere usate in futuro
- Import che potrebbero essere necessari per type definitions

**RIMUOVERE solo**:
- Codice chiaramente non utilizzato
- Console.log in produzione
- TODO che non verranno mai implementati
- Variabili sempre a 0 che non servono

---

**Nota**: Eseguire test completi dopo ogni rimozione per assicurarsi che nulla si rompa.

