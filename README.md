# Personal Portfolio

A modern React-based personal portfolio website featuring project showcase and photography/videography gallery. Built with Vite for fast development and optimized production builds.

## Features

- **Home Page**: Eye-catching hero section with welcome message
- **Projects Section**: 
  - Add and manage your projects dynamically
  - Each project includes title, description, image, and link
  - Beautiful card layout with hover effects
  - Delete projects easily

- **Photography/Videography Gallery**:
  - Showcase your photography and videography work
  - Organize by category (Photography, Videography, Other)
  - Elegant lightbox-style overlays on hover
  - Add and delete works with ease

- **Responsive Design**: Fully responsive layout that works on all devices
- **Modern UI**: Gradient backgrounds, smooth animations, and glassmorphism effects
- **Vercel Ready**: Pre-configured for seamless deployment to Vercel

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Navigation.jsx         # Navigation bar component
│   │   ├── Navigation.css
│   │   ├── ProjectManager.jsx     # Projects section with add/delete
│   │   ├── ProjectManager.css
│   │   ├── PhotographyPortfolio.jsx  # Photography gallery
│   │   └── PhotographyPortfolio.css
│   ├── App.jsx                    # Main app component
│   ├── App.css
│   └── main.jsx                   # React entry point
├── index.html                     # HTML entry point
├── vite.config.js                 # Vite configuration
├── vercel.json                    # Vercel deployment config
├── package.json
└── README.md
```

## Local Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or navigate to the project directory:
```bash
cd "Personal Projects/Portafolio"
```

2. Install dependencies:
```bash
npm install
```

### Running Locally

Start the development server:
```bash
npm run dev
```

This will:
- Start a local server (typically at `http://localhost:3000`)
- Watch for file changes and auto-reload
- Open the portfolio in your default browser

### Building for Production

Create an optimized production build:
```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

Preview your production build locally:
```bash
npm run preview
```

## Deploying to Vercel

### Option 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI globally (if not already installed):
```bash
npm install -g vercel
```

2. From the project directory, deploy:
```bash
vercel
```

3. Follow the prompts to:
   - Link to your Vercel account
   - Confirm project name
   - Select project settings (defaults are fine)

### Option 2: Using Vercel Dashboard

1. Push your code to GitHub, GitLab, or Bitbucket
2. Go to [https://vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Vercel will auto-detect the framework and settings
6. Click "Deploy"

### Vercel Configuration

The `vercel.json` file is already configured with:
- **buildCommand**: `npm run build` - Builds the React app
- **devCommand**: `npm run dev` - Runs the dev server
- **installCommand**: `npm install` - Installs dependencies
- **framework**: `vite` - Framework type
- **outputDirectory**: `dist` - Where built files are located

## How to Use

### Adding a Project

1. Navigate to the "Projects" section
2. Click "+ Add Project"
3. Fill in the form:
   - **Title**: Your project name
   - **Description**: Brief description
   - **Link**: URL to the project (optional)
   - **Image**: URL to project image/screenshot
4. Click "Save Project"

### Adding Photography/Videography

1. Navigate to "Photography" section
2. Click "+ Add Work"
3. Fill in the form:
   - **Title**: Work title (optional)
   - **Description**: Details about the work
   - **Category**: Photography/Videography/Other
   - **Image**: URL to the image or thumbnail
4. Click "Save Work"

### Deleting Entries

- Click the "Delete" button on any project card
- Click the "✕" button on any gallery image

## Image Management with Cloudinary

This portfolio supports **Cloudinary** for easy image uploading and management.

### Quick Setup (Free)

1. **Create Cloudinary Account**: Sign up free at [cloudinary.com](https://cloudinary.com)
2. **Get Cloud Name**: Copy from your Cloudinary Dashboard
3. **Create Upload Preset**: In Settings → Upload → Add preset (set mode to "Unsigned")
4. **Add to `.env.local`**:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
   ```
5. **Restart dev server**: `npm run dev`

### Using Cloudinary

- When adding projects/photos, click **"📸 Upload Image"** button
- Or paste image URLs manually
- Cloudinary handles optimization and CDN delivery automatically

**See [CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md) for detailed instructions**

## Customization

### Colors & Styling

The main gradient colors are defined in:
- `index.html` body style
- `App.css` and component CSS files

To customize colors:
1. Find the gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
2. Replace with your preferred colors
3. Update complementary colors in component CSS files

### Adding More Sections

To add new sections:
1. Create a new component file in `src/components/`
2. Import it in `App.jsx`
3. Add a case in the section switcher
4. Add a navigation link in `Navigation.jsx`

## Environment Variables

Currently, no environment variables are required. If you need to add API keys or configuration later:

1. Create a `.env.local` file in the root directory
2. Add variables: `VITE_API_KEY=your_key`
3. Access in code: `import.meta.env.VITE_API_KEY`

## Performance Tips

- Optimize images before uploading URLs (use tools like TinyPNG)
- Use image CDNs for better loading performance
- Consider implementing lazy loading for galleries with many items

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is free to use for personal purposes.

## Support

For issues or questions:
1. Check the code comments
2. Review the component structure
3. Ensure all dependencies are installed: `npm install`

---

Happy building! 🚀
