# 🚀 Deploy to Vercel - Step-by-Step Guide

Your portfolio is ready to deploy! Vercel will automatically detect your Vite setup and deploy it.

## Quick Deploy (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy from your project directory
```bash
cd /Users/bisrqe/Documents/Personal\ Projects/Portafolio
vercel
```

### Step 3: Follow the prompts
- **Which scope?** → Select your Vercel account
- **Project name?** → Press Enter (uses `portafolio`)
- **Link existing project?** → Type `n` (no - creating new)
- **Which directory?** → Press Enter (`.` current directory)

Vercel will auto-detect your Vite configuration and deploy!

---

## Web Dashboard Method

### Step 1: Go to Vercel Dashboard
- Visit: https://vercel.com
- Sign in with GitHub (if you haven't already)

### Step 2: Import Your Project
1. Click **"New Project"** (or **"Add New"**)
2. Select **"Import Git Repository"**
3. Find and click **`bisrqe/portafolio`**
4. Click **"Import"**

### Step 3: Configure Project
Vercel should auto-detect everything:
- **Framework**: Vite ✓
- **Build Command**: `npm run build` ✓
- **Output Directory**: `dist` ✓

### Step 4: Environment Variables (Important!)
Before deploying, add your Cloudinary credentials:

1. Click **"Environment Variables"**
2. Add two variables:

   **Name:** `VITE_CLOUDINARY_CLOUD_NAME`
   **Value:** `dobiuvljw`

   **Name:** `VITE_CLOUDINARY_UPLOAD_PRESET`
   **Value:** `personal-portfolio`

3. Click **"Deploy"**

---

## After Deployment

Once deployment completes:

✅ **Your portfolio is live!**
- You'll see a URL like: `https://portafolio.vercel.app`
- Click the link to view your live portfolio

### Automatic Updates
Every time you:
1. Make changes locally
2. `git push origin main`

→ Vercel automatically rebuilds and deploys!

---

## Troubleshooting

### Build Failed

**Check logs:**
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Go to **"Deployments"** tab
4. Click failed deployment → **"Logs"**

**Common issues:**
- Missing dependencies: `npm install` locally and push
- Wrong build command: Should be `npm run build`
- Port conflict: Vercel handles this automatically

### Upload Button Not Working on Live Site

**Issue:** Cloudinary upload fails
**Solution:** Check environment variables are set correctly

1. Go to project **Settings** → **Environment Variables**
2. Verify both variables are correct:
   - `VITE_CLOUDINARY_CLOUD_NAME=dobiuvljw`
   - `VITE_CLOUDINARY_UPLOAD_PRESET=personal-portfolio`
3. Redeploy: Click **Deployments** → Three dots → **Redeploy**

### Site Shows Blank Page

**Solution:**
1. Open browser DevTools (F12)
2. Check the **Console** tab for errors
3. Common fixes:
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Clear browser cache
   - Check file loads in Network tab

---

## Custom Domain (Optional)

Want `myportfolio.com` instead of `portafolio.vercel.app`?

### If you own a domain:
1. Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain: `myportfolio.com`
4. Update your domain's DNS records (Vercel shows exact steps)
5. Wait 24-48 hours for DNS to propagate

### If you need a domain:
Popular registrars (cheapest options):
- **Namecheap**: ~$0.88/year first year
- **GoDaddy**: ~$1.99/year first year
- **Google Domains**: ~$12/year

---

## Production Settings

### Vercel is already optimized for:
✅ Global CDN (fast worldwide delivery)
✅ Automatic HTTPS (secure connection)
✅ Automatic deployments (git push = live)
✅ Image optimization (if you use Vercel's Image component)
✅ Analytics (free tier included)

### Monitor Your Site:
1. **Vercel Analytics**: Dashboard → Your project → **Analytics**
2. **Vitals**: Check Core Web Vitals
3. **Error Tracking**: See any JavaScript errors in production

---

## Next Steps

### Immediate ✅
- [ ] Deploy to Vercel (CLI or Dashboard)
- [ ] Test upload button with Cloudinary
- [ ] Share your live URL!

### Soon 🎯
- Add more projects
- Upload photography/videography
- Customize colors or add more sections

### Later 📝
- Add custom domain
- Set up Google Analytics
- Monitor performance metrics

---

## Useful Commands

```bash
# View deployment logs
vercel logs

# Redeploy last commit
vercel --prod

# View live site
vercel inspect

# Remove project
vercel remove
```

---

## Getting Help

If you run into issues:

1. **Check Vercel Logs**: Dashboard → Deployments → Failed build → View logs
2. **Check Browser Console**: F12 → Console tab
3. **Restart Dev Server**: Stop and run `npm run dev` again
4. **Verify Environment Variables**: All credentials in .env.local and Vercel dashboard

---

## Security Notes

✅ Your `.env.local` file is in `.gitignore` (not committed)
✅ Set environment variables in Vercel dashboard (not in git)
✅ Cloudinary upload preset is safe (unsigned mode)
✅ No API keys exposed in frontend code

---

**Last Updated**: March 2026
**Status**: Ready for deployment! 🎉
