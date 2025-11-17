# 🚀 Guida alla Migrazione: da /peronciolillo-home-assistant/ a /home-assistant/

Questa guida ti accompagna passo passo nella migrazione del path dell'applicazione.

## 📋 Checklist Pre-Migrazione

- [x] Codice aggiornato con nuovo path
- [ ] Firebase Hosting configurato
- [ ] File spostati nella nuova cartella
- [ ] Restrizioni API aggiornate
- [ ] Deploy completato

---

## Passo 1: Aggiornare Firebase Hosting Configuration

### 1.1 Apri il progetto apheron-homepage

```powershell
cd ..\apheron-homepage
```

### 1.2 Apri il file `firebase.json`

Cerca la sezione `hosting` e trova le rewrite rules per `/peronciolillo-home-assistant`.

### 1.3 Aggiorna le Rewrite Rules

**PRIMA (da cambiare):**
```json
{
  "source": "/peronciolillo-home-assistant",
  "destination": "/peronciolillo-home-assistant/index.html"
},
{
  "source": "/peronciolillo-home-assistant/**",
  "destination": "/peronciolillo-home-assistant/index.html"
}
```

**DOPO (nuovo):**
```json
{
  "source": "/home-assistant",
  "destination": "/home-assistant/index.html"
},
{
  "source": "/home-assistant/**",
  "destination": "/home-assistant/index.html"
}
```

### 1.4 Salva il file `firebase.json`

---

## Passo 2: Spostare i File nella Nuova Cartella

### 2.1 Vai nella cartella public di apheron-homepage

```powershell
cd public
```

### 2.2 Verifica che esista la cartella vecchia

```powershell
Test-Path "peronciolillo-home-assistant"
```

### 2.3 Crea la nuova cartella (se non esiste)

```powershell
New-Item -ItemType Directory -Path "home-assistant" -Force
```

### 2.4 Copia i file dalla vecchia alla nuova cartella

```powershell
Copy-Item -Path "peronciolillo-home-assistant\*" -Destination "home-assistant\" -Recurse -Force
```

### 2.5 Verifica che i file siano stati copiati

```powershell
Get-ChildItem "home-assistant" | Select-Object Name
```

Dovresti vedere file come `index.html`, `assets/`, `manifest.json`, ecc.

### 2.6 (Opzionale) Rimuovi la vecchia cartella dopo aver verificato che tutto funziona

⚠️ **ATTENZIONE:** Fai questo SOLO dopo aver verificato che il nuovo path funziona correttamente!

```powershell
# NON eseguire questo comando finché non hai verificato che tutto funziona!
# Remove-Item -Path "peronciolillo-home-assistant" -Recurse -Force
```

---

## Passo 3: Aggiornare le Restrizioni delle Chiavi API

### 3.1 Vai su Google Cloud Console

1. Apri il browser e vai su: https://console.cloud.google.com/
2. Seleziona il progetto: **peronciolillo-home-assistant**

### 3.2 Vai alle Credenziali

1. Nel menu laterale, vai su **APIs & Services** > **Credentials**
2. Trova la chiave API che usi per Google Speech-to-Text

### 3.3 Aggiorna le Restrizioni HTTP Referrers

1. Clicca sul nome della chiave API per aprirla
2. Scorri fino a **Application restrictions**
3. Se vedi `https://apheron.io/peronciolillo-home-assistant/*`, aggiornala a:
   ```
   https://apheron.io/home-assistant/*
   ```
4. Se vuoi mantenere entrambi i path durante la transizione, aggiungi anche:
   ```
   https://apheron.io/peronciolillo-home-assistant/*
   https://apheron.io/home-assistant/*
   ```
5. Clicca **Save**

---

## Passo 4: Fare il Deploy

### 4.1 Torna al progetto home-assistant

```powershell
cd ..\..\peronciolillo-home-assistant
```

### 4.2 Build del progetto

```powershell
npm run build
```

### 4.3 Copia i file nella nuova cartella di apheron-homepage

```powershell
# Rimuovi la vecchia cartella se esiste
Remove-Item -Path "..\apheron-homepage\public\home-assistant" -Recurse -Force -ErrorAction SilentlyContinue

# Crea la nuova cartella
New-Item -ItemType Directory -Path "..\apheron-homepage\public\home-assistant" -Force

# Copia i file
Copy-Item -Path "dist\*" -Destination "..\apheron-homepage\public\home-assistant\" -Recurse -Force
```

### 4.4 Deploy su Firebase Hosting

```powershell
cd ..\apheron-homepage
firebase deploy --only hosting
```

### 4.5 Verifica il Deploy

1. Apri il browser e vai su: https://apheron.io/home-assistant/
2. Verifica che l'applicazione carichi correttamente
3. Testa il login
4. Testa alcune funzionalità principali

---

## Passo 5: Verifica Finale

### ✅ Checklist Post-Migrazione

- [ ] L'applicazione è accessibile su https://apheron.io/home-assistant/
- [ ] Il login funziona correttamente
- [ ] Le funzionalità principali funzionano
- [ ] Il service worker si registra correttamente
- [ ] Le API keys funzionano (se usi Google Speech-to-Text)

### 🔍 Verifica Console Browser

1. Apri gli strumenti sviluppatore (F12)
2. Vai alla tab **Console**
3. Verifica che non ci siano errori 404 per assets
4. Verifica che il service worker sia registrato

### 🔍 Verifica Network

1. Nella tab **Network** degli strumenti sviluppatore
2. Ricarica la pagina
3. Verifica che tutti i file vengano caricati correttamente (status 200)

---

## 🆘 Troubleshooting

### Problema: "404 Not Found" su https://apheron.io/home-assistant/

**Soluzione:**
1. Verifica che `firebase.json` contenga le rewrite rules corrette
2. Verifica che i file siano in `apheron-homepage/public/home-assistant/`
3. Rifai il deploy: `firebase deploy --only hosting`

### Problema: Assets non caricati (CSS/JS mancanti)

**Soluzione:**
1. Verifica che il build sia stato fatto correttamente: `npm run build`
2. Verifica che i file in `dist/` siano stati copiati correttamente
3. Controlla che `vite.config.ts` abbia `base: '/home-assistant/'`

### Problema: Service Worker non si registra

**Soluzione:**
1. Verifica che `sw.js` sia presente in `apheron-homepage/public/home-assistant/`
2. Verifica che `src/main.tsx` registri il service worker con il path corretto
3. Pulisci la cache del browser e ricarica

### Problema: API Key non funziona

**Soluzione:**
1. Verifica che le restrizioni HTTP referrers includano `https://apheron.io/home-assistant/*`
2. Attendi qualche minuto per la propagazione delle modifiche
3. Pulisci la cache del browser

---

## 📝 Note Importanti

1. **Mantieni la vecchia cartella temporaneamente**: Durante la transizione, mantieni entrambe le cartelle (`peronciolillo-home-assistant` e `home-assistant`) per permettere agli utenti di migrare gradualmente.

2. **Redirect opzionale**: Se vuoi, puoi aggiungere un redirect dalla vecchia alla nuova URL in `firebase.json`:
   ```json
   {
     "source": "/peronciolillo-home-assistant",
     "destination": "/home-assistant",
     "type": 301
   }
   ```

3. **Notifica agli utenti**: Se hai utenti attivi, considera di notificarli del cambio di URL.

---

## ✅ Completato!

Una volta completati tutti i passi, l'applicazione sarà disponibile su:
**https://apheron.io/home-assistant/**

Il vecchio path (`/peronciolillo-home-assistant/`) può essere rimosso dopo aver verificato che tutto funziona correttamente.

