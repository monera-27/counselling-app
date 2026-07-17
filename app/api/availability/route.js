export const dynamic = "force-dynamic";

import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return Response.json({ availableSlots: [] });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: booked } = await supabase
      .from('bookings')
      .select('session_time')
      .eq('session_date', date)
      .in('status', ['confirmed', 'pending']);

    // Safely handle null — Supabase returns null on error or no connection
    const bookedTimes = (booked ?? []).map(b => b.session_time);

    const allTimes = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
    const available = allTimes.filter(t => !bookedTimes.includes(t));

    return Response.json({ availableSlots: available });
  } catch (error) {
    // Return all slots available if anything fails
    return Response.json({
      availableSlots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']
    });
  }
}