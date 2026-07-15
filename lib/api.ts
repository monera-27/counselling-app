// lib/api.ts
// ---------------------------------------------------------------------------
// All internal fetch() calls must go through apiUrl() so that:
//   • On Vercel  → resolves to a relative path  e.g. "/api/bookings"
//   • On mobile  → resolves to the full Vercel URL
//                  e.g. "https://your-app.vercel.app/api/bookings"
//
// NEXT_PUBLIC_APP_URL must be set in:
//   • Your local  .env.local         → http://localhost:3000
//   • Vercel dashboard env vars      → https://your-app.vercel.app
//   • GitHub Actions secrets         → https://your-app.vercel.app
// ---------------------------------------------------------------------------

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "";

/**
 * Builds a full API URL from a path.
 * @example apiUrl('/api/bookings') → 'https://your-app.vercel.app/api/bookings'
 */
export const apiUrl = (path: string): string => `${BASE}${path}`;