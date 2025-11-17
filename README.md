# Home Assistant

Shared home management platform for couples.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

Follow the detailed guide in [`FIREBASE-SETUP-GUIDE.md`](./FIREBASE-SETUP-GUIDE.md)

**Quick steps:**
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password + Google)
3. Create Firestore Database
4. Enable Storage
5. Get Firebase config from Project Settings
6. Set up Firestore and Storage security rules (see guide)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. Get Google Cloud Speech-to-Text API key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Cloud Speech-to-Text API"
   - Create API key (restrict to Speech API)
   - Add to `.env`:
```env
VITE_GOOGLE_SPEECH_API_KEY=your_speech_api_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
src/
  components/     # Reusable UI components
    ExpenseQuickAdd.tsx  # Expense logging with voice input
  contexts/       # React contexts
    AuthContext.tsx      # Authentication
    HouseholdContext.tsx # Current household
  pages/          # Page components
    Login.tsx           # Login/Signup
    HouseholdSetup.tsx  # Create/Join household
    Dashboard.tsx       # Main dashboard
  services/       # Firebase services & API calls
    firebase.ts         # Firebase initialization
    expenseService.ts   # Expense CRUD operations
    speechService.ts    # Google Speech-to-Text
    householdService.ts # Household management
  types/          # TypeScript type definitions
  styles/         # Global styles
```

## ✨ Features

### ✅ Implemented

- [x] Authentication (Email/Password + Google)
- [x] Household creation & joining with invite codes
- [x] Expense logging (voice input + manual)
- [x] Dashboard with week summary and recent expenses
- [x] Expense categorization
- [x] Automatic expense splitting between household members

### ✅ Additional Features

- [x] Shopping list with shared household lists
- [x] Task management with calendar views
- [x] Recurring expenses tracking
- [x] Inventory management
- [x] Plant care tracking
- [x] Vendor management
- [x] Badge system for achievements
- [x] Expense charts and analytics
- [x] Global search across all data
- [x] Invite code system for household sharing

### 🚧 Coming Next

- [ ] PWA support (offline mode)
- [ ] Receipt photo OCR
- [ ] WhatsApp integration
- [ ] Export data functionality

## 🎤 Voice Input

The app supports voice input for expenses using Google Cloud Speech-to-Text API.

**Example phrases:**
- "Spent 25 euros on groceries"
- "25 euros groceries"
- "Paid 15 for transport"

The app will automatically:
- Extract amount
- Detect category (groceries, bills, transport, home, extra)
- Fill description

**Fallback:** If Google Speech API fails, the app falls back to browser-native Web Speech API.

## 🔒 Security

### Environment Variables
**IMPORTANT:** Never commit your `.env` file to version control. All sensitive configuration must be provided via environment variables.

The application requires the following environment variables (see `.env.example`):
- `VITE_FIREBASE_API_KEY` - Firebase API Key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase Auth Domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase Project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase Storage Bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase Messaging Sender ID
- `VITE_FIREBASE_APP_ID` - Firebase App ID
- `VITE_GOOGLE_SPEECH_API_KEY` - (Optional) Google Speech-to-Text API Key

### ⚠️ API Key Security

**CRITICAL:** Since this is a frontend application, API keys are exposed in the client-side code. You **MUST** restrict your API keys in Google Cloud Console to prevent unauthorized usage:

1. **For Google Speech-to-Text API Key:**
   - Go to [Google Cloud Console - API Credentials](https://console.cloud.google.com/apis/credentials)
   - Select your API key
   - Under "API restrictions", restrict to "Cloud Speech-to-Text API" only
   - Under "Application restrictions", add your domain(s):
     - HTTP referrers: `https://yourdomain.com/*`
     - Or specific paths: `https://yourdomain.com/peronciolillo-home-assistant/*`
   - Save changes

2. **For Firebase API Key:**
   - Firebase API keys are designed to be public, but you should:
     - Configure Firebase Security Rules properly (see Firestore Security Rules section)
     - Enable App Check in Firebase Console for additional protection
     - Monitor usage in Firebase Console

**Why this matters:** Without restrictions, anyone can use your API keys, leading to unexpected charges and security risks.

### Firestore Security Rules
Firestore and Storage security rules are configured to:
- Allow users to read/write their own data
- Allow household members to access shared household data
- Prevent unauthorized access
- Validate household membership for all operations

See `FIREBASE-SETUP-GUIDE.md` for rule configuration and `firestore.rules` for the complete rule set.

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **UI:** Material-UI (MUI)
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Build:** Vite
- **Voice:** Google Cloud Speech-to-Text API
- **Date:** date-fns

## 📝 Notes

- Default household name: "Our Home"
- Currency: EUR
- Timezone: Europe/Dublin
- Expenses are automatically split equally between household members

## 🐛 Troubleshooting

**Voice input not working:**
- Check browser microphone permissions
- Verify `VITE_GOOGLE_SPEECH_API_KEY` is set in `.env`
- Check browser console for errors

**Firebase errors:**
- Verify all Firebase config variables are set in `.env`
- Check Firestore security rules are published
- Ensure Authentication methods are enabled in Firebase Console

**Can't join household:**
- Check invite code is correct (case-sensitive)
- Verify invite code hasn't expired (7 days)
- Ensure you're not already a member

