# Cloudinary Setup Guide

## What is Cloudinary?

Cloudinary is a cloud-based image and video management platform. It's **free** for personal use with:
- 25GB monthly bandwidth
- Unlimited storage (up to 25GB)
- Automatic image optimization
- Fast CDN delivery globally
- Easy image upload and management

## Step 1: Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up Free" (orange button)
3. Choose your preferred signup method (Google, GitHub, or email)
4. Fill in your details
5. ✅ Done! It's completely free

## Step 2: Get Your Cloud Name

1. Log in to your Cloudinary Dashboard
2. In the top-right, you'll see your **Cloud Name**
3. Copy it (looks like: `dtf1x2y8k`)
4. Keep it safe - you'll need it soon

## Step 3: Create an Upload Preset

An Upload Preset allows your app to upload images without exposing your full API key.

1. In your Cloudinary Dashboard, click **Settings** (gear icon)
2. Go to **Upload** tab
3. Scroll down to **Upload presets**
4. Click **Add upload preset** (or **Create preset**)
5. Fill in the form:
   - **Preset name**: `portfolio` (or any name)
   - **Folder**: `portfolio/uploads` (optional, for organization)
   - **Signing mode**: `Unsigned` (allows frontend uploads)
6. Click **Save**

## Step 4: Configure Your Portfolio

1. Open `.env.local` in your portfolio root directory

2. Fill in your credentials:
```
VITE_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

Example:
```
VITE_CLOUDINARY_CLOUD_NAME=dtf1x2y8k
VITE_CLOUDINARY_UPLOAD_PRESET=portfolio
```

3. **Important**: Never commit `.env.local` to Git (it's in .gitignore automatically)

## Step 5: Restart Development Server

After updating `.env.local`, restart your development server:

```bash
npm run dev
```

The changes won't take effect until you restart!

## Using the Upload Feature

### In Projects Section:
1. Click "+ Add Project"
2. Fill in title, description, and link
3. For the image, either:
   - **Paste a URL** in the "Image URL" field, OR
   - **Click "📸 Upload Image"** to upload from your computer

### In Photography Section:
1. Click "+ Add Work"
2. Fill in title, description, and category
3. For the image, either:
   - **Paste a URL**, OR
   - **Click "📸 Upload Image"** to upload directly

## Troubleshooting

### "Cloudinary not configured" Error

**Problem**: You see a warning when trying to upload

**Solution**:
1. Check `.env.local` exists in your project root
2. Verify both values are filled in (not `your_cloud_name_here`)
3. Make sure you restarted the dev server after changing `.env.local`
4. Check for typos in your Cloud Name or Upload Preset

### Upload Button Shows Gray/Disabled

**Problem**: The upload widget isn't working

**Solution**:
1. Open browser console (F12 or right-click → Inspect → Console)
2. Look for error messages
3. Verify Cloud Name and Upload Preset in `.env.local`
4. Make sure Upload Preset mode is set to "Unsigned" in Cloudinary Dashboard

### Images Not Showing in Gallery

**Problem**: Image uploads but doesn't appear

**Solution**:
1. Check if the upload completed (you should see success notification)
2. Verify the image URL is valid in the browser
3. Try refreshing the page
4. Check browser console for any errors

## Advanced: Organizing Images

In Cloudinary Dashboard, you can:

1. **Set a folder structure**:
   - Go to Settings → Upload
   - Edit your Upload Preset
   - Set **Folder**: `portfolio/projects` or `portfolio/photos`

2. **Manage uploaded images**:
   - Go to **Media Library** in Dashboard
   - View all your uploaded images
   - Delete, rename, or organize them
   - Get image URLs from here

## Free Tier Limits

Cloudinary Free includes:
- ✅ 25GB monthly bandwidth
- ✅ Unlimited images (up to 25GB storage)
- ✅ Automatic optimization
- ✅ CDN delivery
- ❌ Video transformations (need paid plan)

**Note**: For a personal portfolio, 25GB/month is typically more than enough unless you have millions of visitors!

## Upgrading Later

When you grow beyond free tier limits:

1. Manual upload: Manually upload images in your code
2. Cloud Storage: Use AWS S3, Google Cloud Storage
3. Next.js Image Optimization: Switch to Next.js for built-in image CDN
4. Vercel Blob: Use Vercel's native storage (if deployed on Vercel)

## Security Notes

- Your **Cloud Name** is public (it's in the browser)
- Your **Upload Preset** is safe when set to "Unsigned"
- **API Key**: Keep secret! Only use on backend
- Never commit `.env.local` to Git (already in .gitignore)

## Environment Variables Explained

```
VITE_CLOUDINARY_CLOUD_NAME      = Your account identifier
VITE_CLOUDINARY_UPLOAD_PRESET   = Allows uploads without API key
VITE_                           = Prefix makes it accessible in browser
```

## Next Steps

1. ✅ Create Cloudinary account
2. ✅ Get Cloud Name
3. ✅ Create Upload Preset
4. ✅ Fill in `.env.local`
5. ✅ Restart dev server
6. ✅ Test upload in Projects section
7. ✅ Test upload in Photography section
8. Deploy to Vercel with your `.env.local` values

## Useful Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload Presets Guide](https://cloudinary.com/documentation/upload_presets)
- [Image Optimization](https://cloudinary.com/documentation/transformation_reference)
- [Free Tier Details](https://cloudinary.com/pricing)

## Help & Support

If you have issues:

1. Check Cloudinary Dashboard → Logs
2. Check browser console (F12)
3. Verify `.env.local` is correct
4. Try uploading in Cloudinary Dashboard directly to test
5. Check Cloudinary status page

---

**Last Updated**: March 2026
**Portfolio Version**: 1.0
