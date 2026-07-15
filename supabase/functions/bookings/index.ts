// supabase/functions/bookings/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",   // tighten this in production
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // ✅ Correct: use the auto-injected environment variable NAMES
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const session_date = body.session_date
      ? (body.session_date instanceof Date
          ? body.session_date.toISOString().split("T")[0]
          : String(body.session_date).trim() || null)
      : null;

    const session_time = body.session_time
      ? String(body.session_time).trim() || null
      : null;

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert([
        {
          ...body,
          session_date,
          session_time,
          user_id: null,
          status: "pending",
          payment_status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentLink = `https://wave.com/pay/...?bookingId=${data.id}`;

    return new Response(
      JSON.stringify({ bookingId: data.id, paymentLink }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});