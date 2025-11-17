# 🎤 Come Testare Voice Input

## Prerequisiti

1. **Microfono accessibile**: Il browser deve avere permesso di accesso al microfono
2. **HTTPS o localhost**: I browser moderni richiedono HTTPS o localhost per l'accesso al microfono
3. **API Key configurata**: Assicurati che `VITE_GOOGLE_SPEECH_API_KEY` sia nel file `.env`

## Passi per Testare

### 1. Avvia l'applicazione

```bash
cd peronciolillo-home-assistant
npm run dev
```

### 2. Accedi all'app

1. Vai su `http://localhost:5173`
2. Fai login o registrati
3. Crea o unisciti a un household

### 3. Testa Voice Input

1. **Vai al Dashboard** (home page)
2. **Clicca "Add Expense"** (pulsante in alto a destra o FAB mobile)
3. **Clicca "Start Voice Input"** (pulsante con icona microfono)
4. **Permetti accesso al microfono** quando il browser lo richiede
5. **Parla chiaramente**, esempio:
   - "Spent 25 euros on groceries"
   - "Paid 15 for transport"
   - "25 euros groceries"
6. **Clicca "Stop Recording"** quando hai finito
7. **Attendi il processing** (vedrai "Processing...")
8. **Verifica il risultato**:
   - Il testo riconosciuto apparirà in un alert blu
   - Amount, category e description dovrebbero essere auto-compilati
   - Se tutto è corretto, clicca "Add Expense"

## Esempi di Frasi da Testare

### ✅ Frasi che funzionano bene:

- "Spent 25 euros on groceries"
- "Paid 15 for transport"
- "25 euros groceries"
- "Spent 30 on bills"
- "20 euros home"

### ⚠️ Frasi che potrebbero non funzionare:

- Frasi troppo lunghe o complesse
- Parole non riconosciute (nomi propri, brand stranieri)
- Rumore di fondo eccessivo

## Troubleshooting

### ❌ "Microphone access denied"

**Soluzione:**
1. Controlla le impostazioni del browser per i permessi del microfono
2. Assicurati di aver cliccato "Allow" quando richiesto
3. Su Chrome: Settings → Privacy → Site Settings → Microphone → Allow

### ❌ "Speech recognition failed"

**Possibili cause:**
1. API Key non configurata o errata
2. Connessione internet lenta
3. Microfono non funzionante

**Soluzione:**
1. Verifica che `.env` contenga `VITE_GOOGLE_SPEECH_API_KEY`
2. Riavvia il server dev (`npm run dev`)
3. Controlla la console del browser per errori dettagliati

### ❌ "No speech detected"

**Possibili cause:**
1. Non hai parlato abbastanza forte
2. Microfono spento o non connesso
3. Recording troppo breve

**Soluzione:**
1. Parla più forte e chiaramente
2. Verifica che il microfono funzioni
3. Registra per almeno 2-3 secondi

### ❌ Parsing non funziona (amount/category non rilevati)

**Soluzione:**
1. Usa frasi più semplici (vedi esempi sopra)
2. Includi sempre l'amount (numero)
3. Includi una parola chiave per la categoria (groceries, transport, bills, home)

## Fallback: Web Speech API Nativo

Se Google Speech API fallisce, l'app usa automaticamente il Web Speech API nativo del browser.

**Limitazioni:**
- Funziona solo su Chrome/Edge (non Firefox)
- Meno accurato di Google Speech API
- Richiede connessione internet

## Test Manuale (senza voice)

Puoi sempre usare l'input manuale:
1. Clicca "Add Expense"
2. Compila manualmente:
   - Amount (es. 25)
   - Category (dropdown)
   - Description (es. "Groceries at supermarket")
3. Clicca "Add Expense"

## Suggerimenti per Migliori Risultati

1. **Parla chiaramente** e a velocità normale
2. **Usa frasi semplici** con struttura: "Spent [amount] on [category]"
3. **Evita rumore di fondo**
4. **Parla in inglese** per migliori risultati (supporta anche italiano ma meno accurato)
5. **Testa in ambiente silenzioso** per la prima volta

## Verifica API Key

Per verificare che l'API key funzioni:

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Seleziona il progetto Firebase
3. Vai a **APIs & Services** → **Credentials**
4. Verifica che l'API key sia attiva e abbia "Cloud Speech-to-Text API" abilitata

## Next Steps

Dopo aver testato con successo:
- Prova con frasi più complesse
- Testa su mobile (se PWA è configurata)
- Verifica che le spese vengano salvate correttamente nel database

