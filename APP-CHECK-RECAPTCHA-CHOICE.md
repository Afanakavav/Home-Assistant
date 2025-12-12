# 🔧 Firebase App Check: reCAPTCHA vs reCAPTCHA Enterprise

## ⚠️ IMPORTANTE: Quale Scegliere?

Firebase App Check offre due opzioni:
1. **reCAPTCHA** (classico) - Richiede **Secret Key**
2. **reCAPTCHA Enterprise** - Richiede **Site Key**

---

## ✅ RACCOMANDAZIONE: Usa reCAPTCHA Enterprise

**Perché?**
- ✅ Usa **Site Key** (pubblica) - più semplice
- ✅ Supporta reCAPTCHA v3 (quello che abbiamo configurato)
- ✅ **Allineato con il codice** - usiamo `ReCaptchaV3Provider` con Site Key
- ✅ Più moderno e raccomandato da Google

**Nel nostro codice usiamo:**
```typescript
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(recaptchaSiteKey), // Site Key!
  isTokenAutoRefreshEnabled: true
});
```

Quindi **reCAPTCHA Enterprise** è la scelta corretta per allinearsi con il codice.

---

## 🔄 Cosa Fare per Home Assistant e Job Tracker

Se hai già scelto **reCAPTCHA** (classico) con Secret Key:

### ⚠️ Problema Potenziale

Il codice usa **Site Key** (`ReCaptchaV3Provider` con Site Key), ma Firebase Console con reCAPTCHA classico richiede **Secret Key**. Questo potrebbe causare problemi.

### ✅ SOLUZIONE: Cambiare a reCAPTCHA Enterprise (Raccomandato)

**Perché cambiare?**
- Il codice usa Site Key, ma Firebase Console con reCAPTCHA classico usa Secret Key
- Potrebbero esserci incompatibilità
- reCAPTCHA Enterprise è allineato con il codice

**Come cambiare:**

1. Firebase Console > **App Check** > la tua app
2. Clicca sui **tre puntini** (⋮) accanto all'app
3. Seleziona **"Remove provider"** o **"Delete"**
4. Clicca **"Register app"** di nuovo
5. Scegli **reCAPTCHA Enterprise** (NON reCAPTCHA classico)
6. Inserisci la **Site Key**:
   - Home Assistant: `6LcCriksAAAAAEocYos1CoE5Zv6m8Kt0jtBkZjw7`
   - Job Tracker: `6LfZriksAAAAAH7NwxHr3t5O7MzCVj1AYk26QZyn`
7. **Save**

**Vantaggio**: Allineato con il codice (entrambi usano Site Key)

---

## 🚀 Per Siti Statici: Usa reCAPTCHA Enterprise

### Matrimonio A&G

1. Firebase Console > Progetto: **matrimonio-andrea-giulia-2026**
2. **App Check** > **Register app**
3. Seleziona app: **matrimonio-website**
4. Scegli: **reCAPTCHA Enterprise** (non reCAPTCHA classico)
5. Inserisci **Site Key**: `6LcIrSksAAAAAMOGMT7_W16O84yTnb09RlGSCljJ`
6. **Save**

### Apheron Homepage

1. Firebase Console > Progetto: **apheron-homepage**
2. **App Check** > **Register app**
3. Seleziona la tua **Web App**
4. Scegli: **reCAPTCHA Enterprise** (non reCAPTCHA classico)
5. Inserisci **Site Key**: `6LffriksAAAAAKvSqVFkxt6ggpicybwvV_yVF3Jq`
6. **Save**

---

## 📋 Riepilogo Site Keys per reCAPTCHA Enterprise

| Progetto | Site Key | Progetto Firebase |
|----------|----------|-------------------|
| **Matrimonio A&G** | `6LcIrSksAAAAAMOGMT7_W16O84yTnb09RlGSCljJ` | matrimonio-andrea-giulia-2026 |
| **Apheron Homepage** | `6LffriksAAAAAKvSqVFkxt6ggpicybwvV_yVF3Jq` | apheron-homepage |
| **Home Assistant** | `6LcCriksAAAAAEocYos1CoE5Zv6m8Kt0jtBkZjw7` | peronciolillo-home-assistant |
| **Job Tracker** | `6LfZriksAAAAAH7NwxHr3t5O7MzCVj1AYk26QZyn` | apheron-job-tracker |

---

## ❓ Differenza tra reCAPTCHA e reCAPTCHA Enterprise

### reCAPTCHA (classico)
- Richiede **Secret Key** (privata)
- Versione più vecchia
- Funziona ma meno flessibile

### reCAPTCHA Enterprise
- Richiede **Site Key** (pubblica) ✅
- Versione più moderna
- Supporta reCAPTCHA v3
- Allineato con il nostro codice
- **Raccomandato da Google**

---

## ✅ Conclusione

**Per tutti i progetti**: Usa **reCAPTCHA Enterprise** con **Site Key**

**Per Home Assistant e Job Tracker**:
- Se funziona con reCAPTCHA (classico) + Secret Key → **OK, puoi lasciare**
- Se vuoi allineare tutto → **Cambia a reCAPTCHA Enterprise** con Site Key

**Per siti statici**: Usa sempre **reCAPTCHA Enterprise** con **Site Key**

---

## 🎯 Vantaggi di reCAPTCHA Enterprise

1. ✅ Usa Site Key (pubblica) - più semplice
2. ✅ Allineato con il codice (abbiamo Site Key nel codice)
3. ✅ Più moderno e supportato
4. ✅ Migliore integrazione con Firebase

