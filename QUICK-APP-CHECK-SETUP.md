# ⚡ Setup Rapido App Check - Guida Veloce

## 🎯 Scelta Corretta: reCAPTCHA Enterprise

**Scegli sempre**: **reCAPTCHA Enterprise** (non reCAPTCHA classico)

**Perché?**
- ✅ Usa **Site Key** (allineato con il codice)
- ✅ Il codice usa `ReCaptchaV3Provider` con Site Key
- ✅ Più moderno e supportato

---

## 📋 Site Keys da Usare

### Home Assistant
- **Site Key**: `6LcCriksAAAAAEocYos1CoE5Zv6m8Kt0jtBkZjw7`
- **Progetto**: `peronciolillo-home-assistant`

### Job Tracker
- **Site Key**: `6LfZriksAAAAAH7NwxHr3t5O7MzCVj1AYk26QZyn`
- **Progetto**: `apheron-job-tracker`

### Matrimonio A&G
- **Site Key**: `6LcIrSksAAAAAMOGMT7_W16O84yTnb09RlGSCljJ`
- **Progetto**: `matrimonio-andrea-giulia-2026`

### Apheron Homepage
- **Site Key**: `6LffriksAAAAAKvSqVFkxt6ggpicybwvV_yVF3Jq`
- **Progetto**: `apheron-homepage`

---

## 🚀 Passo per Passo

### 1. Vai su Firebase Console
[Firebase Console](https://console.firebase.google.com/)

### 2. Seleziona il Progetto
- Home Assistant → `peronciolillo-home-assistant`
- Job Tracker → `apheron-job-tracker`
- Matrimonio A&G → `matrimonio-andrea-giulia-2026`
- Apheron Homepage → `apheron-homepage`

### 3. App Check
- Menu laterale: **App Check**
- Clicca **"Register app"** o **"Get started"**

### 4. Seleziona l'App
- Seleziona la tua **Web App**

### 5. Scegli Provider
- ✅ **Scegli: reCAPTCHA Enterprise** (NON reCAPTCHA classico)
- ⚠️ **NON scegliere**: reCAPTCHA (classico)

### 6. Inserisci Site Key
- Incolla la **Site Key** corrispondente (vedi tabella sopra)
- **NON inserire Secret Key**

### 7. Save
- Clicca **Save**
- Fatto! 🎉

---

## 🔄 Se Hai Già Configurato reCAPTCHA (classico)

### Per Home Assistant e Job Tracker:

Se hai già usato **reCAPTCHA** (classico) con Secret Key:

1. Firebase Console > **App Check** > la tua app
2. Clicca **tre puntini** (⋮) > **Remove provider**
3. Clicca **"Register app"** di nuovo
4. Scegli **reCAPTCHA Enterprise** questa volta
5. Inserisci la **Site Key** (non Secret Key)
6. **Save**

**Perché cambiare?**
- Il codice usa Site Key, ma reCAPTCHA classico usa Secret Key
- Potrebbero esserci incompatibilità
- reCAPTCHA Enterprise è allineato

---

## ✅ Verifica

Dopo la configurazione:
1. Apri il sito/app
2. Console browser (F12)
3. Cerca: `✅ Firebase App Check initialized`

Se vedi questo messaggio, **App Check è attivo!** 🛡️

---

## 📝 Riepilogo

| Progetto | Provider | Chiave da Usare |
|----------|----------|-----------------|
| Home Assistant | **reCAPTCHA Enterprise** | Site Key: `6LcCriksAAAAAEocYos1CoE5Zv6m8Kt0jtBkZjw7` |
| Job Tracker | **reCAPTCHA Enterprise** | Site Key: `6LfZriksAAAAAH7NwxHr3t5O7MzCVj1AYk26QZyn` |
| Matrimonio A&G | **reCAPTCHA Enterprise** | Site Key: `6LcIrSksAAAAAMOGMT7_W16O84yTnb09RlGSCljJ` |
| Apheron Homepage | **reCAPTCHA Enterprise** | Site Key: `6LffriksAAAAAKvSqVFkxt6ggpicybwvV_yVF3Jq` |

**Regola d'oro**: Scegli sempre **reCAPTCHA Enterprise** e usa sempre la **Site Key**! ✅

