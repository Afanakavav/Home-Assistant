# 🔒 Security Audit Report - Chiavi API Esposte

**Data Audit**: $(Get-Date -Format "yyyy-MM-dd")  
**Stato**: ⚠️ **CRITICO** - Chiavi API esposte in repository pubblici

---

## 📊 Riepilogo

| Repository | Chiavi Trovate | Priorità | Stato |
|------------|----------------|----------|-------|
| Home Assistant | 2 chiavi | 🔴 CRITICA | ✅ Corretto |
| Studio Legale Taiti | 1 chiave | 🔴 CRITICA | ❌ Da correggere |
| Apheron Homepage | 1 chiave | 🔴 CRITICA | ❌ Da correggere |
| Job Tracker | 2 chiavi | 🔴 CRITICA | ❌ Da correggere |
| Matrimoni A&G | 1 chiave | 🔴 CRITICA | ❌ Da correggere |
| Italian Lessons | 1 chiave | 🟡 MEDIA | ❌ Da correggere |
| L.A. Mason Group | 0 chiavi | ✅ OK | ✅ OK |
| Studio Biancalani | 0 chiavi | ✅ OK | ✅ OK |

---

## 🔴 Repository con Chiavi Esposte

### 1. **Studio Legale Taiti** (apheron-homepage)
**File**: `apheron-homepage/public/studioavvocato/js/firebase-config.js`  
**Chiave**: `AIzaSyAKm5nPCkRKt7M89vom33TTjecvUw0EEUY`  
**Tipo**: Firebase API Key  
**Progetto**: `studio-legale-taiti`

**Azione Richiesta**:
- [ ] Spostare la configurazione in variabili d'ambiente
- [ ] Creare file `.env.example` con placeholder
- [ ] Aggiornare `.gitignore` per escludere file con chiavi
- [ ] Ruotare la chiave API in Firebase Console

---

### 2. **Apheron Homepage** (apheron-homepage)
**File**: `apheron-homepage/public/firebase-config.js`  
**Chiave**: `AIzaSyAKsALzEd6iDVgfxb4nylcfYaFQmCkzxN4`  
**Tipo**: Firebase API Key  
**Progetto**: `apheron-homepage`

**File Aggiuntivo**: `apheron-homepage/public/studioprofessionalebiancalani/js/firebase-config.js`  
**Stessa chiave** (condivisa)

**Azione Richiesta**:
- [ ] Spostare la configurazione in variabili d'ambiente
- [ ] Creare file `.env.example` con placeholder
- [ ] Aggiornare `.gitignore` per escludere file con chiavi
- [ ] Ruotare la chiave API in Firebase Console

---

### 3. **Job Tracker** (apheron-job-tracker)
**File 1**: `apheron-job-tracker/src/services/firebase.ts`  
**Chiave**: `AIzaSyCGoXvIg-Taemqebqe_AxSL7aAtwfFxy_w`  
**Tipo**: Firebase API Key  
**Progetto**: `apheron-job-tracker`

**File 2**: `apheron-job-tracker/functions/index.js` (linea 29)  
**Chiave Hardcoded**: `AIzaSyDQ8iw-kQf-Des8uPiQKZYgTcqPwoZcTaw`  
**Tipo**: Gemini API Key (fallback hardcoded)  
**⚠️ CRITICO**: Chiave hardcoded nel codice come fallback!

**Azione Richiesta**:
- [ ] Rimuovere chiave hardcoded da `functions/index.js`
- [ ] Spostare Firebase config in variabili d'ambiente
- [ ] Assicurarsi che `GEMINI_API_KEY` sia solo in variabili d'ambiente
- [ ] Creare file `.env.example` con placeholder
- [ ] Aggiornare `.gitignore` per escludere file con chiavi
- [ ] Ruotare entrambe le chiavi API

---

### 4. **Matrimoni Andrea & Giulia** (matrimonio-sito)
**File**: `matrimonio-sito/firebase-config.js`  
**Chiave**: `AIzaSyDp-va9ud9rDhNqqTD4Y0lMb-O-_Kg6YAQ`  
**Tipo**: Firebase API Key  
**Progetto**: `matrimonio-andrea-giulia-2026`

**Azione Richiesta**:
- [ ] Spostare la configurazione in variabili d'ambiente
- [ ] Creare file `.env.example` con placeholder
- [ ] Aggiornare `.gitignore` per escludere file con chiavi
- [ ] Ruotare la chiave API in Firebase Console

---

### 5. **Italian Lessons Dublin** (apheron-homepage/public/italian-lessons-dublin)
**File 1**: `apheron-homepage/public/italian-lessons-dublin/config.js`  
**File 2**: `apheron-homepage/public/italian-lessons-dublin/index.html` (linea 260)  
**Chiave**: `AIzaSyAf322olVztRrAIGFwqvaF5kB8s6NlbNmE`  
**Tipo**: Google Maps API Key  
**Progetto**: Italian Lessons Dublin

**Azione Richiesta**:
- [ ] Spostare la chiave in variabili d'ambiente o file di configurazione escluso da git
- [ ] Creare file `.env.example` con placeholder
- [ ] Aggiornare `.gitignore` per escludere file con chiavi
- [ ] Restringere la chiave Google Maps API a domini specifici
- [ ] Considerare di ruotare la chiave

---

## ✅ Repository Verificati - Nessun Problema

### 6. **L.A. Mason Group** (la-mason-group-website)
✅ **Nessuna chiave API trovata** - Repository sicuro

### 7. **Studio Biancalani** (studiobiancalani-website)
✅ **Solo placeholder trovati** - Repository sicuro

---

## 🛠️ Piano di Azione Generale

### Fase 1: Correzione Immediata (Priorità Alta)
1. ✅ **Home Assistant** - Completato
2. ⏳ **Job Tracker** - Rimuovere chiave hardcoded (CRITICO)
3. ⏳ **Studio Legale Taiti** - Correggere
4. ⏳ **Apheron Homepage** - Correggere
5. ⏳ **Matrimoni A&G** - Correggere

### Fase 2: Correzione Media Priorità
6. ⏳ **Italian Lessons Dublin** - Correggere (Google Maps API)

### Fase 3: Rotazione Chiavi
- Ruotare tutte le chiavi API esposte
- Aggiornare configurazioni in produzione
- Verificare che tutto funzioni correttamente

---

## 📝 Template per Correzione

Per ogni repository, seguire questi passaggi:

1. **Creare `.env.example`** con placeholder
2. **Aggiornare `.gitignore`** per escludere:
   - `.env`
   - `*.config.js` (se contiene chiavi)
   - File specifici con chiavi
3. **Spostare chiavi in variabili d'ambiente**
4. **Rimuovere chiavi hardcoded dal codice**
5. **Commit e push delle correzioni**
6. **Ruotare le chiavi esposte**

---

## ⚠️ Note Importanti

1. **Firebase API Keys** sono progettate per essere pubbliche, MA:
   - Devono essere protette con Firebase Security Rules
   - Devono avere Firebase App Check abilitato
   - Non dovrebbero essere committate per best practices

2. **Google Maps API Keys** devono essere:
   - Ristrette a domini specifici
   - Ristrette a API specifiche (Maps JavaScript API)
   - Monitorate per uso anomalo

3. **Gemini API Keys** sono molto sensibili:
   - MAI hardcodare nel codice
   - Usare sempre variabili d'ambiente
   - Restringere in Google Cloud Console

---

## 🔄 Prossimi Passi

1. Correggere tutti i repository seguendo il template
2. Ruotare tutte le chiavi esposte
3. Verificare che gli alert GitHub siano risolti
4. Implementare monitoraggio per prevenire future esposizioni

