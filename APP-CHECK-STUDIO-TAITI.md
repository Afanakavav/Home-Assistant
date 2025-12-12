# 🛡️ Firebase App Check - Studio Legale Taiti

## 📋 Informazioni Progetto

- **Progetto Firebase**: `studio-legale-taiti`
- **Site Key reCAPTCHA**: `6LcWjScsAAAAACAXAETtkhF8gmaUZwT0PLk972Vl`
- **Status App Check**: ❌ Da configurare

---

## ⚠️ Nota Importante: Inconsistenza Site Key

**Problema rilevato:**
- Il file `js/form-handler.js` usa Site Key: `6LcWjScsAAAAACAXAETtkhF8gmaUZwT0PLk972Vl`
- Il file `index.html` usa Site Key: `6LffriksAAAAAKvSqVFkxt6ggpicybwvV_yVF3Jq` (quella di Apheron Homepage)

**Raccomandazione:**
- Usa la Site Key corretta per Studio Legale Taiti: `6LcWjScsAAAAACAXAETtkhF8gmaUZwT0PLk972Vl`
- Aggiorna `index.html` per usare la Site Key corretta

---

## 🚀 Configurazione App Check in Firebase Console

### Passo 1: Firebase Console
1. Vai su: https://console.firebase.google.com/
2. Seleziona progetto: **studio-legale-taiti**

### Passo 2: App Check
1. Menu laterale: **App Check**
2. Clicca **"Register app"** o **"Get started"**

### Passo 3: Seleziona App
1. Seleziona la tua **Web App** (probabilmente `studio-legale-taiti-web`)

### Passo 4: Scegli Provider
1. ✅ **Scegli: reCAPTCHA Enterprise** (NON reCAPTCHA classico)

### Passo 5: Inserisci Site Key
1. Site Key: `6LcWjScsAAAAACAXAETtkhF8gmaUZwT0PLk972Vl`
2. ⚠️ **NON inserire Secret Key**

### Passo 6: Save
1. Clicca **Save**
2. Fatto! 🎉

---

## 🔧 Configurazione Codice

### File da Modificare: `index.html`

Il file `apheron-homepage/public/studioavvocato/index.html` ha già il codice per App Check, ma usa la Site Key sbagliata.

#### Correzione Necessaria:

**Linea ~44** - Aggiorna la Site Key nel tag script:
```html
<!-- PRIMA (sbagliato): -->
<script src="https://www.google.com/recaptcha/api.js?render=6LffriksAAAAAKvSqVFkxt6ggpicybwvV_yVF3Jq" async defer></script>

<!-- DOPO (corretto): -->
<script src="https://www.google.com/recaptcha/api.js?render=6LcWjScsAAAAACAXAETtkhF8gmaUZwT0PLk972Vl" async defer></script>
```

**Linea ~915** - Aggiorna la Site Key nel codice JavaScript:
```javascript
// PRIMA (sbagliato):
const recaptchaSiteKey = window.RECAPTCHA_SITE_KEY || '6LffriksAAAAAKvSqVFkxt6ggpicybwvV_yVF3Jq';

// DOPO (corretto):
const recaptchaSiteKey = window.RECAPTCHA_SITE_KEY || '6LcWjScsAAAAACAXAETtkhF8gmaUZwT0PLk972Vl';
```

---

## ✅ Verifica

Dopo la configurazione:
1. Apri il sito: `apheron-homepage/public/studioavvocato/index.html`
2. Console browser (F12)
3. Cerca: `✅ Firebase App Check initialized`

Se vedi questo messaggio, **App Check è attivo!** 🛡️

---

## 📝 Checklist

- [ ] Configurare App Check in Firebase Console con Site Key: `6LcWjScsAAAAACAXAETtkhF8gmaUZwT0PLk972Vl`
- [ ] Aggiornare Site Key in `index.html` (linea ~44)
- [ ] Aggiornare Site Key in `index.html` (linea ~915)
- [ ] Verificare in console browser: `✅ Firebase App Check initialized`

---

## 🎯 Riepilogo

| Elemento | Valore |
|----------|--------|
| **Progetto Firebase** | `studio-legale-taiti` |
| **Provider App Check** | reCAPTCHA Enterprise |
| **Site Key** | `6LcWjScsAAAAACAXAETtkhF8gmaUZwT0PLk972Vl` |
| **File da modificare** | `apheron-homepage/public/studioavvocato/index.html` |

