# Firebase Security Rules for Portfolio Application

## Overview
This document provides security rules for Firestore and Firebase Storage for the personal portfolio application.

### Data Structure:
- **Public data:** Projects, Leadership, Photos (displayed on website)
- **Admin data:** All CRUD operations for portfolio items
- **Files:** PDFs (CV) stored in Firebase Storage
- **Backup:** Base64 encoded files in Firestore (fallback)

---

## 1. Firestore Security Rules

### Rule Strategy:
- ✅ **Public Read:** Anyone can read portfolio collections
- ✅ **Public Write:** Disabled (admin only via frontend password)
- ✅ **Admin Collections:** Protected for future admin auth implementation

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Public portfolio data - readable by everyone
    match /projects/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /leadership/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /photos/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /homeContent/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Backup stored files (base64)
    match /portfolio_files/{document=**} {
      allow read: if isAdmin();
      allow write: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Helper function for admin checks
    function isAdmin() {
      // Updated: Now uses Firebase Authentication
      return request.auth != null && request.auth.token.admin == true;
    }
    
    function hasAdminRole() {
      return request.auth.token.admin == true;
    }
  }
}
```

### Current Implementation (Firebase Authentication Enabled):
The app now uses **Firebase Authentication with admin custom claims** for secure verification:
- ✅ Firestore rules check `request.auth.token.admin`
- ✅ Storage rules require authenticated admin
- ✅ Frontend password still works as backup
- ⚠️ Admin custom claims must be set in Firebase Console

**Setup Steps:**
1. Go to Firebase Console → Authentication → Users
2. Select admin user → Add Custom Claim: `{admin: true}`
3. Deploy updated security rules
4. Frontend continues to work with existing password until auth is integrated

---

## 2. Firebase Storage Security Rules

### Rule Strategy:
- ✅ **Portfolio PDFs:** Public read (CVs downloadable)
- ✅ **Write Protection:** Admin-only with Firebase Auth
- ✅ **Delete Protection:** Admin-only

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // PDF files (CV documents)
    match /portfolio_pdfs/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Image folder (for future use)
    match /portfolio/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Helper function
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### Current Status:
- ✅ Rules require Firebase Authentication
- ✅ Admin custom claims enabled
- ✅ Public read access maintained
- ⚠️ Uploads currently handled via frontend (password still works)

---

## 3. Firebase Authentication Migration Status

### ✅ Rules Updated (April 7, 2026)
Security rules now authenticate with Firebase Authentication and check for `admin` custom claim.

### Implementation Checklist:

- [x] Firestore rules updated to use `request.auth.token.admin`
- [x] Storage rules updated to require admin authentication
- [ ] Set admin custom claims in Firebase Console
- [ ] (Optional) Add Firebase Auth UI to frontend admin login
- [ ] (Optional) Update AdminDashboard to use Firebase Email/Password auth

### To Complete Setup:

**In Firebase Console:**
1. Go to **Authentication** → **Users**
2. Select your admin user
3. Click **Custom claims** (or ⚙ icon)
4. Add this JSON:
   ```json
   {
     "admin": true
   }
   ```
5. Click **Save**

**Deploy Rules:**
1. Go to **Firestore Database** → **Rules**
2. Copy all content from `FIRESTORE_RULES.txt` into the editor
3. Click **Publish**

Then:
1. Go to **Storage** → **Rules**
2. Copy all content from `FIREBASE_STORAGE_RULES.txt` into the editor
3. Click **Publish**

### Optional: Add Firebase Authentication to Frontend

---

## 4. Current Frontend Security

### AdminDashboard.jsx
- Requires password to access admin features
- Password: `VITE_ADMIN_PASSWORD` from `.env.local`
- UI routing protection: Admin tabs only show if authenticated

### Data Validation
- File size limits on upload
- File type validation (images, PDFs)
- Input sanitization for text fields

---

## 5. Security Checklist

### ✅ Implemented
- [x] Public read access for portfolio data
- [x] Frontend password protection for admin
- [x] File upload validation (type & size)
- [x] PDF storage in Firebase Storage
- [x] Base64 backup in Firestore

### ⚠️ Recommended for Production
- [ ] Migrate to Firebase Authentication
- [ ] Set up admin custom claims
- [ ] Enable HTTPS (handled by Vercel)
- [ ] Environment variables protection (.env.local in .gitignore)
- [ ] Regular backup of Firestore data
- [ ] Monitor Firebase usage/costs

### 🔒 Additional Security Measures
- [ ] Rate limiting on admin endpoints
- [ ] Audit logging for admin actions
- [ ] Two-factor authentication (via Firebase)
- [ ] IP whitelist for admin access

---

## 6. How to Apply These Rules

### In Firebase Console:
1. Go to **Firestore Database** → **Rules**
2. Replace with Firestore rule content above
3. Click **Publish**

Then:
1. Go to **Storage** → **Rules**
2. Replace with Storage rule content above
3. Click **Publish**

### Verification:
- Test public read: Visit `/photography-portfolio`, `/personal-projects`, etc.
- Test write protection: Verify write operations fail unless authenticated

---

## 7. Environment Variables Required

```
# .env.local (already configured)
VITE_FIREBASE_PROJECT_ID=personal-portfolio-e8025
VITE_FIREBASE_API_KEY=***
VITE_FIREBASE_AUTH_DOMAIN=***
VITE_FIREBASE_STORAGE_BUCKET=***
VITE_FIREBASE_MESSAGING_SENDER_ID=***
VITE_FIREBASE_APP_ID=***

# Admin password (frontend only)
VITE_ADMIN_PASSWORD=***
```

---

## Contact & Support
For security issues or updates, review this document regularly and adjust rules based on application needs.
