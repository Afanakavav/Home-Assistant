# Guida: Rotazione Chiavi API Esposte

## ⚠️ IMPORTANTE: Chiavi da Ruotare

Le seguenti chiavi API sono state esposte nel repository GitHub e devono essere ruotate immediatamente:

1. **Firebase API Key**: `AIzaSyB5VI0cWCHsLEju4UfxvSolbMgUEQ0CEso`
2. **Google Speech-to-Text API Key**: `AIzaSyAhQaKnqzFyaQ8cpd2AyqZ7cXKZnHLCDP8`

---

## 🔄 Passo 1: Ruotare Firebase API Key

### Opzione A: Creare una nuova Web App (Consigliato)

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona il progetto: **peronciolillo-home-assistant**
3. Vai su **⚙️ Project Settings** > **Your apps**
4. Nella sezione "Your apps", clicca su **Add app** > **Web** (`</>`)
5. Registra una nuova app:
   - App nickname: **Home Assistant (New)**
   - NON spuntare "Also set up Firebase Hosting"
   - Clicca **Register app**
6. **Copia la nuova configurazione Firebase** - avrai una nuova `apiKey`
7. Aggiorna il file `.env` locale con la nuova `VITE_FIREBASE_API_KEY`
8. **IMPORTANTE**: Non committare il file `.env`!

### Opzione B: Revocare e Rigenerare (Se disponibile)

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Seleziona il progetto: **peronciolillo-home-assistant**
3. Vai su **APIs & Services** > **Credentials**
4. Cerca la chiave API Firebase (potrebbe non essere direttamente visibile)
5. Se disponibile, clicca sulla chiave e poi **Delete** o **Restrict**

**Nota**: Le Firebase API Keys sono progettate per essere pubbliche, ma devono essere protette con:
- Firebase Security Rules corrette
- Firebase App Check abilitato
- Restrizioni di dominio (se possibile)

---

## 🔄 Passo 2: Ruotare Google Speech-to-Text API Key

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Seleziona il progetto: **peronciolillo-home-assistant** (o il progetto associato)
3. Vai su **APIs & Services** > **Credentials**
4. Cerca la chiave API: `AIzaSyAhQaKnqzFyaQ8cpd2AyqZ7cXKZnHLCDP8`
5. Clicca sulla chiave per aprirla
6. **Opzione A - Revocare la chiave esistente:**
   - Clicca su **DELETE** (in alto a destra)
   - Conferma l'eliminazione
7. **Opzione B - Restringere la chiave (se vuoi mantenerla temporaneamente):**
   - Sotto "API restrictions", seleziona **Restrict key**
   - Seleziona solo **Cloud Speech-to-Text API**
   - Sotto "Application restrictions", aggiungi i tuoi domini:
     - `https://apheron.io/*`
     - `https://apheron.io/home-assistant/*`
   - Clicca **SAVE**

### Creare una Nuova Chiave API

1. In **APIs & Services** > **Credentials**, clicca **+ CREATE CREDENTIALS** > **API Key**
2. La nuova chiave verrà generata automaticamente
3. **IMPORTANTE**: Configura immediatamente le restrizioni:
   - Clicca sulla nuova chiave
   - Sotto "API restrictions":
     - Seleziona **Restrict key**
     - Seleziona solo **Cloud Speech-to-Text API**
   - Sotto "Application restrictions":
     - Seleziona **HTTP referrers (web sites)**
     - Aggiungi i tuoi domini:
       - `https://apheron.io/*`
       - `https://apheron.io/home-assistant/*`
   - Clicca **SAVE**
4. **Copia la nuova chiave API**
5. Aggiorna il file `.env` locale con la nuova `VITE_GOOGLE_SPEECH_API_KEY`

---

## 🔄 Passo 3: Aggiornare l'Applicazione

1. Apri il file `.env` nella root del progetto `home-assistant`
2. Aggiorna le chiavi:
   ```env
   VITE_FIREBASE_API_KEY=nuova-firebase-api-key
   VITE_GOOGLE_SPEECH_API_KEY=nuova-google-speech-api-key
   ```
3. **Salva il file** (non committarlo!)
4. Riavvia il server di sviluppo:
   ```bash
   npm run dev
   ```
5. Testa l'applicazione per verificare che tutto funzioni

---

## 🔄 Passo 4: Aggiornare il Deploy

1. Se usi Firebase Hosting, aggiorna le variabili d'ambiente:
   ```bash
   firebase functions:config:set \
     firebase.api_key="nuova-firebase-api-key" \
     google.speech_api_key="nuova-google-speech-api-key"
   ```
2. Oppure, se usi un altro sistema di deploy, aggiorna le variabili d'ambiente nel pannello di controllo
3. Ricompila e ridistribuisci:
   ```bash
   npm run build
   ./deploy.ps1
   ```

---

## ✅ Passo 5: Verificare la Rotazione

1. Verifica che l'applicazione funzioni correttamente
2. Controlla i log in Firebase Console per eventuali errori
3. Verifica su GitHub che gli alert di sicurezza siano risolti (potrebbe richiedere qualche minuto)

---

## 🛡️ Best Practices per il Futuro

1. **Mai committare file `.env`** - è già nel `.gitignore`
2. **Usa sempre `.env.example`** per documentare le variabili necessarie
3. **Restringi sempre le chiavi API** quando possibile
4. **Abilita Firebase App Check** per protezione aggiuntiva
5. **Monitora l'uso delle API** in Google Cloud Console
6. **Ruota le chiavi periodicamente** (ogni 6-12 mesi)

---

## 📞 Supporto

Se hai problemi durante la rotazione:
1. Controlla i log in Firebase Console
2. Verifica le restrizioni delle chiavi API in Google Cloud Console
3. Assicurati che le variabili d'ambiente siano configurate correttamente

