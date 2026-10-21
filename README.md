# HH Goa Frame Generator

A small web app for Hacker House Goa 2026 (28 to 31 October 2026, Goa). You upload a photo, crop it, pick a frame style and download a PNG to use as a profile picture or share on X.

Live app: https://goa-hh.vercel.app

## What it does

- Upload a JPG, PNG or HEIC photo (HEIC is converted in the browser with `heic2any`).
- Crop and move the photo in a crop studio.
- Choose one of three formats: a square frame, a circular avatar, or a wide "Builder ID" card with your name and role.
- Draw the result on a canvas and download it as a PNG.
- Share on X: the app opens an X post with a prefilled caption and the `#FrameInGoa` hashtag, copies the caption to the clipboard and downloads the image.

Everything happens in the browser. The photo is not uploaded to any server.

## Tech stack

- Frontend (`artifacts/hh-goa-frame-generator`): React, TypeScript, Vite, Tailwind CSS, HTML canvas
- pnpm workspace started from a Replit template. It also contains an Express API server (`artifacts/api-server`) that only has a health check route, and shared packages in `lib/` (OpenAPI spec, generated client, an empty Drizzle schema). The frame generator does not use them.

## Run it locally

You need Node.js and pnpm.

```bash
git clone https://github.com/trynayash/hh-goa.git
cd hh-goa
pnpm install
pnpm run dev
```

The dev server uses the `PORT` environment variable and defaults to port 5000.

Build the frontend (this is what Vercel runs):

```bash
pnpm run build:frontend
```
