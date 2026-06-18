import type { NextConfig } from "next";

// ---------------------------------------------------------------------------
// Derive Supabase hostname from the public env var so we don't hard-code it.
// e.g. "https://pbocntoruwjcmpacjroc.supabase.co" → "pbocntoruwjcmpacjroc.supabase.co"
// ---------------------------------------------------------------------------
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host   // "xxxx.supabase.co"
  : "*.supabase.co";                                      // safe fallback

// ---------------------------------------------------------------------------
// Build the CSP string.
//
// Directives explained:
//   default-src   – fallback for any directive not listed explicitly
//   script-src    – JS files; 'unsafe-inline' needed by Next.js hydration
//                   chunks; 'unsafe-eval' only in dev (hot-reload)
//   style-src     – CSS; 'unsafe-inline' needed by Tailwind JIT & Next.js
//   font-src      – Google Fonts binary files (fonts.gstatic.com)
//   img-src       – images; data: for base64 blobs; blob: for canvas exports
//   connect-src   – XHR / fetch / WebSocket targets:
//                     • Supabase REST  (https://xxxx.supabase.co)
//                     • Supabase Realtime (wss://xxxx.supabase.co)
//                     • Resend API     (https://api.resend.com)
//   frame-src     – iframes (none needed – block everything)
//   object-src    – <object>/<embed> (never needed in modern apps)
// ---------------------------------------------------------------------------
const buildCSP = (isDev: boolean): string => {
  const scriptSrc = isDev
    ? `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
    : `script-src 'self' 'unsafe-inline'`;

  return [
    `default-src 'self'`,
    scriptSrc,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https://${supabaseHost}`,
    `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://api.resend.com`,
    `frame-src 'none'`,
    `object-src 'none'`,
  ]
    .join("; ")
    .concat(";");
};

const nextConfig: NextConfig = {
  async headers() {
    const isDev = process.env.NODE_ENV === "development";

    return [
      {
        // Apply to every route
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: buildCSP(isDev),
          },
          // Good-practice security headers — free to add while we're here
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;