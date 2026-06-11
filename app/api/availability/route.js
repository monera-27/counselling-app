// app/api/availability/route.js
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Get all booked times for that date (status not cancelled)
  const { data: booked } = await supabase
    .from('bookings')
    .select('session_time')
    .eq('session_date', date)
    .in('status', ['confirmed', 'pending']);
  
  const bookedTimes = booked.map(b => b.session_time);
  const allTimes = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  const available = allTimes.filter(t => !bookedTimes.includes(t));
  
  return Response.json({ availableSlots: available });
}