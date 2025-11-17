# 🔧 Fix: Firestore Permissions & Indexes

## Problemi Risolti

### 1. ✅ Shopping List - "Missing or insufficient permissions"

**Causa**: Le Firestore rules per `shoppingLists` non gestivano correttamente la creazione di nuovi documenti.

**Soluzione**: Aggiornate le rules per distinguere tra:
- **Read**: Verifica membership nel household del documento esistente
- **Create**: Verifica membership nel household del documento da creare (`request.resource`)
- **Update/Delete**: Verifica membership nel household del documento esistente

### 2. ✅ Expenses - "The query requires an index"

**Causa**: La query usa `where('householdId')` + `orderBy('date')`, che richiede un indice composito.

**Soluzione**: Creati gli indici necessari in `firestore.indexes.json`:
- `householdId` (ASC) + `date` (DESC) - per query base
- `householdId` (ASC) + `date` (ASC) + `date` (DESC) - per query con range di date
- `householdId` (ASC) + `category` (ASC) + `date` (DESC) - per query filtrate per categoria

## Deploy Completato

Le rules e gli indici sono stati deployati con successo:
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Verifica

1. **Ricarica la pagina**: https://apheron.io/home-assistant/
2. **Vai al Dashboard**: Dovresti vedere la Shopping List senza errori
3. **Aggiungi un item**: Dovrebbe funzionare senza errori di permessi
4. **Aggiungi una spesa**: Dovrebbe funzionare senza errori di indice

## Note Sugli Altri Errori Console

Gli errori seguenti possono essere ignorati (non bloccano l'app):

- `ERR_BLOCKED_BY_CLIENT`: Causato da ad blocker o estensioni browser
- `Cross-Origin-Opener-Policy`: Warning di sicurezza, non critico
- `autocomplete attributes`: Suggerimento per accessibilità, non errore

## Se Ancora Non Funziona

1. **Pulisci la cache del browser** (Ctrl+Shift+Delete)
2. **Ricarica la pagina** (Ctrl+F5)
3. **Verifica che gli indici siano stati creati**:
   - Vai su [Firebase Console - Firestore Indexes](https://console.firebase.google.com/project/peronciolillo-home-assistant/firestore/indexes)
   - Verifica che gli indici per `expenses` siano in stato "Enabled"
   - Se sono in "Building", aspetta qualche minuto

## Prossimi Passi

Ora puoi:
- ✅ Usare la Shopping List senza errori
- ✅ Aggiungere spese senza errori di indice
- ✅ Testare tutte le funzionalità

