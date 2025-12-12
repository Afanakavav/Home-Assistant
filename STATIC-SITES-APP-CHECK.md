# 🛡️ App Check per Siti Statici

## Progetti Statici da Configurare

### 1. Matrimonio A&G
- **reCAPTCHA Site Key**: `6LcIrSksAAAAAMOGMT7_W16O84yTnb09RlGSCljJ`
- **File config**: `config.local.js` (da creare)

### 2. Apheron Homepage
- **reCAPTCHA Site Key**: `6LffriksAAAAAKvSqVFkxt6ggpicybwvV_yVF3Jq`
- **File config**: `config.local.js` (da creare)

### 3. Italian Lessons Dublin
- **reCAPTCHA Site Key**: `6LfsriksAAAAALLlVhRtn0LSgoUUTclkil26finE`
- **Nota**: Non usa Firebase, solo Google Maps API

---

## Setup per Siti Statici

### Passo 1: Creare config.local.js

Per ogni sito statico, crea un file `config.local.js` nella root del progetto:

**Matrimonio A&G** (`matrimonio-sito/config.local.js`):
```javascript
window.FIREBASE_CONFIG = {
    apiKey: 'your-actual-firebase-api-key',
    authDomain: 'matrimonio-andrea-giulia-2026.firebaseapp.com',
    projectId: 'matrimonio-andrea-giulia-2026',
    storageBucket: 'matrimonio-andrea-giulia-2026.firebasestorage.app',
    messagingSenderId: '295197554541',
    appId: '1:295197554541:web:d932fc9b2407d182e44c64',
    measurementId: 'G-WTT3TQN19C'
};

window.RECAPTCHA_SITE_KEY = '6LcIrSksAAAAAMOGMT7_W16O84yTnb09RlGSCljJ';
```

**Apheron Homepage** (`apheron-homepage/public/config.local.js`):
```javascript
window.FIREBASE_CONFIG = {
    apiKey: 'your-actual-firebase-api-key',
    authDomain: 'apheron-homepage.firebaseapp.com',
    projectId: 'apheron-homepage',
    storageBucket: 'apheron-homepage.firebasestorage.app',
    messagingSenderId: '42831155917',
    appId: '1:42831155917:web:be2c00df5d5af72dd78f84'
};

window.RECAPTCHA_SITE_KEY = '6LffriksAAAAAKvSqVFkxt6ggpicybwvV_yVF3Jq';
```

### Passo 2: Aggiungere App Check agli HTML

Aggiungi questo codice prima di inizializzare Firebase:

```html
<!-- Load reCAPTCHA v3 -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>

<!-- Load config.local.js FIRST -->
<script src="/config.local.js"></script>

<!-- Firebase App Check -->
<script type="module">
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
  import { initializeAppCheck, ReCaptchaV3Provider } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js';
  
  const firebaseConfig = window.FIREBASE_CONFIG;
  const app = initializeApp(firebaseConfig);
  
  // Initialize App Check
  const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(window.RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
  
  console.log('✅ Firebase App Check initialized');
</script>

<!-- Then load your firebase-config.js -->
<script src="/firebase-config.js"></script>
```

### Passo 3: Registrare in Firebase Console

Per ogni progetto:
1. Firebase Console > **App Check**
2. **Register app** > Seleziona Web App
3. Provider: **reCAPTCHA v3**
4. Incolla la Site Key corrispondente
5. **Save**

---

## ⚠️ Note Importanti

1. **config.local.js è già nel .gitignore** - non verrà committato
2. **Deploy config.local.js separatamente** - non committarlo mai
3. **Per sviluppo locale**: Usa debug token (vedi Firebase Console > App Check)
4. **Per produzione**: Assicurati che config.local.js sia deployato

---

## 🚀 Alternativa: Firebase Hosting

Se usi Firebase Hosting, App Check funziona automaticamente senza configurazione aggiuntiva. Basta registrare l'app in Firebase Console > App Check.

