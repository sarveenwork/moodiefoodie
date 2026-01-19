# Quick Favicon Setup Guide

## ✅ If MF.png is already in public/assets/

Run this command to set it up:
```bash
node scripts/setup-favicon.js
```

Then:
1. Restart your dev server (`npm run dev`)
2. Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

## 🔍 Troubleshooting

### Still not showing?

1. **Check if file exists:**
   ```bash
   ls -la public/assets/MF.png
   ls -la app/icon.png
   ```

2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Check browser console:**
   - Open DevTools (F12)
   - Check Network tab for `/icon.png` requests
   - Verify it's loading (status 200)

4. **Verify file format:**
   - Must be a valid PNG file
   - Recommended size: 32x32 or 64x64 pixels

5. **Check for conflicts:**
   - No `favicon.ico` in `app/` directory
   - No other `icon.*` files in `app/` directory

## 📝 Manual Setup

If the script doesn't work, manually copy:
```bash
cp public/assets/MF.png app/icon.png
```

Then restart your dev server.
