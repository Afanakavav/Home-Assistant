# Firebase Cloud Messaging (FCM) Setup Guide

This guide explains how to set up Firebase Cloud Messaging for push notifications in Peronciolillo Home Assistant.

## Prerequisites

- Firebase project created
- Firebase app registered in the project

## Step 1: Generate VAPID Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **peronciolillo-home-assistant**
3. Click on the gear icon ⚙️ > **Project Settings**
4. Go to the **Cloud Messaging** tab
5. Scroll down to **Web Push certificates** section
6. If you don't have a key pair:
   - Click **Generate key pair**
   - A key will be generated automatically
7. Copy the generated key (it looks like: `BK...` or `BL...`)

## Step 2: Add VAPID Key to Environment Variables

1. Open your `.env` file in the project root
2. Add the following line:
   ```env
   VITE_FIREBASE_VAPID_KEY=your_copied_vapid_key_here
   ```
3. Replace `your_copied_vapid_key_here` with the key you copied from Firebase Console
4. Save the file

## Step 3: Register Service Worker

The service worker file (`firebase-messaging-sw.js`) is already created in the `public/` folder. 

Make sure it's properly registered. The service worker will be automatically registered when:
- The app is deployed to Firebase Hosting
- Or when running locally with HTTPS (required for service workers)

## Step 4: Test Notifications

1. Build and deploy the app:
   ```bash
   npm run build
   npm run deploy
   ```

2. Open the app in a browser (must be HTTPS or localhost)
3. Navigate to **Plants** or **Vendors** page
4. Grant notification permissions when prompted
5. The app will automatically check for:
   - Plants needing water (every hour)
   - Upcoming maintenance (every hour)

## How It Works

### Browser Notifications (Current Implementation)

The app currently uses **browser native notifications** which work without FCM:
- Works on HTTPS or localhost
- No server-side setup required
- Checks run every hour when pages are open
- Shows notifications for:
  - Plants needing water
  - Upcoming maintenance (within 7 days)

### FCM Push Notifications (Full Implementation)

When `VITE_FIREBASE_VAPID_KEY` is configured:
- The app will request an FCM token
- Notifications can be sent even when the app is closed
- Requires service worker registration
- Can send notifications from server-side code

## Troubleshooting

### Notifications Not Working

1. **Check browser permissions:**
   - Open browser settings
   - Check if notifications are allowed for your site
   - Try resetting permissions and granting again

2. **Check HTTPS:**
   - Service workers and notifications require HTTPS (or localhost)
   - Make sure you're accessing the app via HTTPS

3. **Check VAPID Key:**
   - Verify `VITE_FIREBASE_VAPID_KEY` is set in `.env`
   - Rebuild the app after adding the key: `npm run build`
   - Check browser console for errors

4. **Check Service Worker:**
   - Open browser DevTools > Application > Service Workers
   - Verify the service worker is registered
   - Check for any errors

### VAPID Key Not Found

If you see "VAPID key not configured" in console:
- Make sure `.env` file exists in project root
- Verify `VITE_FIREBASE_VAPID_KEY` is set correctly
- Rebuild the app: `npm run build`
- Restart dev server if running locally

## Next Steps

For server-side push notifications:
1. Set up a Cloud Function to send notifications
2. Use the FCM Admin SDK
3. Schedule notifications based on plant watering dates and maintenance schedules

## Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications Guide](https://web.dev/push-notifications-overview/)
- [Service Workers Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

