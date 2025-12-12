// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Firebase config from environment variables
// All configuration values must be provided via environment variables
// See .env.example for required variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate that all required environment variables are present
// Only throw error in development mode - in production, config might be provided differently
if (import.meta.env.DEV && (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId)) {
  console.warn(
    '⚠️  Missing Firebase configuration. Some features may not work. ' +
    'Set VITE_FIREBASE_* environment variables in your .env file. ' +
    'See .env.example for reference.'
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase App Check for API key protection
// App Check protects your backend resources from abuse
// Even if someone has your API key, they cannot access resources without a valid App Check token
if (typeof window !== 'undefined') {
  try {
    // Get reCAPTCHA site key from environment or use default
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LfXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // Replace with your reCAPTCHA v3 site key
    
    // Initialize App Check with reCAPTCHA v3
    // In development, App Check uses a debug token (see Firebase Console > App Check > Apps)
    // In production, it uses reCAPTCHA v3 tokens
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true
    });
    
    console.log('✅ Firebase App Check initialized');
  } catch (error) {
    // App Check is optional - log warning but don't break the app
    console.warn('⚠️ Firebase App Check initialization failed:', error);
    console.warn('   App will work without App Check, but API key protection is reduced');
  }
}

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;