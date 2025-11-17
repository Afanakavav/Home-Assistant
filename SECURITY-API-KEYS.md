# 🔒 Guida alla Sicurezza delle Chiavi API

Questa guida spiega come risolvere l'avviso di sicurezza ricevuto da Google Cloud Platform riguardo alle chiavi API accessibili pubblicamente.

## ⚠️ Problema

Google Cloud Platform ha rilevato che le tue chiavi API sono accessibili pubblicamente. Questo può portare a:
- Uso non autorizzato delle tue chiavi API
- Costi inattesi sulla tua fattura Google Cloud
- Violazioni di sicurezza

## ✅ Soluzione: Limitare le Chiavi API

### Passo 1: Accedi a Google Cloud Console

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Seleziona il progetto: **peronciolillo-home-assistant** (o il nome del tuo progetto)
3. Vai su **APIs & Services** > **Credentials**

### Passo 2: Limita la Chiave API di Google Speech-to-Text

1. Trova la chiave API che usi per Google Speech-to-Text (es: `VITE_GOOGLE_SPEECH_API_KEY`)
2. Clicca sul nome della chiave per aprirla
3. Nella sezione **API restrictions**:
   - Seleziona **Restrict key**
   - Seleziona solo **Cloud Speech-to-Text API**
   - Clicca **Save**

4. Nella sezione **Application restrictions**:
   - Seleziona **HTTP referrers (web sites)**
   - Aggiungi i tuoi domini:
     ```
     https://apheron.io/*
     https://apheron.io/peronciolillo-home-assistant/*
     ```
   - Se stai testando in locale, puoi aggiungere anche:
     ```
     http://localhost:*
     http://127.0.0.1:*
     ```
   - Clicca **Save**

### Passo 3: Verifica le Restrizioni

Dopo aver salvato, la chiave API sarà limitata a:
- ✅ Solo l'API Cloud Speech-to-Text
- ✅ Solo richieste provenienti dai domini specificati

### Passo 4: Testa l'Applicazione

1. Ricarica l'applicazione
2. Prova la funzionalità di riconoscimento vocale
3. Se funziona, le restrizioni sono configurate correttamente

## 🔐 Note Importanti

### Firebase API Keys

Le chiavi API di Firebase sono **progettate per essere pubbliche** (vengono esposte nel codice frontend). Tuttavia, la sicurezza è garantita da:

1. **Firestore Security Rules** - Controllano l'accesso ai dati
2. **Firebase Authentication** - Gestisce l'autenticazione degli utenti
3. **App Check** (consigliato) - Aggiunge un ulteriore livello di protezione

Per abilitare App Check:
1. Vai su Firebase Console > **App Check**
2. Registra la tua app web
3. Configura la verifica (reCAPTCHA v3 consigliato)

### Chiavi API Frontend

**IMPORTANTE:** Le chiavi API usate nel frontend (come `VITE_GOOGLE_SPEECH_API_KEY`) sono sempre esposte nel codice JavaScript. Per questo motivo:

1. ✅ **SEMPRE** limita le chiavi API su Google Cloud Console
2. ✅ **SEMPRE** usa restrizioni per dominio e API
3. ✅ **MONITORA** l'uso delle API nella console Google Cloud
4. ✅ **IMPOSTA** alert per uso anomalo

## 📊 Monitoraggio

Dopo aver configurato le restrizioni:

1. Vai su **APIs & Services** > **Dashboard**
2. Monitora l'uso delle API
3. Imposta alert per:
   - Uso eccessivo
   - Richieste da domini non autorizzati
   - Errori di autenticazione

## 🆘 Risoluzione Problemi

### "API key not valid" dopo le restrizioni

- Verifica che i domini siano corretti (includi `https://` o `http://`)
- Assicurati che il dominio corrisponda esattamente a quello usato nell'app
- Controlla che non ci siano spazi o caratteri speciali

### L'app non funziona più

- Verifica che le restrizioni API includano l'API corretta
- Controlla che i domini siano configurati correttamente
- Verifica i log nella console del browser per errori specifici

## 📚 Risorse

- [Google Cloud - Restricting API Keys](https://cloud.google.com/docs/authentication/api-keys#restricting_apis)
- [Firebase - App Check](https://firebase.google.com/docs/app-check)
- [Firebase - Security Rules](https://firebase.google.com/docs/rules)

