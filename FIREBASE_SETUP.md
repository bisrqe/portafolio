# 🔥 Firebase Setup Guide - Cloud Database for Your Portfolio

Your portfolio now uses **Firebase Firestore** as a cloud database. This means:

✅ Anyone visiting your site sees your projects and photos
✅ Your data is stored in the cloud (not just locally)
✅ Real-time updates when you add/delete items
✅ Free tier includes everything you need

## Step 1: Create Firebase Project

1. Go to: **https://firebase.google.com**
2. Click **"Get Started"** (or go to Console)
3. Click **"Create a project"**
4. Enter project name: `personal-portfolio`
5. Click **"Continue"**
6. Accept the defaults
7. Click **"Create project"**
8. Wait 1-2 minutes for creation

## Step 2: Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** (or "Build" → "Firestore Database")
2. Click **"Create database"**
3. Choose: **Start in test mode**
   - This allows anyone to read/write (perfect for portfolio)
4. Choose region closest to you
5. Click **"Create"**
6. Wait for it to initialize

## Step 3: Get Your Firebase Config

1. In Firebase Console, click the **gear icon** (Settings)
2. Select **"Project settings"**
3. Scroll to **"Your apps"** section
4. Click the **"Web"** icon (or **"</>"** code icon)
5. Copy the entire `firebaseConfig` object

It looks like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
}
```

## Step 4: Add to Your Project

1. Open `.env.local` in your project
2. Add these variables (copy values from Step 3):

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

3. Keep your Cloudinary variables too!

## Step 5: Test Locally

```bash
npm run dev
```

Now when you:
1. Add a project → It saves to Firebase
2. Reload page → Projects still there
3. Open on different device → Same projects visible!

## Step 6: Deploy to Vercel

1. Add the same Firebase variables to Vercel:
   - Go to: https://vercel.com/dashboard
   - Click your project → **Settings** → **Environment Variables**
   - Add all 6 Firebase variables
   - Add Cloudinary variables (if not already there)

2. Redeploy:
   - Click **Deployments**
   - Click three dots → **Redeploy**

## How It Works

```
Your Browser
    ↓
React App
    ↓
Firebase Firestore (Cloud Database)
    ↓
Anyone can view your portfolio!
```

## Firestore Structure

Your database has two collections:

### `projects` collection
```
{
  id: auto-generated,
  title: "Project name",
  description: "Details",
  link: "https://...",
  image: "https://cloudinary.com/...",
  createdAt: timestamp
}
```

### `photos` collection
```
{
  id: auto-generated,
  title: "Photo name",
  description: "Details",
  category: "photography",
  image: "https://cloudinary.com/...",
  createdAt: timestamp
}
```

## Viewing Your Data in Firebase

1. Go to Firebase Console → **Firestore Database**
2. You'll see your `projects` and `photos` collections
3. Click a collection to see all entries
4. Click an entry to see details
5. You can manually edit/delete from here too

## Security Rules (Already Set)

Your Firestore is in **test mode**, which means:
- Anyone can read your data ✅ (people see your portfolio)
- Anyone can write to your data ⚠️ (anyone could add fake projects)

### To restrict writes (Optional):

1. Go to **Firestore Database** → **Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

This keeps read open but prevents others from adding/deleting.

3. Click **"Publish"**

Then only you can add/delete from the admin panel, but everyone can see the live portfolio.

## Firebase Free Tier Limits

Perfect for personal portfolios:
- ✅ 1GB storage
- ✅ 50,000 reads/day
- ✅ 20,000 writes/day
- ✅ 20,000 deletes/day
- ✅ Real-time updates

(A typical portfolio gets hundreds of views/day, well within limits)

## Troubleshooting

### "Firebase is not configured"
- Check `.env.local` has all 6 variables
- Make sure you restarted `npm run dev`
- Check Firebase Console → This is where data saves

### "Permission denied" error
- Make sure Firestore is in **test mode**
- Go to Firestore → Rules → Check it allows reads/writes
- Restart dev server

### Data not saving
1. Check browser console (F12) for errors
2. Go to Firebase Console → View Firestore data
3. If empty → Firebase config is wrong
4. Check `.env.local` values match exactly

### Projects visible only to you locally
1. Environment variables in Vercel are missing
2. Redeploy after adding to environment variables
3. Check Vercel logs for Firebase initialization errors

## Next Steps

1. ✅ Create Firebase project
2. ✅ Get Firebase credentials
3. ✅ Add to `.env.local`
4. ✅ Test locally (`npm run dev`)
5. ✅ Add to Vercel environment variables
6. ✅ Redeploy to Vercel
7. ✅ Add projects → They appear everywhere!

## Useful Resources

- [Firebase Console](https://console.firebase.google.com)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Security Rules](https://firebase.google.com/docs/firestore/security/start)

## From localStorage to Firestore

The app automatically:
- Reads from Firebase first
- Falls back to localStorage if Firebase unavailable
- Syncs in real-time when data changes

So even if Firebase is briefly down, your site still works!

---

**Last Updated**: March 2026
**Status**: Ready for Firebase! 🚀
