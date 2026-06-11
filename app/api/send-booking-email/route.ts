// app/api/send-booking-email/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      full_name,
      email,
      session_date,
      session_time,
      session_type
    } = body;

    // Email to Admin
    await resend.emails.send({
      from: "Counselling App <onboarding@resend.dev>",
      to: "care@livingrenewal.com", // ← replace with your email
      subject: "New Session Booking",
      html: `
        <h2>New Booking</h2>
        <p><strong>Name:</strong> ${full_name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Session:</strong> ${session_type}</p>
        <p><strong>Date:</strong> ${session_date}</p>
        <p><strong>Time:</strong> ${session_time}</p>
      `
    });

    // Confirmation Email to User
    await resend.emails.send({
      from: "Counselling App <onboarding@resend.dev>",
      to: email,
      subject: "Session Booking Confirmation",
      html: `
        <h2>Booking Confirmed</h2>
        <p>Hello ${full_name},</p>
        <p>Your session has been scheduled:</p>
        <p><strong>${session_date} at ${session_time}</strong></p>
        <p>We look forward to supporting you.</p>
      `
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}