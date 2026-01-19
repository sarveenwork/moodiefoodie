# Setting Up the Favicon

Next.js 13+ uses a file-based icon system. To set up the MF.png as your favicon:

## Step 1: Add MF.png to assets folder
Place your `MF.png` file in: `public/assets/MF.png`

## Step 2: Copy to app directory
Copy the file to the app directory so Next.js can automatically detect it:

```bash
cp public/assets/MF.png app/icon.png
```

Or on Windows:
```cmd
copy public\assets\MF.png app\icon.png
```

## Step 3: Restart dev server
Restart your Next.js development server for the changes to take effect.

## Step 4: Hard refresh browser
Clear browser cache with a hard refresh:
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

---

**Note:** Next.js automatically generates the favicon link tags when it finds `app/icon.png`. No metadata configuration needed!
