# Environment Variables Setup

Create a `.env` file in the project root with the following content:

```env
# Firebase Configuration
# IMPORTANT: Replace these placeholders with your actual Firebase credentials
# Get these values from Firebase Console > Project Settings > General > Your apps
VITE_FIREBASE_API_KEY=your-firebase-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Firebase Cloud Messaging (FCM) VAPID Key
# Get this from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
# Click "Generate key pair" if you don't have one yet
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here

# Google Cloud Speech-to-Text API Key (Optional)
# Get your API key from: https://console.cloud.google.com/apis/credentials
# IMPORTANT: Restrict this API key to your domain in Google Cloud Console
VITE_GOOGLE_SPEECH_API_KEY=your-google-speech-api-key-here
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

