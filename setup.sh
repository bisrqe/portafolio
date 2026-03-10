#!/bin/bash

# Personal Portfolio - Quick Start Setup
# This script will help you get started with your portfolio

echo "🚀 Personal Portfolio Setup"
echo "============================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js detected: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm with Node.js"
    exit 1
fi

echo "✓ npm detected: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Start development server: npm run dev"
    echo "2. Open http://localhost:3000 in your browser"
    echo "3. Click '+ Add Project' to add your first project"
    echo "4. Go to Photography section and click '+ Add Work'"
    echo ""
    echo "For deployment:"
    echo "1. Read VERCEL_DEPLOYMENT.md for detailed instructions"
    echo "2. Push code to GitHub"
    echo "3. Connect repository to Vercel"
    echo ""
else
    echo "❌ Installation failed. Please try running 'npm install' manually"
    exit 1
fi
