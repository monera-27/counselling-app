export const dynamic = "force-dynamic";
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  const body = await request.json();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // session_date and session_time are optional.
  // Convert empty strings, Date objects, or missing values to null
  // so Supabase doesn't receive an invalid date string.
  const session_date = body.session_date
    ? (body.session_date instanceof Date
        ? body.session_date.toISOString().split('T')[0]   // Date object → "YYYY-MM-DD"
        : String(body.session_date).trim() || null)        // string → keep or null
    : null;

  const session_time = body.session_time
    ? String(body.session_time).trim() || null
    : null;

  const { data, error } = await supabase.from('bookings').insert([{
    ...body,
    session_date,    // safely null if not provided
    session_time,    // safely null if not provided
    user_id: null,   // optional if user not logged in
    status: 'pending',
    payment_status: 'pending',
  }]).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Generate payment link (replace with actual Wave link)
  const paymentLink = `https://wave.com/pay/...?bookingId=${data.id}`;

  return Response.json({ bookingId: data.id, paymentLink });
}