# 🚀 Deployment Guide - Peronciolillo Home Assistant

## Deploy su apheron.io/peronciolillo-home-assistant

Il progetto è deployato come sottocartella del progetto Firebase `apheron-homepage` che gestisce `apheron.io`.

## ✅ Deploy Completato!

Il sito è live su: **https://apheron.io/peronciolillo-home-assistant/**

## Processo di Deploy

### Metodo Automatico (Consigliato)

Usa lo script PowerShell:

```powershell
.\deploy.ps1
```

Lo script:
1. Builda il progetto (`npm run build`)
2. Copia i file in `apheron-homepage/public/peronciolillo-home-assistant/`
3. Deploya su Firebase Hosting

### Metodo Manuale

1. **Build del progetto:**
```bash
npm run build
```

2. **Copia i file:**
```powershell
# Windows PowerShell
xcopy /E /I /Y dist ..\apheron-homepage\public\peronciolillo-home-assistant
```

3. **Deploy da apheron-homepage:**
```bash
cd ..\apheron-homepage
firebase deploy --only hosting
```

## Configurazione

### Base Path

Il progetto è configurato con base path `/peronciolillo-home-assistant/` in:
- `vite.config.ts`: `base: '/peronciolillo-home-assistant/'`

### Firebase Rewrite Rules

Le rewrite rules sono configurate in `apheron-homepage/firebase.json`:

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

## Verifica Deployment

1. Vai su **https://apheron.io/peronciolillo-home-assistant/**
2. Verifica che l'app carichi correttamente
3. Testa login/registrazione
4. Testa le funzionalità principali

## Troubleshooting

### ❌ "404 Not Found" dopo deploy

**Causa**: Rewrite rules non configurate correttamente

**Soluzione**:
1. Verifica che `apheron-homepage/firebase.json` contenga le rewrite rules per `/peronciolillo-home-assistant`
2. Verifica che i file siano in `apheron-homepage/public/peronciolillo-home-assistant/`
3. Redeploy: `cd ..\apheron-homepage && firebase deploy --only hosting`

### ❌ Assets non caricati (CSS/JS mancanti)

**Causa**: Path degli assets non corretto

**Soluzione**:
1. Verifica che `vite.config.ts` abbia `base: '/peronciolillo-home-assistant/'`
2. Rebuild: `npm run build`
3. Ricopia i file e redeploy

### ❌ Routing non funziona

**Causa**: React Router non riconosce il base path

**Soluzione**:
- Il base path è gestito automaticamente da Vite
- Se problemi, verifica che `BrowserRouter` non abbia `basename` (non necessario con Vite base)

## Aggiornamento

Per aggiornare il sito dopo modifiche:

```powershell
# Metodo automatico
.\deploy.ps1

# Oppure manuale
npm run build
xcopy /E /I /Y dist ..\apheron-homepage\public\peronciolillo-home-assistant
cd ..\apheron-homepage
firebase deploy --only hosting
```

## Note

- Il progetto è configurato per funzionare sia in sviluppo (`npm run dev`) che in produzione
- In sviluppo, usa `http://localhost:5173/peronciolillo-home-assistant/`
- In produzione, usa `https://apheron.io/peronciolillo-home-assistant/`
- I file sono deployati come parte del progetto `apheron-homepage`, non come progetto separato
