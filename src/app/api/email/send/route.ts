import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { BookingConfirmationEmail } from '@/emails/BookingConfirmationEmail';
import { KitchenOrderEmail } from '@/emails/KitchenOrderEmail';
import { PaymentReceiptEmail } from '@/emails/PaymentReceiptEmail';
import { PostStayFeedbackEmail } from '@/emails/PostStayFeedbackEmail';
import { BookingCancellationEmail } from '@/emails/BookingCancellationEmail';
import { LoyaltyMilestoneEmail } from '@/emails/LoyaltyMilestoneEmail';

// Use a fallback or env var for Resend API key
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, to, payload } = body;

    if (!to) {
      return NextResponse.json({ error: 'Missing destination email' }, { status: 400 });
    }

    let data;
    const fromAddress = 'Joebrown <onboarding@resend.dev>'; // Needs to be verified domain in production

    if (type === 'booking') {
      data = await resend.emails.send({
        from: fromAddress,
        to,
        subject: 'Your Booking Confirmation - Joebrown Palace Hotel',
        react: BookingConfirmationEmail(payload),
      });
    } else if (type === 'order') {
      data = await resend.emails.send({
        from: fromAddress,
        to,
        subject: `Order Received: ${payload.orderNumber} - Joebrown Lounge`,
        react: KitchenOrderEmail(payload),
      });
    } else if (type === 'payment_receipt') {
      data = await resend.emails.send({
        from: fromAddress,
        to,
        subject: 'Payment Receipt - Joebrown Palace Hotel',
        react: PaymentReceiptEmail(payload),
      });
    } else if (type === 'post_stay') {
      data = await resend.emails.send({
        from: fromAddress,
        to,
        subject: 'Thank you for staying with us!',
        react: PostStayFeedbackEmail(payload),
      });
    } else if (type === 'cancellation') {
      data = await resend.emails.send({
        from: fromAddress,
        to,
        subject: 'Booking Cancellation - Joebrown Palace Hotel',
        react: BookingCancellationEmail(payload),
      });
    } else if (type === 'loyalty_milestone') {
      data = await resend.emails.send({
        from: fromAddress,
        to,
        subject: 'You reached a Loyalty Milestone! 🏆',
        react: LoyaltyMilestoneEmail(payload),
      });
    } else {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
