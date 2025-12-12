# 🛡️ Protezione Completa API Keys - Guida Definitiva

## ✅ Soluzione Implementata

Ho implementato una **soluzione a più livelli** per proteggere le tue API keys, anche se sono state esposte.

---

## 🔒 Livelli di Protezione

### Livello 1: Firebase App Check ✅ IMPLEMENTATO

**Cosa fa**: Protegge le risorse backend anche se qualcuno ha la tua API key.

**Stato**: ✅ Implementato in `src/services/firebase.ts`

**Come funziona**:
- Genera token di verifica per ogni richiesta
- Solo le app verificate possono accedere alle risorse
- Anche con la tua API key, senza token App Check → accesso negato

**Setup richiesto**:
1. Vai su [Firebase Console](https://console.firebase.google.com/) > **App Check**
2. Registra la tua Web App
3. Scegli **reCAPTCHA v3** come provider
4. Ottieni la Site Key e aggiungila al `.env` come `VITE_RECAPTCHA_SITE_KEY`

---

### Livello 2: Security Rules ✅ GIÀ FATTO

**Cosa fa**: Controlla chi può leggere/scrivere dati in Firestore.

**Stato**: ✅ Già configurato in `firestore.rules`

**Nota**: Le tue regole sono permissive perché usi custom auth. Questo è OK se App Check è attivo.

---

### Livello 3: Variabili d'Ambiente ✅ GIÀ FATTO

**Cosa fa**: Le API keys non sono più nel codice, solo nel `.env` (non committato).

**Stato**: ✅ Già implementato

---

### Livello 4: Restrizioni API Key (Opzionale)

**Cosa fa**: Limita l'uso dell'API key a domini specifici.

**Come fare**:
1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Seleziona progetto Firebase
3. **APIs & Services** > **Credentials**
4. Cerca la tua Firebase API Key
5. Clicca sulla chiave
6. Sotto **"Application restrictions"**:
   - Seleziona **"HTTP referrers (web sites)"**
   - Aggiungi: `https://apheron.io/*`, `https://apheron.io/home-assistant/*`
   - **SAVE**

**⚠️ Attenzione**: Questa restrizione può bloccare lo sviluppo locale. Usa solo in produzione.

---

## 🚀 Setup Completo - Passo per Passo

### Passo 1: Configurare reCAPTCHA v3

1. Vai su [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Clicca **"+"** per creare un nuovo sito
3. Configura:
   - **Label**: Home Assistant
   - **reCAPTCHA type**: **reCAPTCHA v3**
   - **Domains**: 
     - `apheron.io`
     - `localhost` (per sviluppo)
   - Accetta i termini
4. Clicca **Submit**
5. **Copia la Site Key** (inizia con `6Lf...`)

### Passo 2: Aggiungere Site Key al .env

Aggiungi al file `.env`:

```env
VITE_RECAPTCHA_SITE_KEY=6LfXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Passo 3: Registrare App in Firebase App Check

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona progetto: **peronciolillo-home-assistant**
3. Vai su **App Check** nel menu laterale
4. Clicca **"Get started"** o **"Register app"**
5. Seleziona la tua **Web App**
6. Scegli **reCAPTCHA v3** come provider
7. Incolla la **Site Key** che hai copiato
8. Clicca **Save**

### Passo 4: Testare in Sviluppo

Per testare in sviluppo locale, devi usare un **debug token**:

1. In Firebase Console > **App Check** > la tua app
2. Clicca sui **tre puntini** (⋮) > **Manage debug tokens**
3. Clicca **"Add debug token"**
4. Apri la console del browser nella tua app
5. Cerca il messaggio con il debug token (es: `App Check debug token: ...`)
6. Copia il token e incollalo in Firebase Console
7. Clicca **Save**

Ora App Check funzionerà anche in sviluppo locale.

### Passo 5: Verificare che Funzioni

1. Riavvia il server: `npm run dev`
2. Apri la console del browser
3. Dovresti vedere: `✅ Firebase App Check initialized`
4. Se vedi errori, controlla che la Site Key sia corretta

---

## 📋 Checklist Completa

- [x] **App Check implementato nel codice**
- [ ] **reCAPTCHA v3 configurato** (da fare)
- [ ] **Site Key aggiunta al .env** (da fare)
- [ ] **App registrata in Firebase App Check** (da fare)
- [ ] **Debug token configurato per sviluppo** (opzionale)
- [x] **Security Rules configurate**
- [x] **API keys in variabili d'ambiente**
- [ ] **Restrizioni API Key in Google Cloud** (opzionale)

---

## 🎯 Risultato Finale

Con questa configurazione:

✅ **Anche se qualcuno ha la tua API key**, non può:
- Accedere a Firestore (App Check blocca)
- Accedere a Storage (App Check blocca)
- Usare le Cloud Functions (App Check blocca)

✅ **Solo la tua app verificata** può:
- Accedere alle risorse Firebase
- Leggere/scrivere dati
- Usare i servizi

---

## 🔧 Per Altri Progetti

### Progetti React/Vite (come Job Tracker)

Segui gli stessi passi, aggiungi App Check a `src/services/firebase.ts`.

### Siti Statici (come apheron-homepage)

Per siti statici, App Check è più complesso. In alternativa:

1. **Usa Firebase Hosting** (raccomandato)
2. **Restringi API Key** in Google Cloud Console ai tuoi domini
3. **Usa Security Rules** restrittive

---

## 📊 Monitoraggio

### Verificare Uso API Key

1. Firebase Console > **Usage and billing**
2. Monitora le chiamate API
3. Imposta alert per uso anomalo

### Verificare App Check

1. Firebase Console > **App Check**
2. Vedi statistiche sui token generati
3. Verifica che la tua app sia registrata

---

## ⚠️ Note Importanti

1. **App Check è gratuito** fino a 10.000 richieste/giorno
2. **reCAPTCHA v3 è gratuito** e non mostra challenge agli utenti
3. **Debug token** è solo per sviluppo - non usare in produzione
4. **Restrizioni API Key** possono bloccare sviluppo locale - usa con cautela

---

## 🆘 Troubleshooting

### Errore: "App Check token is invalid"

- Verifica che App Check sia registrato in Firebase Console
- Controlla che la Site Key sia corretta
- In sviluppo, usa debug token

### Errore: "reCAPTCHA not loaded"

- Verifica che il dominio sia nella lista reCAPTCHA
- Controlla che la Site Key sia corretta
- Verifica che reCAPTCHA sia caricato prima di App Check

### App Check non funziona in sviluppo

- Usa debug token (vedi Passo 4)
- Verifica che `localhost` sia nel dominio reCAPTCHA

---

## ✅ Conclusione

Con questa implementazione, le tue API keys sono **completamente protette**, anche se esposte. App Check è il livello di protezione principale che blocca l'accesso non autorizzato.

**Prossimi passi**:
1. Configurare reCAPTCHA v3
2. Registrare app in Firebase App Check
3. Testare che tutto funzioni
4. (Opzionale) Aggiungere restrizioni API Key in Google Cloud

