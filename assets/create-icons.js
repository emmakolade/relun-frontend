// This script creates placeholder icons using canvas
// Run this with: node assets/create-icons.js

const fs = require('fs');
const path = require('path');

// Create SVG icons that can be used temporarily
const createSVGIcon = (size, filename, bgColor = '#FF6B9D') => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bgColor}" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">R</text>
  <circle cx="${size * 0.7}" cy="${size * 0.3}" r="${size * 0.1}" fill="#FFD700" opacity="0.8"/>
</svg>`;
  
  fs.writeFileSync(path.join(__dirname, filename), svg);
  console.log(`Created ${filename}`);
};

// Create splash screen
const createSplashSVG = () => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1284" height="2778" viewBox="0 0 1284 2778" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B9D;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#C74375;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1284" height="2778" fill="url(#grad1)"/>
  <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="180" font-weight="bold" fill="white" text-anchor="middle">Relun</text>
  <circle cx="642" cy="1200" r="100" fill="white" opacity="0.3"/>
  <path d="M 642 1250 Q 592 1300, 642 1350 Q 692 1300, 642 1250" fill="white"/>
</svg>`;
  
  fs.writeFileSync(path.join(__dirname, 'splash.svg'), svg);
  console.log('Created splash.svg');
};

// Create all icons
createSVGIcon(1024, 'icon.svg');
createSVGIcon(1024, 'adaptive-icon.svg');
createSVGIcon(48, 'favicon.svg');
createSplashSVG();

console.log('\n✅ All placeholder icons created!');
console.log('\n📝 Note: These are temporary SVG files.');
console.log('For production, replace with PNG files or use a design tool.');
console.log('\nTo convert SVG to PNG, you can use online tools like:');
console.log('- https://cloudconvert.com/svg-to-png');
console.log('- https://convertio.co/svg-png/');
