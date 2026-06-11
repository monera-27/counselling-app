// app/api/debug-env/route.ts
import { env } from '@/lib/env';

export async function GET() {
  // Only show which variables are present, not their values
  const status = {
    supabaseUrl: !!env.public.supabaseUrl,
    supabaseAnonKey: !!env.public.supabaseAnonKey,
    appUrl: !!env.public.appUrl,
    supabaseServiceRoleKey: !!env.private.supabaseServiceRoleKey,
    adminEmailsCount: env.private.adminEmails.length,
  };
  return Response.json(status);
}