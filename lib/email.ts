import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Email when booking is created
export async function sendBookingReceivedEmail(
  email: string,
  name: string,
  date: string,
  time: string
) {
  await resend.emails.send({
    from: "Counselling <onboarding@resend.dev>",
    to: email,
    subject: "Booking Received",
    html: `
      <h2>Hello ${name},</h2>
      <p>Your booking request has been received.</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p>Please complete payment to confirm your session.</p>
    `,
  });
}

// Email when booking is confirmed
export async function sendBookingConfirmedEmail(
  email: string,
  name: string,
  date: string,
  time: string
) {
  await resend.emails.send({
    from: "Counselling <onboarding@resend.dev>",
    to: email,
    subject: "Session Confirmed",
    html: `
      <h2>Hello ${name},</h2>
      <p>Your session is confirmed.</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p>We look forward to speaking with you.</p>
    `,
  });
}