'use client';

import React, { useState, useEffect } from 'react';
import { Bell, ShoppingBag, Shield, BellRing, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useHotel } from '@/contexts/HotelContext';

export default function AdminNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { hotel } = useHotel();
  const supabase = createClient();

  useEffect(() => {
    if (!hotel) return;

    const fetchNotifications = async () => {
      // 1. Get current user's role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const { data: staff } = await supabase
        .from('staff')
        .select('role')
        .eq('email', user.email)
        .eq('hotel_id', hotel.id)
        .single();
        
      const role = staff?.role || 'pending';
      
      // If they are pending, they shouldn't see anything
      if (role === 'pending') {
        setNotifications([]);
        return;
      }
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('id, order_number, guest_name, created_at')
        .eq('hotel_id', hotel.id)
        .eq('status', 'pending');

      const { data: pendingStaff } = await supabase
        .from('staff')
        .select('id, email, created_at')
        .eq('hotel_id', hotel.id)
        .eq('role', 'pending');

      const { data: pendingRequests } = await supabase
        .from('service_requests')
        .select('id, request_type, room_number, created_at')
        .eq('hotel_id', hotel.id)
        .eq('status', 'pending');

      const { data: pendingChats } = await supabase
        .from('customer_intercom_messages')
        .select('id, session_id, guest_name, room_or_table, created_at')
        .eq('hotel_id', hotel.id)
        .eq('requires_human', true);

      const { data: pendingBookings } = await supabase
        .from('bookings')
        .select('id, guest_name, check_in, check_out, created_at')
        .eq('hotel_id', hotel.id)
        .eq('status', 'pending');

      // We only want to show unique sessions for chats
      const uniquePendingChats = pendingChats ? Array.from(new Map(pendingChats.map(item => [item.session_id, item])).values()) : [];

      const notifs: any[] = [];
      
      // 2. Filter what they see based on their role
      const canSeeOrders = ['admin', 'kitchen', 'reception', 'bar'].includes(role);
      const canSeeRequests = ['admin', 'reception', 'concierge'].includes(role);
      const canSeeStaffSignups = ['admin'].includes(role);
      const canSeeChats = ['admin', 'reception', 'concierge'].includes(role);
      const canSeeBookings = ['admin', 'reception'].includes(role);

      if (canSeeOrders && pendingOrders) {
        pendingOrders.forEach(o => notifs.push({
          id: `order_${o.id}`, type: 'order', title: `New Order: ${o.order_number}`, desc: `From: ${o.guest_name}`, time: o.created_at, link: '/admin/orders'
        }));
      }
      
      if (canSeeStaffSignups && pendingStaff) {
        pendingStaff.forEach(s => notifs.push({
          id: `staff_${s.id}`, type: 'staff', title: `New Staff Signup`, desc: `Approve: ${s.email}`, time: s.created_at, link: '/admin/staff'
        }));
      }
      
      if (canSeeRequests && pendingRequests) {
        pendingRequests.forEach(r => notifs.push({
          id: `req_${r.id}`, type: 'request', title: `Concierge Request`, desc: `Room ${r.room_number}: ${r.request_type}`, time: r.created_at, link: '/admin/concierge'
        }));
      }

      if (canSeeChats && uniquePendingChats) {
        uniquePendingChats.forEach(c => notifs.push({
          id: `chat_${c.id}`, type: 'chat', title: `Human Assistance Needed`, desc: `${c.guest_name} at ${c.room_or_table}`, time: c.created_at, link: '/admin/intercom'
        }));
      }

      if (canSeeBookings && pendingBookings) {
        pendingBookings.forEach(b => notifs.push({
          id: `booking_${b.id}`, type: 'booking', title: `New Booking Request`, desc: `${b.guest_name} (${b.check_in})`, time: b.created_at, link: '/admin/bookings'
        }));
      }

      notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setNotifications(notifs);
    };

    fetchNotifications();

    // Subscribe to realtime updates for all tables
    const channel = supabase.channel('admin_notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchNotifications)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, fetchNotifications)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, fetchNotifications)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_intercom_messages' }, fetchNotifications)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchNotifications)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hotel, supabase]);

  const getIcon = (type: string) => {
    if (type === 'order') return <ShoppingBag size={16} className="text-brown-600" />;
    if (type === 'staff') return <Shield size={16} className="text-emerald-600" />;
    return <BellRing size={16} className="text-blue-600" />;
  };

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white border border-brown-200 rounded-full hover:bg-brown-50 transition-colors shadow-sm focus:outline-none"
      >
        <Bell size={20} className="text-slate-700" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-brown-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
          <div className="flex items-center justify-between p-4 border-b border-brown-100 bg-brown-50/50">
            <h3 className="font-serif font-bold text-slate-900 flex items-center gap-2">
              <Bell size={18} className="text-brown-700" /> Notifications
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900">
              <X size={18} />
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No new notifications. You're all caught up!
              </div>
            ) : (
              <div className="divide-y divide-brown-100">
                {notifications.map(n => (
                  <Link 
                    href={n.link} 
                    key={n.id}
                    onClick={() => setIsOpen(false)}
                    className="block p-4 hover:bg-brown-50/50 transition-colors group"
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                        {getIcon(n.type)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-brown-800 transition-colors">{n.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5 font-medium">{n.desc}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(n.time).toLocaleString()}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
