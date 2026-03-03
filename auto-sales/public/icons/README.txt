Replace these placeholder files with your app icon (the attached image).

Required filenames (used by the manifest and HTML):
- install-192.png  (192x192 PNG)
- install-512.png  (512x512 PNG)

Recommended steps (locally) to add the icon files before committing:

1. Resize the attached image to 192x192 and 512x512 (maintain aspect ratio, transparent background preferred).
   Example using ImageMagick (Windows WSL or other shell):

   magick convert your-attached-image.png -resize 192x192^ -gravity center -extent 192x192 public/icons/install-192.png
   magick convert your-attached-image.png -resize 512x512^ -gravity center -extent 512x512 public/icons/install-512.png

2. Commit and push the files so GitHub Actions will include them in the build.

Notes:
- The manifest (`/manifest.webmanifest`) now references these files.
- `index.html` uses `/icons/install-192.png` as the favicon.
- For best results on Android, provide a square PNG with 512x512 size for Play store or APK assets.
