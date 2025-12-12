# 🧪 Test App Check - Risultati

## ✅ Progetti React/Vite

### Home Assistant
**Server**: `npm run dev` (in esecuzione in background)

**Come testare**:
1. Apri browser su `http://localhost:5173/home-assistant/` (o porta mostrata)
2. Apri Console Browser (F12 > Console)
3. Cerca: `✅ Firebase App Check initialized`

**Risultato atteso**: ✅ Messaggio visibile in console

---

### Job Tracker
**Server**: `npm run dev` (in esecuzione in background)

**Come testare**:
1. Apri browser su `http://localhost:5173/` (o porta mostrata)
2. Apri Console Browser (F12 > Console)
3. Cerca: `✅ Firebase App Check initialized`

**Risultato atteso**: ✅ Messaggio visibile in console

---

## ⚠️ Se Vedi Errori

### Errore: "App Check token is invalid"
- Verifica che l'app sia registrata in Firebase Console > App Check
- Controlla che la Site Key nel `.env` corrisponda a quella in Firebase Console
- In sviluppo, potrebbe servire un debug token (vedi Firebase Console > App Check > Manage debug tokens)

### Errore: "reCAPTCHA not loaded"
- Verifica che il dominio sia nella lista reCAPTCHA (deve includere `localhost` per sviluppo)
- Controlla che la Site Key sia corretta

### Nessun messaggio in console
- Verifica che il server sia in esecuzione
- Controlla che non ci siano errori JavaScript nella console
- Verifica che il file `.env` contenga `VITE_RECAPTCHA_SITE_KEY`

---

## ✅ Siti Statici - Implementati

### Matrimonio A&G
- ✅ App Check aggiunto a `index.html`
- ✅ reCAPTCHA v3 configurato
- ⏳ **DA FARE**: Creare `config.local.js` con Firebase API key reale
- ⏳ **DA FARE**: Registrare in Firebase Console > App Check

### Studio Legale Taiti
- ✅ App Check aggiunto a `public/studioavvocato/index.html`
- ✅ reCAPTCHA v3 configurato
- ⏳ **DA FARE**: Creare `public/config.local.js` con Firebase API key reale
- ⏳ **DA FARE**: Registrare in Firebase Console > App Check

### Studio Professionale Biancalani
- ✅ App Check aggiunto a `public/studioprofessionalebiancalani/index.html`
- ✅ reCAPTCHA v3 configurato
- ⏳ **DA FARE**: Creare `public/config.local.js` con Firebase API key reale
- ⏳ **DA FARE**: Registrare in Firebase Console > App Check

### Apheron Homepage (admin.html)
- ✅ App Check aggiunto a `public/firebase-config.js`
- ✅ reCAPTCHA v3 configurato
- ⏳ **DA FARE**: Creare `public/config.local.js` con Firebase API key reale
- ⏳ **DA FARE**: Registrare in Firebase Console > App Check

---

## 📝 Note

- I server di sviluppo sono in esecuzione in background
- Controlla la console del browser per vedere i messaggi
- Se non vedi il messaggio, controlla gli errori nella console

