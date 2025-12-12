# 🚀 Setup Rapido App Check - 5 Minuti

## Passo 1: Creare reCAPTCHA v3 (2 min)

1. Vai su: https://www.google.com/recaptcha/admin/create
2. Clicca **"+"** per nuovo sito
3. Compila:
   - **Label**: Home Assistant
   - **Type**: reCAPTCHA v3
   - **Domains**: `apheron.io`, `localhost`
4. Clicca **Submit**
5. **Copia la Site Key** (inizia con `6Lf...`)

## Passo 2: Aggiungere al .env (30 sec)

Aggiungi al file `.env`:

```env
VITE_RECAPTCHA_SITE_KEY=6LfXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

(Sostituisci con la tua Site Key)

## Passo 3: Registrare in Firebase (2 min)

1. Vai su: https://console.firebase.google.com/
2. Progetto: **peronciolillo-home-assistant**
3. Menu: **App Check**
4. Clicca **"Get started"** o **"Register app"**
5. Seleziona la tua **Web App**
6. Provider: **reCAPTCHA v3**
7. Incolla la **Site Key**
8. Clicca **Save**

## Passo 4: Testare (30 sec)

```bash
npm run dev
```

Apri console browser → Dovresti vedere: `✅ Firebase App Check initialized`

## ✅ Fatto!

La tua API key è ora protetta. Anche se qualcuno la ha, non può usarla.

---

## 🐛 Problemi?

**Errore in sviluppo?** Usa debug token:
1. Firebase Console > App Check > la tua app > ⋮ > Manage debug tokens
2. Apri console browser → cerca "App Check debug token"
3. Copia e incolla in Firebase Console

