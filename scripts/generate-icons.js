#!/usr/bin/env node
// Run: node scripts/generate-icons.js
// Generates simple placeholder SVG-based PNG icons for PWA

const fs = require('fs');
const path = require('path');

// Create a simple SVG placeholder for icons
const createSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0ea5e9"/>
  <text x="50%" y="55%" font-family="Arial" font-size="${size * 0.45}" 
        fill="white" text-anchor="middle" dominant-baseline="middle">✈</text>
</svg>
`;

console.log('Icon generation: Use a proper image editor or https://realfavicongenerator.net');
console.log('Place 192x192 PNG at public/icons/icon-192.png');
console.log('Place 512x512 PNG at public/icons/icon-512.png');

// Write SVG files as placeholders
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), createSvg(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), createSvg(512));

console.log('SVG placeholder icons written to public/icons/');
console.log('Convert them to PNG before deploying.');
