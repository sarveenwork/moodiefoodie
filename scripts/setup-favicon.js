#!/usr/bin/env node

/**
 * Setup script to copy MF.png from public/assets/ to app/icon.png
 * This enables Next.js file-based icon system for automatic favicon detection
 */

const fs = require('fs');
const path = require('path');

const sourcePath = path.join(process.cwd(), 'public', 'assets', 'MF.png');
const destPath = path.join(process.cwd(), 'app', 'icon.png');

if (!fs.existsSync(sourcePath)) {
  console.error('❌ Error: MF.png not found at public/assets/MF.png');
  console.log('📝 Please add your MF.png file to public/assets/ first.');
  process.exit(1);
}

try {
  // Copy the file
  fs.copyFileSync(sourcePath, destPath);
  console.log('✅ Successfully copied MF.png to app/icon.png');
  console.log('🔄 Please restart your Next.js dev server for changes to take effect.');
  console.log('🌐 Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R) to see the new favicon.');
} catch (error) {
  console.error('❌ Error copying file:', error.message);
  process.exit(1);
}
