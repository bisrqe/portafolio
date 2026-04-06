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
      // Implementation note:
      // Currently: false (password-protected on frontend)
      // Future: Use Firebase Authentication
      // return request.auth != null && hasAdminRole();
      return false;
    }
    
    function hasAdminRole() {
      return request.auth.token.admin == true;
    }
  }
}
```

### Current Implementation (Frontend-Protected):
Since the app doesn't use Firebase Authentication yet, admin protection is handled on the frontend with:
- Password verification in `AdminDashboard.jsx`
- LocalStorage token management
- Route protection in `App.jsx`

---

## 2. Firebase Storage Security Rules

### Rule Strategy:
- ✅ **Portfolio PDFs:** Public read (CVs downloadable)
- ✅ **Write Protection:** Disabled (uploaded via frontend with password)

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
    
    // Image folder (for future use if needed)
    match /portfolio/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Helper function
    function isAdmin() {
      // Currently: false (password-protected on frontend)
      // Future: Use Firebase Authentication
      return false;
    }
  }
}
```

---

## 3. Transition to Firebase Authentication (Recommended)

### Implementation Steps:

#### Step 1: Enable Authentication
```javascript
// In firebase.js
import { getAuth } from 'firebase/auth'
export const auth = getAuth(app)
```

#### Step 2: Create Admin Role Claims
```javascript
// Admin setup (run once in Firebase Console)
// Custom Claims:
{
  "admin": true
}
```

#### Step 3: Update Security Rules
```
function isAdmin() {
  return request.auth != null && 
         request.auth.token.admin == true;
}
```

#### Step 4: Admin Login Component
```javascript
// Replace password with email/password authentication
import { signInWithEmailAndPassword } from 'firebase/auth'

const handleAdminLogin = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password)
    setIsAdmin(true)
  } catch (error) {
    alert('Login failed: ' + error.message)
  }
}
```

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
