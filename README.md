# Photography Portfolio

A minimal black & white photography portfolio. Next.js (App Router) + MongoDB + MinIO, with a
GSAP-driven scroll/lightbox layer on the gallery.

## Stack

- Next.js 16 (App Router, TypeScript), Tailwind v4, shadcn/ui
- MongoDB + Mongoose for image/category/site metadata
- MinIO (S3-compatible) for original image storage + generated variants
- GSAP + ScrollTrigger + Flip for hero crossfade, scroll reveals, and the grid → lightbox transition
- Single hardcoded admin, signed session cookie (no external auth library)

## Local setup

1. Copy the env file and fill in real secrets:

   ```bash
   cp .env.example .env.local
   # generate a real SESSION_SECRET, e.g.:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Start MongoDB + MinIO:

   ```bash
   docker compose up -d
   ```

3. Install deps and run the app:

   ```bash
   npm install
   npm run dev
   ```

4. Log in at [http://localhost:3000/admin/login](http://localhost:3000/admin/login) with the
   `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env.local`, then upload an image from `/admin`.
   The MinIO console (bucket browser) is at [http://localhost:9001](http://localhost:9001).

## How it's put together

- **Public pages** (`/`, `/work`, `/work/[slug]`, `/about`, `/contact`) are Server Components —
  no client JS is required to read any content, and each has real per-page metadata plus a
  generated `/sitemap.xml` and `/robots.txt`.
- **`/work` is the one place client JS is load-bearing**: `app/(site)/work/layout.tsx` renders
  the gallery grid once and keeps it mounted across `/work ⇄ /work/[slug]` navigations, so
  `components/gallery/work-gallery.tsx` can GSAP-Flip the clicked tile into the full detail view
  and back. A direct load of `/work/[slug]` (shared link, no JS, crawler) still renders the full
  detail page correctly — the Flip animation only fires for in-app navigations that have a
  captured "from" tile rect.
- **Admin** (`/admin/*`) is gated by `proxy.ts` (Next 16's replacement for `middleware.ts`) and by
  an explicit `requireAdmin()`/`isAdminAuthenticated()` check inside every admin route handler,
  since Server Actions bypass proxy matchers.
- **Image pipeline**: browser uploads directly to MinIO via a presigned PUT URL
  (`/api/admin/upload-url`), then `/api/admin/images` fetches the object back, computes a
  blurhash and WebP variants (400/800/1600px) via `sharp`, and only then writes the Mongo doc.
  Public serving goes through `/api/images/[key]`, which streams from MinIO with an immutable
  cache header (object keys are content-hashed).

## Known simplifications

- Image processing (blurhash + variants) runs synchronously in the upload request — fine for a
  low-volume single-admin site; a queue would be the next step at higher upload volume.
- The display font defaults to Fraunces (`lib/fonts.ts`) as a free stand-in for PP Editorial New,
  which has no CDN distribution. Swap to `next/font/local` there once you have licensed files.
