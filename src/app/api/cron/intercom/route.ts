import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for a background job
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // 1. Verify authorization header using simple secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. We want to archive any intercom message that is older than 5 days.
    // In a real PMS, we'd join on bookings and check if check_out was > 48hrs ago.
    // As a simple daily cleanup, 5 days covers the typical stay length + buffer.
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const { error, count } = await supabase
      .from('customer_intercom_messages')
      .update({ status: 'archived' })
      .eq('status', 'active')
      .lt('created_at', fiveDaysAgo.toISOString());

    if (error) {
      console.error('Error archiving intercom messages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Archived old intercom messages', archived_count: count });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
