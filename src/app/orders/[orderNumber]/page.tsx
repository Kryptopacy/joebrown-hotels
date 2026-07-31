export const dynamic = 'force-dynamic';

import React from 'react';
import { createClient } from '@/lib/supabase/server';
import OrderTracker from '@/components/OrderTracker';
import Navbar from '@/components/Navbar';

export default async function OrderTrackingPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', orderNumber)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-[#FFFCEB]">
      <Navbar />
      <OrderTracker initialOrder={order} orderNumber={orderNumber} />
    </div>
  );
}
