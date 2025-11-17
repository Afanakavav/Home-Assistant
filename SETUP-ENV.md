# Environment Variables Setup

Create a `.env` file in the project root with the following content:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyB5VI0cWCHsLEju4UfxvSolbMgUEQ0CEso
VITE_FIREBASE_AUTH_DOMAIN=peronciolillo-home-assistant.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=peronciolillo-home-assistant
VITE_FIREBASE_STORAGE_BUCKET=peronciolillo-home-assistant.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=505439281340
VITE_FIREBASE_APP_ID=1:505439281340:web:e39a71d8fa10fc9a1530b9

# Firebase Cloud Messaging (FCM) VAPID Key
# Get this from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
# Click "Generate key pair" if you don't have one yet
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here

# Google Cloud Speech-to-Text API Key
VITE_GOOGLE_SPEECH_API_KEY=AIzaSyAhQaKnqzFyaQ8cpd2AyqZ7cXKZnHLCDP8
```

## How to Get Firebase VAPID Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **peronciolillo-home-assistant**
3. Click on the gear icon ⚙️ > **Project Settings**
4. Go to the **Cloud Messaging** tab
5. Scroll down to **Web Push certificates** section
6. If you don't have a key pair:
   - Click **Generate key pair**
   - Copy the generated key
7. If you already have one, copy the existing key
8. Paste it in your `.env` file as `VITE_FIREBASE_VAPID_KEY`

**Note:** The `.env` file is gitignored for security. Create it manually in the project root.

