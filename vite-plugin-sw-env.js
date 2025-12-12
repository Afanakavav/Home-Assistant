// Vite plugin to inject environment variables into service worker files
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

export function swEnvPlugin() {
  return {
    name: 'sw-env-plugin',
    buildStart() {
      // This runs during build to inject env vars into service worker
      const swTemplatePath = resolve(__dirname, 'public/firebase-messaging-sw.template.js');
      
      if (!existsSync(swTemplatePath)) {
        console.warn('⚠️  firebase-messaging-sw.template.js not found. Service worker will not be configured.');
        return;
      }
      
      // Read template
      let swContent = readFileSync(swTemplatePath, 'utf-8');
      
      // Replace placeholders with environment variables
      const envVars = {
        VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY || '',
        VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || '',
        VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
        VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID || '',
      };
      
      // Validate required env vars
      const missingVars = Object.entries(envVars)
        .filter(([key, value]) => !value)
        .map(([key]) => key);
      
      if (missingVars.length > 0) {
        // Only show warning in development mode or if explicitly requested
        // In production builds, these will be empty but the app will still work
        // if Firebase config is provided at runtime or via other means
        if (process.env.NODE_ENV === 'development' || process.env.SHOW_ENV_WARNINGS === 'true') {
          console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
          console.warn('   Service worker will be generated with empty values.');
          console.warn('   To set these, copy .env.example to .env and fill in your Firebase credentials.');
        }
      }
      
      // Replace placeholders
      swContent = swContent.replace(/\$\{VITE_FIREBASE_API_KEY\}/g, envVars.VITE_FIREBASE_API_KEY);
      swContent = swContent.replace(/\$\{VITE_FIREBASE_AUTH_DOMAIN\}/g, envVars.VITE_FIREBASE_AUTH_DOMAIN);
      swContent = swContent.replace(/\$\{VITE_FIREBASE_PROJECT_ID\}/g, envVars.VITE_FIREBASE_PROJECT_ID);
      swContent = swContent.replace(/\$\{VITE_FIREBASE_STORAGE_BUCKET\}/g, envVars.VITE_FIREBASE_STORAGE_BUCKET);
      swContent = swContent.replace(/\$\{VITE_FIREBASE_MESSAGING_SENDER_ID\}/g, envVars.VITE_FIREBASE_MESSAGING_SENDER_ID);
      swContent = swContent.replace(/\$\{VITE_FIREBASE_APP_ID\}/g, envVars.VITE_FIREBASE_APP_ID);
      
      // Write to public folder (will be copied to dist during build)
      const swPath = resolve(__dirname, 'public/firebase-messaging-sw.js');
      writeFileSync(swPath, swContent, 'utf-8');
    },
  };
}

