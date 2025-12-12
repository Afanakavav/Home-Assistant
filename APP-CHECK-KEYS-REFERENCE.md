# 🔑 Riferimento Rapido - Chiavi per Firebase App Check

## 📋 Site Keys (Pubbliche) - Usate nel Codice

| Progetto | Site Key | Usata in |
|----------|----------|----------|
| **Matrimonio A&G** | `6LcIrSksAAAAAMOGMT7_W16O84yTnb09RlGSCljJ` | `config.local.js` |
| **Apheron Homepage** | `6LffriksAAAAAKvSqVFkxt6ggpicybwvV_yVF3Jq` | `config.local.js` |
| **Italian Lessons** | `6LfsriksAAAAALLlVhRtn0LSgoUUTclkil26finE` | `config.js` |
| **Home Assistant** | `6LcCriksAAAAAEocYos1CoE5Zv6m8Kt0jtBkZjw7` | `.env` |
| **Job Tracker** | `6LfZriksAAAAAH7NwxHr3t5O7MzCVj1AYk26QZyn` | `.env` |

---

## 🔐 Secret Keys (Private) - Solo se Richieste da Firebase

| Progetto | Secret Key | Quando Usare |
|----------|------------|--------------|
| **Matrimonio A&G** | `6LcIrSksAAAAAJ1NzmfM6eP-oFeH_qLfaO5hylFp` | Solo se Firebase Console la richiede |
| **Apheron Homepage** | `6LffriksAAAAALQ2Vkijjii53pENCKX62GxYKCXF` | Solo se Firebase Console la richiede |
| **Italian Lessons** | `6LfsriksAAAAAHr0NRVj0Spqgxtz0elStqdjZdT6` | Solo se Firebase Console la richiede |
| **Home Assistant** | `6LcCriksAAAAAHqX2rxK2ABu3WOEorbBBMOa4dBz` | Solo se Firebase Console la richiede |
| **Job Tracker** | `6LfZriksAAAAAHEC96XghhhYD0H9tU6Z7pWTHcqN` | Solo se Firebase Console la richiede |

---

## ⚠️ IMPORTANTE

1. **Site Key** = Pubblica, va nel codice ✅
2. **Secret Key** = Privata, NON va nel codice ❌
3. **Firebase App Check** normalmente chiede solo la **Site Key**
4. Se Firebase chiede la Secret Key, usa quelle nella tabella sopra

---

## 🚀 Setup in Firebase Console

### Passo 1: Vai su Firebase Console
- [Firebase Console](https://console.firebase.google.com/)

### Passo 2: Seleziona il Progetto
- Matrimonio A&G → `matrimonio-andrea-giulia-2026`
- Apheron Homepage → `apheron-homepage`
- Home Assistant → `peronciolillo-home-assistant`
- Job Tracker → `apheron-job-tracker`

### Passo 3: App Check
1. Menu laterale: **App Check**
2. Clicca **"Get started"** o **"Register app"**
3. Seleziona la tua **Web App**
4. Provider: **reCAPTCHA v3**

### Passo 4: Inserisci la Chiave
- **Campo "Site Key"** o **"reCAPTCHA Site Key"**: Usa la **Site Key** dalla tabella sopra
- **Campo "Secret Key"** (se presente): Usa la **Secret Key** dalla tabella sopra (solo se obbligatorio)

### Passo 5: Save
- Clicca **Save**
- L'app è ora protetta con App Check! 🎉

---

## ✅ Verifica

Dopo la registrazione, apri il sito e controlla la console del browser:
- Dovresti vedere: `✅ Firebase App Check initialized`

Se vedi questo messaggio, **App Check è attivo e le tue API keys sono protette!** 🛡️

