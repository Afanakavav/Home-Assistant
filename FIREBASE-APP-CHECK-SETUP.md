# 🔧 Setup Firebase App Check - Guida Completa

## ⚠️ IMPORTANTE: Site Key vs Secret Key

Per **Firebase App Check con reCAPTCHA v3**, Firebase Console chiede la **Site Key** (pubblica), NON la Secret Key.

- **Site Key** (pubblica): Usata nel codice client-side ✅
- **Secret Key** (privata): Usata solo lato server per verificare token ❌ (non serve per App Check)

---

## 📋 Site Keys per Ogni Progetto

### 1. Matrimonio A&G
- **Site Key**: `6LcIrSksAAAAAMOGMT7_W16O84yTnb09RlGSCljJ`
- **Secret Key**: `6LcIrSksAAAAAJ1NzmfM6eP-oFeH_qLfaO5hylFp` (non serve per App Check)
- **Progetto Firebase**: `matrimonio-andrea-giulia-2026`

### 2. Apheron Homepage
- **Site Key**: `6LffriksAAAAAKvSqVFkxt6ggpicybwvV_yVF3Jq`
- **Secret Key**: `6LffriksAAAAALQ2Vkijjii53pENCKX62GxYKCXF` (non serve per App Check)
- **Progetto Firebase**: `apheron-homepage`

### 3. Italian Lessons Dublin
- **Site Key**: `6LfsriksAAAAALLlVhRtn0LSgoUUTclkil26finE`
- **Secret Key**: `6LfsriksAAAAAHr0NRVj0Spqgxtz0elStqdjZdT6` (non serve per App Check)
- **Nota**: Non usa Firebase, quindi App Check non necessario

---

## 🚀 Passo per Passo: Registrare in Firebase Console

### Per Matrimonio A&G:

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona progetto: **matrimonio-andrea-giulia-2026**
3. Menu laterale: **App Check**
4. Clicca **"Get started"** o **"Register app"**
5. Seleziona la tua **Web App**
6. Scegli provider: **reCAPTCHA v3**
7. **Incolla la Site Key**: `6LcIrSksAAAAAMOGMT7_W16O84yTnb09RlGSCljJ`
8. Clicca **Save**

### Per Apheron Homepage:

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona progetto: **apheron-homepage**
3. Menu laterale: **App Check**
4. Clicca **"Get started"** o **"Register app"**
5. Seleziona la tua **Web App**
6. Scegli provider: **reCAPTCHA v3**
7. **Incolla la Site Key**: `6LffriksAAAAAKvSqVFkxt6ggpicybwvV_yVF3Jq`
8. Clicca **Save**

---

## ❓ Se Firebase Chiede la Secret Key

**Normalmente Firebase App Check chiede solo la Site Key.**

Se vedi un campo "Secret Key" o "reCAPTCHA Secret Key", ecco cosa inserire:

### Matrimonio A&G
- **Secret Key**: `6LcIrSksAAAAAJ1NzmfM6eP-oFeH_qLfaO5hylFp`

### Apheron Homepage
- **Secret Key**: `6LffriksAAAAALQ2Vkijjii53pENCKX62GxYKCXF`

### Italian Lessons Dublin
- **Secret Key**: `6LfsriksAAAAAHr0NRVj0Spqgxtz0elStqdjZdT6`

**Nota**: In genere Firebase App Check richiede solo la **Site Key**. Se compare un campo "Secret Key":
1. Potrebbe essere opzionale - prova prima solo con la Site Key
2. Se è obbligatorio, usa le Secret Keys sopra
3. La Secret Key è privata e non va esposta nel codice client-side

---

## 📝 Riepilogo Site Keys

| Progetto | Site Key | Progetto Firebase |
|----------|----------|-------------------|
| Matrimonio A&G | `6LcIrSksAAAAAMOGMT7_W16O84yTnb09RlGSCljJ` | matrimonio-andrea-giulia-2026 |
| Apheron Homepage | `6LffriksAAAAAKvSqVFkxt6ggpicybwvV_yVF3Jq` | apheron-homepage |
| Italian Lessons | `6LfsriksAAAAALLlVhRtn0LSgoUUTclkil26finE` | N/A (non usa Firebase) |

---

## ✅ Verifica Dopo la Registrazione

Dopo aver registrato l'app in Firebase Console:

1. Apri il sito in un browser
2. Apri Console (F12)
3. Cerca: `✅ Firebase App Check initialized`
4. Se vedi questo messaggio, App Check è attivo! 🎉

---

## 🆘 Troubleshooting

### Errore: "Invalid site key"
- Verifica di aver copiato la Site Key corretta (inizia con `6L...`)
- Controlla che il dominio sia nella lista reCAPTCHA (deve includere il tuo dominio)

### Errore: "App Check token is invalid"
- Verifica che l'app sia registrata in Firebase Console
- Controlla che la Site Key corrisponda a quella nel codice
- In sviluppo, potrebbe servire un debug token

### Nessun messaggio in console
- Verifica che `config.local.js` sia caricato correttamente
- Controlla che reCAPTCHA sia caricato prima di App Check
- Verifica che non ci siano errori JavaScript nella console

---

## 📚 Riferimenti

- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)

