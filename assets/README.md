# Assets Folder

## Current Status
This folder contains placeholder PNG images. For production, you should replace these with proper app icons.

## Required Assets

### App Icon (icon.png)
- **Size**: 1024x1024 px
- **Format**: PNG with transparency
- **Usage**: iOS App Store icon, Android icon

### Adaptive Icon (adaptive-icon.png)
- **Size**: 1024x1024 px
- **Format**: PNG with transparency
- **Usage**: Android adaptive icon
- **Safe area**: Keep important content in the center 66% (660x660px)

### Splash Screen (splash.png)
- **Size**: 1284x2778 px (iPhone 14 Pro Max)
- **Format**: PNG
- **Background**: #FF6B9D (brand pink)
- **Usage**: Launch screen

### Favicon (favicon.png)
- **Size**: 48x48 px
- **Format**: PNG or ICO
- **Usage**: Web app icon

## How to Create Professional Icons

### Option 1: Design Tools
- **Figma**: Free, web-based design tool
- **Canva**: Easy templates for app icons
- **Adobe Illustrator**: Professional design

### Option 2: Icon Generators
- **Icon Kitchen**: https://icon.kitchen/
- **App Icon Generator**: https://appicon.co/
- **MakeAppIcon**: https://makeappicon.com/

### Option 3: Hire a Designer
- **Fiverr**: Affordable icon design
- **99designs**: Professional contests
- **Upwork**: Freelance designers

## Design Guidelines

### Brand Colors
- Primary: #FF6B9D (Pink)
- Secondary: #C74375 (Dark Pink)
- Accent: #FF8C42 (Orange)

### Icon Recommendations
- Use a heart symbol (❤️) or custom "R" logo
- Keep it simple and recognizable at small sizes
- Use gradient from primary to secondary color
- Ensure good contrast
- Test at different sizes

### Splash Screen Recommendations
- Use gradient background (pink to dark pink)
- Center the app name "Relun"
- Add subtle heart or logo element
- Keep text readable
- Match brand identity

## Quick Setup for Development

The current placeholder images are minimal 1x1 pixel images that allow the app to run. Replace them with proper assets before publishing.

### Using SVG to PNG Conversion
1. Use the included `create-icons.js` script to generate SVG templates
2. Convert SVG to PNG using online tools:
   - https://cloudconvert.com/svg-to-png
   - https://convertio.co/svg-png/
3. Replace the PNG files in this folder

## Publishing Checklist
- [ ] Replace all placeholder images with branded assets
- [ ] Test icons on different screen sizes
- [ ] Verify splash screen on various devices
- [ ] Ensure compliance with App Store guidelines
- [ ] Check that icons are crisp and not pixelated
