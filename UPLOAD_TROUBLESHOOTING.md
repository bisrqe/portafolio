# Upload Troubleshooting Guide

If you see "Upload failed" errors when uploading projects, photos, or PDFs, follow this guide to diagnose and fix the issue.

## Quick Checklist

- [ ] Development server restarted after adding `.env.local` variables
- [ ] `.env.local` file exists and has correct values
- [ ] Internet connection is stable
- [ ] File size is reasonable (< 50MB)
- [ ] File type matches requirements (images/videos for projects, PDFs for CV)
- [ ] Cloudinary upload preset is marked as "Unsigned"

---

## Common Issues & Solutions

### 1. "Cloudinary not configured" Error

**Problem:** Upload button shows config warning immediately

**Solution:**
```bash
# Check .env.local file exists
cat .env.local

# Should contain:
VITE_CLOUDINARY_CLOUD_NAME=dobiuvljw
VITE_CLOUDINARY_UPLOAD_PRESET=personal-portfolio

# If missing, add from Cloudinary dashboard
```

**Fix:**
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy your Cloud Name
3. Create upload preset (Settings → Upload → Add upload preset)
4. Set preset to "Unsigned" for unauthenticated uploads
5. Add both to `.env.local`
6. **Restart dev server:** `npm run dev`

---

### 2. Cloudinary Upload Fails (403, 400, 401)

**Problem:** Error shows status code like "400 - invalid upload preset"

**Cause:** Upload preset name mismatch or misconfigured

**Fix:**
```
1. Verify preset name in Cloudinary Console matches VITE_CLOUDINARY_UPLOAD_PRESET
2. Ensure preset is set to "Unsigned"
3. Set allowed file types: Images, Videos, Raw (for PDFs)
4. Check file size limit in preset settings
5. Restart dev server
```

**Debug:** Check browser console (F12) for exact error message

---

### 3. Firebase Storage PDF Upload Fails

**Problem:** "Upload failed: Permission denied" or "Need authentication"

**Cause:** Firebase Storage security rules too restrictive

**Solution:** Apply correct rules to Firebase Console:

```
Go to:
Firebase Console → Storage → Rules

Paste:
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /portfolio_pdfs/{allPaths=**} {
      allow read: if true;
      allow write: if true;  // Temporarily allow for testing
      allow delete: if true;
    }
  }
}

Click Publish
```

For production security, change `write: if true` to:
```
write: if request.auth != null && request.auth.token.admin == true;
```

---

### 4. Upload Stuck on "⏳ Uploading..." Forever

**Problem:** File never finishes uploading or shows error

**Causes:**
- Network timeout (60 seconds for Cloudinary, 30 for Firebase)
- File too large
- Network connection dropped
- Server error

**Fix:**
1. Close browser DevTools (can slow uploads)
2. Try smaller file first (< 5MB)
3. Check internet speed (speedtest.net)
4. Check browser console for specific error (F12)
5. Try different browser if possible

---

### 5. "No internet connection" Error

**Problem:** Upload fails with network error

**Fix:**
1. Check WiFi/internet connection: `ping google.com`
2. Check if firewall blocking Cloudinary/Firebase
3. Try uploading from different network if available
4. Restart router if needed

---

### 6. Wrong File Format Error

**Problem:** "Please upload a PDF file" when trying to upload CV

**Fix:**
- CV upload (FirebaseUpload) only accepts `.pdf` files
- Project/photo uploads (CloudinaryUpload) accept images and videos
- Ensure file extension matches actual format

---

## Browser Console Debugging (F12)

Open browser console to see detailed error messages:

**For Cloudinary:**
```
Starting Cloudinary upload: filename.jpg 245KB
Upload endpoint: https://api.cloudinary.com/v1_1/dobiuvljw/image/upload
✅ Upload successful: portfolio/abc123
```

**For Firebase:**
```
Starting PDF upload: CV.pdf 520KB
Uploading PDF to Storage: portfolio_pdfs/1617234567_CV.pdf
✅ PDF uploaded to Firebase Storage
```

**If errors appear:**
- Search error message below for solutions
- Try the suggested fix
- Restart dev server

---

## Configuration Verification

### Cloudinary Setup
```bash
# 1. Check .env.local
grep CLOUDINARY .env.local

# 2. Cloudinary Console → Settings → API Keys
# Verify Cloud Name matches VITE_CLOUDINARY_CLOUD_NAME

# 3. Cloudinary Console → Settings → Upload
# Check upload preset exists and is Unsigned
```

### Firebase Setup
```bash
# 1. Check .env.local
grep FIREBASE .env.local

# 2. Firebase Console → Project Settings
# Verify Project ID and API Key match

# 3. Firebase Console → Storage
# Check Rules are published (no error message)

# 4. Firebase Console → Firestore
# Check Rules allow public read
```

---

## Network Issues

Check if Cloudinary/Firebase APIs are reachable:

```bash
# Test Cloudinary
curl -I https://api.cloudinary.com/v1_1/

# Test Firebase
curl -I https://firebasestorage.googleapis.com/

# If these fail, firewall is blocking
```

---

## Still Having Issues?

### Collect Debug Info
1. Open browser console (F12)
2. Try uploading a small image
3. Copy all console logs
4. Check `.env.local` file exists
5. Restart dev server: `npm run dev`

### Check Specific Configuration
```javascript
// In browser console, check if vars are loaded:
console.log(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME)
// Should show: dobiuvljw

console.log(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
// Should show: personal-portfolio
```

---

## File Size Limits

- **Cloudinary:** 100MB per file (free tier)
- **Firebase Storage:** 5GB per file (generous)
- **Recommended max:** 10-50MB for web uploads

Compress images before uploading if larger than 5MB.

---

## Environment Variables Reference

```env
# .env.local file

# Cloudinary (Images & Videos)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name

# Firebase (PDFs & Backup)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Admin
VITE_ADMIN_PASSWORD=your_password
```

---

## Getting Help

1. Check this guide first
2. Review error message in browser console
3. Verify `.env.local` configuration
4. Try in incognito mode (bypass cache)
5. Restart dev server and browser

For persistent issues, check error logs and ensure:
- Credentials are correct
- Security rules are published
- Network connection is stable
- File format matches requirements
