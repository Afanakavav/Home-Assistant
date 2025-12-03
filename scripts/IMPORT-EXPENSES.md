# Import Spese - Istruzioni

## Passo 1: Aggiungi la categoria "Eating Out"
✅ **FATTO** - La categoria è già stata aggiunta al codice.

## Passo 2: Deploy delle modifiche
Esegui il deploy per aggiornare il sito con la nuova categoria.

## Passo 3: Importa le spese

### Metodo 1: Console del Browser (Raccomandato)

1. Vai su **https://apheron.io/home-assistant/expenses**
2. Assicurati di essere loggato
3. Apri la **Console del Browser** (F12 → Console)
4. Copia e incolla questo script:

```javascript
// Dati delle spese
const expensesData = `Amount,Category,Date,Description
11.90,Eating Out,2025-09-20,Valentino
15.65,Eating Out,2025-09-21,Valentino buona domenica
8.65,Eating Out,2025-09-22,Caffe provato Grand Canal
11.65,groceries,2025-09-22,SuperValue
8.73,groceries,2025-09-22,Tesco
5.00,groceries,2025-09-27,Preparazione per Rosh Ashanah
8.90,Eating Out,2025-09-28,Valentino
30.00,groceries,2025-09-28,Kimchi & Co
20.00,Eating Out,2025-09-28,Mani
43.95,Eating Out,2025-09-29,Sushi del lunedì
26.64,groceries,2025-09-29,Fresh
11.60,Eating Out,2025-10-02,Birre Camera di Commercio
39.00,Eating Out,2025-10-02,Pizza paulies
7.45,Eating Out,2025-10-04,Valentino
9.15,groceries,2025-10-04,Spesa organica
9.75,groceries,2025-10-04,Spesa mercato bio
14.10,Eating Out,2025-10-11,Valentino
5.20,transport,2025-10-11,Train ticket Howth
72.50,Eating Out,2025-10-11,Pranzo Howth
93.50,Eating Out,2025-10-17,Chinese ka shing
49.70,Eating Out,2025-10-18,Bibi's brunch
4.99,home,2025-10-18,Centz cose per casa
38.00,Eating Out,2025-10-19,Pizza della domenica sera
35.40,Eating Out,2025-10-21,Burritos
46.75,Eating Out,2025-10-24,Yoi Izakaya
4.80,transport,2025-10-25,Taxi
81.40,Eating Out,2025-10-25,Sfuso
50.00,extra,2025-10-31,Regalo Silvia & Emanuele
17.00,extra,2025-10-31,Regalo Ottavia
15.05,Eating Out,2025-11-01,Breakfast valentino
38.00,Eating Out,2025-11-01,Pizza Sano
38.00,Eating Out,2025-11-05,Wonton
3.75,Eating Out,2025-11-06,Caffee valentino
8.70,Eating Out,2025-11-09,Caffe Avoca
42.00,Eating Out,2025-11-10,Pizza Mckenzie
8.00,extra,2025-11-28,Regali vari
44.00,groceries,2025-11-30,Noci e compagnia
31.40,transport,2025-12-02,Taxi
40.40,groceries,2025-09-17,SPAR Food & Fuel
79.54,groceries,2025-09-18,Dunnes Stores
11.95,groceries,2025-09-19,Fresh The Good Food Market
8.73,groceries,2025-09-21,Tesco
5.05,groceries,2025-09-23,Tesco
61.14,groceries,2025-09-26,SPAR Food & Fuel
17.90,groceries,2025-10-05,Fresh The Good Food Market
21.85,groceries,2025-10-06,Asia Market
50.00,bills,2025-10-08,Pinergy
25.27,groceries,2025-10-09,SPAR Food & Fuel
23.74,groceries,2025-10-12,SPAR Food & Fuel
121.90,groceries,2025-10-14,Dunnes Stores
14.72,groceries,2025-10-18,Dunnes Stores
15.21,groceries,2025-10-20,SPAR Food & Fuel
34.75,groceries,2025-10-28,Fresh The Good Food Market
50.00,bills,2025-10-29,Pinergy
37.08,groceries,2025-10-29,SPAR Food & Fuel
10.00,groceries,2025-10-30,Fresh The Good Food Market
38.00,groceries,2025-11-05,Asia Market
16.25,groceries,2025-11-06,Fresh The Good Food Market
61.22,groceries,2025-11-06,SPAR Food & Fuel
2.55,groceries,2025-11-07,SPAR Food & Fuel
67.59,bills,2025-11-11,Kaizen Energy
60.65,groceries,2025-11-13,SPAR Food & Fuel
15.95,groceries,2025-11-13,SPAR Food & Fuel
50.00,bills,2025-11-19,Pinergy
41.88,groceries,2025-12-02,SPAR Food & Fuel`;

// Funzione per parsare il CSV
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Parse CSV handling commas in descriptions
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      if (header === 'Amount') {
        row.amount = parseFloat(value);
      } else if (header === 'Category') {
        // Convert "Eating Out" to "eating-out"
        row.category = value.toLowerCase().replace(/\s+/g, '-');
      } else if (header === 'Date') {
        row.date = value;
      } else if (header === 'Description') {
        row.description = value;
      }
    });
    
    if (row.amount && row.category && row.date && row.description) {
      data.push(row);
    }
  }
  
  return data;
}

// Esegui l'import
console.log('🚀 Starting expense import...');
const expenses = parseCSV(expensesData);
console.log(`📊 Parsed ${expenses.length} expenses`);

// Verifica che la funzione sia disponibile
if (typeof window.importExpensesBulk === 'function') {
  console.log('✅ Import function found, starting import...');
  window.importExpensesBulk(expenses).then(result => {
    console.log(`✅ Import completed! Success: ${result.success}, Errors: ${result.errors}`);
  });
} else {
  console.error('❌ Import function not found. Make sure you are on the Expenses page and logged in.');
  console.log('📋 Parsed expenses:', expenses);
}
```

5. Premi **Invio**
6. Lo script importerà tutte le spese automaticamente
7. Vedrai un messaggio di successo quando completato

### Note:
- Lo script divide automaticamente le spese equamente tra tutti i membri della household
- Le spese vengono create con te come pagatore
- C'è un piccolo delay tra ogni spesa per evitare rate limiting
- Dopo l'import, la lista delle spese si aggiornerà automaticamente

## Rimozione della funzione temporanea

Dopo aver importato le spese, la funzione `importExpensesBulk` può essere rimossa dal codice per sicurezza.

