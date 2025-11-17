# Firebase Setup Guide - Step by Step

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: **`peronciolillo-home-assistant`** (or your preferred name)
4. Click **Continue**
5. **Disable Google Analytics** (optional, we don't need it for MVP) or enable if you want
6. Click **Create project**
7. Wait for project creation (30-60 seconds)
8. Click **Continue**

## Step 2: Enable Authentication

1. In Firebase Console, click **Authentication** in the left menu
2. Click **Get started**
3. Click **Sign-in method** tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle **Enable** to ON
   - Click **Save**
5. Enable **Google**:
   - Click on "Google"
   - Toggle **Enable** to ON
   - Enter project support email (your email)
   - Click **Save**

## Step 3: Create Firestore Database

1. Click **Firestore Database** in the left menu
2. Click **Create database**
3. Select **Start in test mode** (we'll add security rules later)
4. Choose location: **europe-west** (or closest to Ireland)
5. Click **Enable**

## Step 4: Enable Storage

1. Click **Storage** in the left menu
2. Click **Get started**
3. Select **Start in test mode**
4. Click **Next**
5. Choose location: **europe-west** (same as Firestore)
6. Click **Done**

## Step 5: Get Firebase Config

1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Click **Project settings**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`) to add a web app
5. Register app:
   - App nickname: **Peronciolillo Home Assistant**
   - Check **"Also set up Firebase Hosting"** (optional, for later)
   - Click **Register app**
6. **Copy the Firebase configuration object** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "peronciolillo-home-assistant.firebaseapp.com",
  projectId: "peronciolillo-home-assistant",
  storageBucket: "peronciolillo-home-assistant.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

## Step 6: Update Firebase Config in Code

1. Open `src/services/firebase.ts`
2. Replace the placeholder config with your actual config from Step 5
3. Save the file

## Step 7: Set Up Firestore Security Rules

1. In Firebase Console, go to **Firestore Database**
2. Click **Rules** tab
3. Replace the rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Households: members can read, creators can write
    match /households/{householdId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid in resource.data.members;
    }
    
    // Expenses: household members can read, creators can write
    match /expenses/{expenseId} {
      allow read: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/households/$(resource.data.householdId)).data.members;
      allow create: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/households/$(request.resource.data.householdId)).data.members;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.createdBy;
    }
    
    // Shopping lists: household members can read/write
    match /shoppingLists/{listId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/households/$(resource.data.householdId)).data.members;
    }
    
    // Tasks: household members can read/write
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/households/$(resource.data.householdId)).data.members;
    }
  }
}
```

4. Click **Publish**

## Step 8: Set Up Storage Security Rules

1. In Firebase Console, go to **Storage**
2. Click **Rules** tab
3. Replace the rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /receipts/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Click **Publish**

## Step 9: Enable Google Cloud Speech-to-Text API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (or create API key in Firebase)
3. Go to **APIs & Services** → **Library**
4. Search for **"Cloud Speech-to-Text API"**
5. Click on it and click **Enable**
6. Go to **APIs & Services** → **Credentials**
7. Click **Create Credentials** → **API Key**
8. **Restrict the API key** (recommended):
   - Click on the API key
   - Under "API restrictions", select **"Restrict key"**
   - Check **"Cloud Speech-to-Text API"**
   - Click **Save**
9. **Copy the API key** - you'll need it for the app

## Step 10: Add API Key to Environment

1. Create `.env` file in project root:
```
VITE_GOOGLE_SPEECH_API_KEY=your_api_key_here
```

2. Update `vite.config.ts` to use env variables (already configured by default)

## ✅ You're Done!

Now you can:
1. Run `npm install` in the project directory
2. Run `npm run dev` to start the development server
3. Test the authentication and household setup

## Next Steps

After Firebase is set up, we'll implement:
1. Expense logging with voice input (Google Cloud Speech-to-Text)
2. Shopping list
3. Dashboard

