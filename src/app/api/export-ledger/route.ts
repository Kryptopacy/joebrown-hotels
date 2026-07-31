import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '30d';
  const stream = searchParams.get('stream') || 'all';

  // Initialize Admin Supabase Client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: hotel } = await supabase.from('hotels').select('id').eq('slug', 'joebrown').maybeSingle();
  if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
  const hid = hotel.id;

  const [bRes, oRes, oiRes, cRes] = await Promise.all([
    supabase.from('bookings').select('*').eq('hotel_id', hid),
    supabase.from('orders').select('*').eq('hotel_id', hid),
    supabase.from('order_items').select('*, menu_items(category_id)'),
    supabase.from('menu_categories').select('id, type').eq('hotel_id', hid),
  ]);

  const bookings = bRes.data || [];
  const orders = oRes.data || [];
  const orderItems = oiRes.data || [];
  const categories = cRes.data || [];

  // Calculate cutoff date
  const now = new Date();
  let periodStart = '2000-01-01';
  if (range !== 'all') {
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const d = new Date();
    d.setDate(d.getDate() - days);
    periodStart = d.toISOString().split('T')[0];
  }

  const entries: any[] = [];

  bookings.forEach((b: any) => {
    if (b.created_at >= periodStart) {
      entries.push({
        date: b.created_at,
        id: b.booking_reference || b.id.substring(0, 8),
        stream: 'bookings',
        customer: b.guest_name + (b.guest_email ? ` (${b.guest_email})` : ''),
        status: b.payment_status || b.status,
        amount: Number(b.total_amount)
      });
    }
  });

  orders.forEach((o: any) => {
    if (o.created_at >= periodStart) {
      const stream = o.stream || 'restaurant';
      const items = orderItems.filter((oi: any) => oi.order_id === o.id);
      let totalAmt = 0;
      items.forEach((oi: any) => {
        totalAmt += Number(oi.item_price) * Number(oi.quantity);
      });

      if (totalAmt > 0) {
        entries.push({
          date: o.created_at,
          id: o.order_number,
          stream: stream,
          customer: o.guest_name + (o.room_or_table ? ` (${o.room_or_table})` : ''),
          status: o.payment_status,
          amount: totalAmt
        });
      }
    }
  });

  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter by stream
  const finalEntries = stream === 'all' ? entries : entries.filter(e => e.stream === stream);

  // Generate CSV
  let csv = 'Date,Transaction ID,Stream,Customer,Status,Amount\n';
  finalEntries.forEach(e => {
    const d = new Date(e.date).toLocaleString('en-GB').replace(',', '');
    const cust = `"${(e.customer || '').replace(/"/g, '""')}"`;
    csv += `${d},${e.id},${e.stream},${cust},${e.status},${e.amount}\n`;
  });

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="joebrown-financial-ledger-${range}.csv"`,
    },
  });
}
