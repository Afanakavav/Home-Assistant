# Gestione Vecchia Web App Firebase

## Domanda: Cosa fare della vecchia Web App?

### ✅ Risposta: **Puoi lasciarla, ma è meglio disabilitarla**

La vecchia Web App Firebase **non deve essere cancellata immediatamente**, ma è consigliabile **disabilitarla** per sicurezza.

### Perché non cancellarla subito?

1. **Periodo di transizione**: Mantieni la vecchia app attiva per alcuni giorni per assicurarti che la nuova funzioni correttamente
2. **Rollback**: Se ci sono problemi, puoi tornare rapidamente alla vecchia configurazione
3. **Dati esistenti**: La vecchia app potrebbe avere dati o configurazioni associate

### Cosa fare:

#### Opzione 1: Disabilitare la vecchia app (Consigliato)

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona il progetto: **peronciolillo-home-assistant**
3. Vai su **⚙️ Project Settings** > **Your apps**
4. Trova la vecchia Web App (quella con l'App ID vecchio)
5. Clicca sui **tre puntini** (⋮) accanto all'app
6. Seleziona **Disable app** o **Delete app** (se sei sicuro)

**Nota**: Se non vedi l'opzione "Disable", puoi semplicemente non usarla più. Firebase non carica alcun costo per app inattive.

#### Opzione 2: Lasciarla attiva (Temporaneo)

- Lasciala attiva per **7-14 giorni** per sicurezza
- Dopo aver verificato che tutto funziona con la nuova app, puoi disabilitarla o cancellarla

### Quando cancellarla definitivamente?

✅ **Puoi cancellarla quando:**
- Hai verificato che la nuova app funziona correttamente (almeno 1 settimana)
- Non ci sono più riferimenti alla vecchia `apiKey` nel codice
- Hai fatto il deploy e testato in produzione

### Vecchia Configurazione (per riferimento):

```javascript
// VECCHIA - Non usare più
apiKey: "AIzaSyB5VI0cWCHsLEju4UfxvSolbMgUEQ0CEso" // Vecchia chiave esposta
appId: "1:505439281340:web:e39a71d8fa10fc9a1530b9" // Vecchio App ID
```

### Nuova Configurazione (attuale):

```javascript
// NUOVA - In uso ora
apiKey: "AIzaSyB5VI0cWCHsLEju4UfxvSolbMgUEQ0CEso" // Nuova chiave (da .env)
appId: "1:505439281340:web:38da0dcd2a49764e1530b9" // Nuovo App ID
```

### ⚠️ IMPORTANTE

**Nota**: Vedo che la nuova `apiKey` sembra essere la stessa della vecchia. Questo potrebbe significare:

1. **Hai copiato la vecchia per errore** - In questo caso, crea una nuova app e usa quella
2. **Firebase ha riutilizzato la chiave** - Raro ma possibile

**Verifica**: Controlla che la nuova `apiKey` sia effettivamente diversa dalla vecchia. Se sono uguali, la vecchia chiave è ancora esposta e dovresti creare un'altra nuova app.

### Verifica della Nuova App

Per verificare che stai usando la nuova app:

1. Controlla il file `.env` - deve avere il nuovo `VITE_FIREBASE_APP_ID`
2. Riavvia il server di sviluppo: `npm run dev`
3. Controlla la console del browser - non dovrebbero esserci errori
4. Verifica che l'autenticazione funzioni correttamente

---

## Riepilogo Azioni

- [x] Creata nuova Web App in Firebase
- [x] Aggiornato file `.env` con nuova configurazione
- [ ] **DA FARE**: Verificare che la nuova app funzioni
- [ ] **DA FARE**: Dopo 1 settimana, disabilitare/cancellare vecchia app
- [ ] **DA FARE**: Verificare che la nuova `apiKey` sia diversa dalla vecchia

