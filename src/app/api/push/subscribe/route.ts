import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We need an admin client to insert subscriptions without RLS blocking if RLS is tight,
// or we can just use the public client since we allowed anon inserts in the migration.
// Using service role is safer if we change RLS later.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const subscription = await request.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    const { endpoint, keys: { p256dh, auth } } = subscription;

    // Check if it exists
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', endpoint)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already subscribed' });
    }

    // Insert new subscription
    const { error } = await supabase
      .from('push_subscriptions')
      .insert({
        endpoint,
        p256dh,
        auth
      });

    if (error) {
      console.error('Error inserting subscription:', error);
      return NextResponse.json({ error: 'Failed to store subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Push subscribe error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
