// lib/env.ts

export const env = {
  // Public variables (available in browser)
  public: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  },
  // Private variables (server‑side only)
  private: {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    adminEmails: process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [],
  },
};

// Validation – throws error if any required variable is missing
const requiredPublicVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL',
] as const;

const requiredPrivateVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

// Validate public (client‑side & server)
for (const v of requiredPublicVars) {
  if (!process.env[v]) {
    throw new Error(`Missing required environment variable: ${v}`);
  }
}

// Validate private (server only – but we check both places for safety)
if (typeof window === 'undefined') {
  for (const v of requiredPrivateVars) {
    if (!process.env[v]) {
      throw new Error(`Missing required environment variable: ${v}`);
    }
  }
}

// Optional: warn if ADMIN_EMAILS is missing (but not fatal)
if (typeof window === 'undefined' && !process.env.ADMIN_EMAILS) {
  console.warn('⚠️ ADMIN_EMAILS not set – admin features may not work.');
}

// Type‑safe exports
export const supabaseUrl = env.public.supabaseUrl!;
export const supabaseAnonKey = env.public.supabaseAnonKey!;
export const appUrl = env.public.appUrl!;
export const supabaseServiceRoleKey = env.private.supabaseServiceRoleKey!;
export const adminEmails = env.private.adminEmails;