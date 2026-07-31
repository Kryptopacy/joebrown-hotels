'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, Clock, ChefHat, Bell, PackageCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const ORDER_STAGES = [
  { key: 'pending',    label: 'Order Received',  icon: Clock },
  { key: 'confirmed',  label: 'Confirmed',        icon: CheckCircle },
  { key: 'preparing',  label: 'Being Prepared',   icon: ChefHat },
  { key: 'ready',      label: 'Ready',            icon: Bell },
  { key: 'delivered',  label: 'Delivered',        icon: PackageCheck },
];

const STAGE_INDEX: Record<string, number> = {
  pending: 0, confirmed: 1, preparing: 2, ready: 3, delivered: 4, cancelled: -1,
};

const PAYMENT_BADGE: Record<string, { label: string; cls: string }> = {
  unpaid:             { label: 'Unpaid',              cls: 'bg-red-100 text-red-700 border-red-300' },
  transfer_submitted: { label: 'Transfer Submitted',  cls: 'bg-brown-100 text-brown-800 border-brown-300' },
  paid:               { label: 'Paid',                cls: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  refunded:           { label: 'Refunded',            cls: 'bg-slate-100 text-slate-600 border-slate-300' },
};

interface Props {
  initialOrder: any;
  orderNumber: string;
}

export default function OrderTracker({ initialOrder, orderNumber }: Props) {
  const [order, setOrder] = useState(initialOrder);
  const supabase = createClient();

  useEffect(() => {
    if (!order?.id) return;
    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` },
        (payload) => setOrder((prev: any) => ({ ...prev, ...payload.new }))
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [order?.id, supabase]);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-3">Order Not Found</h1>
        <p className="text-slate-600 mb-6 max-w-sm">
          We couldn't find an order with number <strong>{orderNumber}</strong>. Double-check and try again.
        </p>
        <Link
          href="/menu"
          className="flex items-center gap-2 px-6 py-3 bg-brown-700 hover:bg-brown-800 text-white font-bold rounded-xl transition-colors"
        >
          <ArrowLeft size={18} /> Back to Menu
        </Link>
      </div>
    );
  }

  const currentStageIdx = STAGE_INDEX[order.status] ?? 0;
  const paymentInfo = PAYMENT_BADGE[order.payment_status] || { label: order.payment_status, cls: 'bg-slate-100 text-slate-600 border-slate-300' };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link href="/menu" className="flex items-center gap-2 text-brown-700 font-semibold text-sm hover:underline mb-6">
          <ArrowLeft size={16} /> Back to Menu
        </Link>
        <div className="bg-[#FFFDF5] border-2 border-brown-300 rounded-2xl p-6 shadow-md">
          <p className="text-xs text-brown-700 font-bold uppercase tracking-widest mb-1">Order Number</p>
          <h1 className="text-3xl font-serif font-black text-slate-900 mb-2">{order.order_number}</h1>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-slate-600 font-medium">
              👤 {order.guest_name}
            </span>
            {order.room_or_table && (
              <span className="text-sm text-slate-600 font-medium">
                · 🪑 {order.room_or_table}
              </span>
            )}
            <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full border ${paymentInfo.cls}`}>
              {paymentInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Status Stepper */}
      <div className="bg-[#FFFDF5] border-2 border-brown-200 rounded-2xl p-6 shadow-md mb-6">
        <h2 className="text-lg font-serif font-bold text-slate-900 mb-6">Order Status</h2>
        {order.status === 'cancelled' ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">❌</div>
            <p className="text-red-600 font-bold text-lg">Order Cancelled</p>
            <p className="text-slate-500 text-sm mt-1">Please contact staff for assistance.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Connector line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-brown-100 z-0" style={{ width: 'calc(100% - 2.5rem)', left: '1.25rem' }} />
            <div className="flex justify-between relative z-10">
              {ORDER_STAGES.map((stage, idx) => {
                const isCompleted = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                const Icon = stage.icon;
                return (
                  <div key={stage.key} className="flex flex-col items-center gap-2 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? 'bg-brown-700 border-brown-700 text-white'
                        : isCurrent
                          ? 'bg-brown-100 border-brown-500 text-brown-700 ring-4 ring-brown-200'
                          : 'bg-white border-brown-200 text-slate-300'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <p className={`text-[10px] font-bold text-center leading-tight max-w-[60px] ${
                      isCurrent ? 'text-brown-700' : isCompleted ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      {stage.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-[#FFFDF5] border-2 border-brown-200 rounded-2xl p-6 shadow-md mb-6">
        <h2 className="text-lg font-serif font-bold text-slate-900 mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {(order.order_items || []).map((item: any) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-900 text-sm">{item.item_name}</p>
                <p className="text-xs text-slate-500">×{item.quantity} @ ₦{Number(item.item_price).toLocaleString()} each</p>
              </div>
              <p className="font-bold text-brown-800 text-sm">₦{(Number(item.item_price) * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 mt-4 border-t border-brown-100">
          <span className="font-bold text-slate-900">Total</span>
          <span className="text-2xl font-serif font-black text-brown-700">₦{Number(order.total_amount).toLocaleString()}</span>
        </div>
      </div>

      {/* Special Instructions */}
      {order.special_instructions && (
        <div className="bg-brown-50 border border-brown-200 rounded-2xl p-5 mb-6">
          <p className="text-xs font-bold text-brown-700 uppercase tracking-wider mb-1">Special Instructions</p>
          <p className="text-slate-700 text-sm">{order.special_instructions}</p>
        </div>
      )}

      <p className="text-center text-xs text-slate-400 mt-4">
        This page updates in real-time. No need to refresh.
      </p>
    </div>
  );
}
