# 🔐 Admin Password Protection

Your portfolio now has password-protected admin access. Only you can add, edit, or delete projects and photos!

## How It Works

When someone visits your portfolio:
1. They see your projects and photos
2. They **cannot** see the "Add Project" or "Add Work" buttons
3. A password modal appears if they try to access admin features
4. Only with the correct password can they manage content

Once logged in as admin:
- ✅ See "Add Project" and "Add Work" buttons
- ✅ Can upload images via Cloudinary
- ✅ Can delete items
- ✅ See a "Logout" button

## Default Password

**Default**: `admin123`

**⚠️ CHANGE THIS IMMEDIATELY!**

### Change Your Password

1. Open `.env.local`
2. Find the line: `VITE_ADMIN_PASSWORD=admin123`
3. Replace `admin123` with something secure
4. Restart dev server: `npm run dev`

Example secure password:
```
VITE_ADMIN_PASSWORD=MySecurePass2024!
```

### On Vercel

1. Go to: https://vercel.com/dashboard
2. Click your project → **Settings** → **Environment Variables**
3. Add/Edit: `VITE_ADMIN_PASSWORD` = `your_secure_password`
4. **Redeploy**: Deployments → Three dots → **Redeploy**

## Password Requirements

**Good passwords:**
- ✅ At least 8 characters
- ✅ Mix of letters, numbers, symbols
- ✅ Not your name or birthday
- ✅ Something you'll remember

**Examples:**
- `Portfolio#Sky2024`
- `Purple&Dreams@123`
- `MyArt*Works$2024`

## Testing Locally

1. Start dev server: `npm run dev`
2. Go to **Projects** section
3. A modal should appear asking for password
4. Enter: `admin123` (default)
5. You should see "Add Project" button

## How to Logout

- Click the **🔓 Logout** button in the header
- The modal appears again
- You need to login again to add/delete

## Security Notes

### What's Protected:
✅ Add projects
✅ Delete projects
✅ Add photos
✅ Delete photos
✅ Upload images

### What's Public:
✅ View all projects
✅ View all photos
✅ Click project links
✅ See images

### Security Considerations:

1. **Password is in frontend code** - Anyone can view it in your hosted code
   - This is fine for portfolios (you want people to see content)
   - Just don't use a password you use elsewhere
   - Treat it like a "hint" not a bank password

2. **Better security option** - Firebase Authentication
   - If you need true security, we can add Google/Email login
   - More complex but much more secure
   - Good for private portfolios

3. **Typical use** - Password just prevents accidental deletion
   - Keeps casual visitors from messing with your content
   - Not meant to prevent determined hackers

## Changing Password After Deployment

1. Update `.env.local` locally
2. Push to GitHub: `git add -A && git commit -m "change admin password" && git push`
3. Vercel auto-redeploys
4. New password takes effect immediately

## Forgot Your Password?

Just change it in `.env.local` or Vercel environment variables, then redeploy!

## Next Steps

1. ✅ Change `VITE_ADMIN_PASSWORD` to something secure
2. ✅ Add to Vercel environment variables
3. ✅ Redeploy on Vercel
4. ✅ Test login with new password

---

**Security Level**: Medium (prevents accidental changes, not malicious attacks)
**Good For**: Personal portfolios, project showcases
**Not Good For**: Sensitive data, private galleries

If you need true security (Google login, authentication), let me know!
