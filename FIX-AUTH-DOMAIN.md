# 🔧 Fix: Firebase OAuth Unauthorized Domain

## Problema

Errore: `Firebase: Error (auth/unauthorized-domain)`

Il dominio `apheron.io` non è autorizzato per OAuth operations (Google Sign-In).

## Soluzione

### Step 1: Aggiungi il dominio autorizzato

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona il progetto: **`peronciolillo-home-assistant`**
3. Vai a **Authentication** → **Settings** (⚙️ in alto a destra)
4. Clicca sulla tab **Authorized domains**
5. Clicca **Add domain**
6. Aggiungi: **`apheron.io`**
7. Clicca **Add**

### Step 2: Verifica i domini autorizzati

Dovresti vedere nella lista:
- `localhost` (già presente)
- `peronciolillo-home-assistant.firebaseapp.com` (già presente)
- `peronciolillo-home-assistant.web.app` (già presente)
- **`apheron.io`** (appena aggiunto) ✅

### Step 3: Testa di nuovo

1. Vai su https://apheron.io/home-assistant/
2. Clicca "Continue with Google"
3. Dovrebbe funzionare! 🎉

## Note

- I cambiamenti sono istantanei, non serve riavviare nulla
- Se usi anche altri sottodomini (es. `www.apheron.io`), aggiungili anche quelli
- Il dominio deve essere esattamente `apheron.io` (senza `www` a meno che non lo aggiungi separatamente)

## Troubleshooting

### ❌ Ancora non funziona dopo aver aggiunto il dominio

**Possibili cause:**
1. Cache del browser - prova in incognito o pulisci la cache
2. Dominio scritto male - verifica che sia esattamente `apheron.io`
3. Progetto Firebase sbagliato - assicurati di aver aggiunto il dominio al progetto `peronciolillo-home-assistant`

### ❌ Funziona su localhost ma non su apheron.io

**Causa**: Il dominio di produzione non è autorizzato

**Soluzione**: Aggiungi `apheron.io` come descritto sopra

