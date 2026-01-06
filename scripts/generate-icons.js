// Icon generation script
// Run with: node scripts/generate-icons.js

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SVG icon template
const createSvgIcon = (size) => Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00d4aa"/>
      <stop offset="100%" style="stop-color:#0984e3"/>
    </linearGradient>
  </defs>
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#grad)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.36}" fill="#0f1419"/>
  <line x1="${size/2}" y1="${size/2}" x2="${size/2}" y2="${size*0.25}" stroke="#00d4aa" stroke-width="${Math.max(1.5, size*0.04)}" stroke-linecap="round"/>
  <line x1="${size/2}" y1="${size/2}" x2="${size*0.69}" y2="${size*0.56}" stroke="#00d4aa" stroke-width="${Math.max(1, size*0.03)}" stroke-linecap="round"/>
  <circle cx="${size/2}" cy="${size/2}" r="${Math.max(1, size*0.05)}" fill="#00d4aa"/>
</svg>
`);

const sizes = [16, 32, 48, 128];
const iconsDir = join(__dirname, '..', 'icons');

// Ensure icons directory exists
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// Generate PNG files
async function generateIcons() {
  for (const size of sizes) {
    const svgBuffer = createSvgIcon(size);
    const pngPath = join(iconsDir, `icon${size}.png`);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(pngPath);
    
    console.log(`Generated: icon${size}.png`);
  }
  
  console.log('\\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
