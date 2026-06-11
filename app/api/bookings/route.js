// app/api/bookings/route.js
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  const body = await request.json();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Insert booking (pending status)
  const { data, error } = await supabase.from('bookings').insert([{
    ...body,
    user_id: null, // optional if user not logged in
    status: 'pending',
    payment_status: 'pending',
  }]).select().single();
  
  if (error) return Response.json({ error: error.message }, { status: 500 });
  
  // Generate payment link (replace with actual Wave link)
  const paymentLink = `https://wave.com/pay/...?bookingId=${data.id}`;
  
  return Response.json({ bookingId: data.id, paymentLink });
}