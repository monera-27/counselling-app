export const dynamic = "force-static";
import { NextResponse } from "next/server";
import { sendBookingConfirmedEmail } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, name, date, time } = body;

  try {
    await sendBookingConfirmedEmail(email, name, date, time);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}