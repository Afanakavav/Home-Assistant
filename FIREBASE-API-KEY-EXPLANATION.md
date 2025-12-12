# 🔑 Perché Firebase riusa la stessa API Key?

## ⚠️ Comportamento Normale di Firebase

**Tutte le Web App nello stesso progetto Firebase condividono la stessa API Key.**

Questo è un comportamento **normale e intenzionale** di Firebase. L'API Key è legata al **progetto Firebase**, non alla singola app.

### Perché Firebase fa così?

1. **L'API Key è pubblica per design**: Firebase API Keys sono progettate per essere esposte nel codice client-side
2. **Sicurezza tramite Security Rules**: La sicurezza non dipende dalla segretezza dell'API Key, ma dalle **Firestore Security Rules** e **Firebase App Check**
3. **Semplificazione**: Una sola chiave per progetto semplifica la gestione

---

## 🔄 Come Ottenere una Nuova API Key Diversa?

### Opzione 1: Creare un Nuovo Progetto Firebase (Consigliato per Rotazione)

Se vuoi una API Key completamente nuova, devi creare un **nuovo progetto Firebase**, non una nuova app nello stesso progetto.

**Passi:**

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Clicca **"Add project"** o **"Create a project"**
3. Crea un nuovo progetto con un nome diverso (es: `peronciolillo-home-assistant-v2`)
4. La nuova app avrà una **API Key completamente diversa**

**⚠️ IMPORTANTE**: Questo richiede di:
- Migrare i dati da Firestore
- Migrare gli utenti
- Aggiornare tutte le configurazioni
- È un processo complesso

---

### Opzione 2: Revocare e Rigenerare (Non Disponibile)

Firebase **non permette** di revocare o rigenerare manualmente l'API Key di un progetto esistente. L'API Key è permanente per il progetto.

---

### Opzione 3: Proteggere la Chiave Esistente (Consigliato)

Invece di cambiare la chiave, **proteggila meglio**:

#### 1. Abilita Firebase App Check

Firebase App Check protegge le tue risorse backend da traffico non autorizzato.

**Passi:**
1. Vai su Firebase Console > **App Check**
2. Seleziona la tua Web App
3. Abilita **reCAPTCHA v3** o **reCAPTCHA Enterprise**
4. Configura le restrizioni

#### 2. Verifica le Firestore Security Rules

Assicurati che le regole siano restrittive:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo utenti autenticati possono accedere
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 3. Restringi l'API Key in Google Cloud Console (Opzionale)

Anche se l'API Key è pubblica, puoi restringerla:

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Seleziona il progetto Firebase
3. Vai su **APIs & Services** > **Credentials**
4. Cerca la tua Firebase API Key
5. Clicca sulla chiave
6. Sotto **"Application restrictions"**:
   - Seleziona **"HTTP referrers (web sites)"**
   - Aggiungi i tuoi domini:
     - `https://apheron.io/*`
     - `https://apheron.io/home-assistant/*`
   - Clicca **SAVE**

**Nota**: Questa restrizione può causare problemi in sviluppo locale. Usa con cautela.

---

## ✅ Soluzione per la Rotazione

### Scenario: La tua API Key è stata esposta su GitHub

**Opzione A: Creare Nuovo Progetto (Complesso)**
- ✅ API Key completamente nuova
- ❌ Richiede migrazione completa dei dati
- ❌ Richiede migrazione utenti
- ❌ Tempo: 2-4 ore

**Opzione B: Proteggere Chiave Esistente (Consigliato)**
- ✅ Nessuna migrazione necessaria
- ✅ Protezione immediata
- ✅ Firebase App Check + Security Rules
- ✅ Tempo: 30 minuti

---

## 🛡️ Best Practice: Protezione API Key Esposta

Se la tua API Key è stata esposta (come nel tuo caso), ecco cosa fare:

### 1. Abilita Firebase App Check (PRIORITÀ ALTA)

```bash
# Installa Firebase App Check
npm install firebase
```

Poi nel tuo codice:

```javascript
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('your-recaptcha-site-key'),
  isTokenAutoRefreshEnabled: true
});
```

### 2. Verifica Security Rules

Assicurati che le regole Firestore siano restrittive e non permettano accesso non autorizzato.

### 3. Monitora l'Uso

1. Vai su Firebase Console > **Usage and billing**
2. Monitora l'uso delle API
3. Imposta alert per uso anomalo

### 4. Restringi in Google Cloud (Opzionale)

Come descritto sopra, restringi l'API Key ai tuoi domini.

---

## 📝 Riepilogo

| Domanda | Risposta |
|---------|----------|
| **Perché la stessa API Key?** | È normale - tutte le app nello stesso progetto condividono la chiave |
| **Come ottenere chiave diversa?** | Creare nuovo progetto Firebase (richiede migrazione) |
| **Devo cambiare progetto?** | No, è meglio proteggere la chiave esistente |
| **Cosa fare se esposta?** | Abilita App Check + verifica Security Rules + monitora uso |

---

## 🎯 Raccomandazione Finale

**Non creare un nuovo progetto.** Invece:

1. ✅ **Abilita Firebase App Check** (protezione principale)
2. ✅ **Verifica Security Rules** (già fatto)
3. ✅ **Monitora l'uso** in Firebase Console
4. ✅ **Considera restrizioni** in Google Cloud Console (opzionale)

La tua API Key è già stata rimossa dal codice e ora è nel `.env` (non committato). Con App Check abilitato, anche se qualcuno ha la chiave, non potrà accedere alle tue risorse.

---

## 🔗 Risorse

- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Restricting API Keys](https://cloud.google.com/docs/authentication/api-keys#restricting_keys)

