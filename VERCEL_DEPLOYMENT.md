# Vercel Deployment Guide

## Architecture Overview

This React portfolio is optimized for deployment on Vercel with a serverless architecture.

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Platform                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────┐      │
│  │         Edge Network (CDN)                   │      │
│  │  • Global caching                            │      │
│  │  • Image optimization                        │      │
│  └──────────────────────────────────────────────┘      │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────┐      │
│  │      React Static Site (dist folder)         │      │
│  │  • index.html                                │      │
│  │  • JavaScript bundles                        │      │
│  │  • CSS files                                 │      │
│  │  • Assets                                    │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Build Process

### 1. Source Code Push
- Code is pushed to GitHub/GitLab/Bitbucket
- Vercel automatically detects changes

### 2. Build Phase
Vercel executes (as defined in `vercel.json`):
```bash
npm install    # Install dependencies
npm run build  # Build React app with Vite
```

### 3. Output
- Static files generated in `dist/` folder
- Deployed to Vercel's CDN globally

### 4. Deployment
- Files served from nearest edge location
- Zero cold starts
- Automatic HTTPS
- Git integration for automatic deployments

## Key Features

### Edge Caching
- All static assets cached globally
- Instant delivery to users worldwide
- Automatic cache invalidation on redeploys

### Environment
- Zero server maintenance
- Automatic scaling
- No DevOps required

### Observability
- Real-time analytics
- Error tracking
- Performance metrics

## Performance Optimizations

### Already Implemented
1. **Vite Build**: Fast, optimized production builds
2. **Code Splitting**: JavaScript chunks loaded on-demand
3. **CSS Optimization**: Minified and bundled
4. **Image Serving**: Use external URLs for images

### Recommendations
1. **Image Optimization**
   - Use Vercel's Image Optimization (add route handlers if needed)
   - Compress images before uploading
   - Use modern formats (WebP)

2. **Caching Strategy**
   - Static assets cached forever (with hashing)
   - HTML cached for short period (60 seconds)

3. **Monitoring**
   - Check Vercel Analytics dashboard
   - Monitor Core Web Vitals
   - Track error rates

## Deployment Steps

### First Deployment

1. **Connect Repository**
   ```bash
   # Push code to GitHub/GitLab/Bitbucket
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Click "Deploy"

3. **Custom Domain (Optional)**
   - In Vercel dashboard: Settings → Domains
   - Add your custom domain
   - Update DNS records (Vercel provides instructions)

### Subsequent Deployments

- Automatic: Push to main branch → Automatic deployment
- Preview: Push to other branches → Preview deployment

## MongoDB/Firebase Integration (Future)

If you want to add backend functionality:

1. **Option A: Serverless Functions**
   ```
   api/
   ├── projects.js
   └── photos.js
   ```
   - Add logic to `api/` folder
   - Access via `/api/projects`, `/api/photos`

2. **Option B: External Backend**
   - Keep current architecture
   - Add API calls to external service
   - Use environment variables for API keys

## Environment Variables

To add environment variables:

1. In Vercel Dashboard:
   - Settings → Environment Variables
   - Add key-value pairs

2. Access in code:
   ```javascript
   const apiKey = import.meta.env.VITE_API_KEY
   ```

3. Add to `.env.local` for local development:
   ```
   VITE_API_KEY=your_key_here
   ```

## Cost Analysis

### Vercel Free Tier
- **Perfect for this portfolio**
- 100GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Analytics included

### When to Upgrade
- Exceed 100GB bandwidth (≈ millions of visits)
- Need advanced features (JWT tokens, redirects)
- Want faster builds

## Troubleshooting

### Build Fails
1. Check build logs in Vercel dashboard
2. Ensure `npm install` works locally
3. Check for missing dependencies
4. Verify `npm run build` works locally

### Slow Performance
1. Check Vercel Analytics
2. Optimize image sizes
3. Review Core Web Vitals
4. Check cache headers

### Routing Issues
1. All routes automatically serve `index.html` for SPA
2. No additional configuration needed

## Helpful Resources

- [Vercel Docs](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs) (if upgrading)

## Scaling Recommendations

### Phase 1: Current (Vercel Static)
- Perfect for current portfolio
- No changes needed

### Phase 2: Analytics/Forms
- Add serverless functions
- Use external services (Formspree, LogRocket)

### Phase 3: Dynamic Content
- Consider Next.js
- Add database integration
- Implement authentication

---

Last Updated: March 2026
