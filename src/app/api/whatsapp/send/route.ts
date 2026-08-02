import { NextResponse } from 'next/server';

import { z } from 'zod';

const RequestSchema = z.object({
  to: z.string().min(1, 'Phone number is required'),
  message: z.string().min(1, 'Message is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }
    
    const { to, message } = parsed.data;

    // TODO: Connect this to Twilio / Meta WhatsApp Cloud API / Infobip
    // Example Twilio Implementation:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Your Twilio sandbox or registered number
      to: `whatsapp:${to}`
    });
    */

    // For now, we mock the success

    return NextResponse.json({ success: true, mocked: true });
  } catch (err: any) {
    console.error('[WHATSAPP WEBHOOK ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
