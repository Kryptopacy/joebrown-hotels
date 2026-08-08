import React from 'react';

export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { LayoutDashboard, BedDouble, UtensilsCrossed, Settings, QrCode, BookOpen, Headset, Shield, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import AdminPageHeader from '@/components/AdminPageHeader';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: hotel } = await supabase.from('hotels').select('name, id').eq('slug', 'joebrown').maybeSingle();

  let stats = {
    bookings: 0,
    rooms: 0,
    menuItems: 0,
    tables: 0,
    intercomCalls: 0,
    occupancyRate: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  };

  if (hotel) {
    const [bookingsRes, roomsRes, menuRes, tablesRes, intercomRes, pendingOrdersRes] = await Promise.all([
      supabase.from('bookings').select('id, total_price', { count: 'exact' }).eq('hotel_id', hotel.id),
      supabase.from('rooms').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id),
      supabase.from('menu_items').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id),
      supabase.from('tables_config').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id),
      supabase.from('customer_intercom_messages').select('session_id').eq('hotel_id', hotel.id),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('hotel_id', hotel.id).eq('status', 'pending'),
    ]);

    const totalRev = bookingsRes.data?.reduce((acc, b) => acc + (Number(b.total_price) || 0), 0) || 0;

    stats = {
      bookings: bookingsRes.count || 0,
      rooms: roomsRes.count || 0,
      menuItems: menuRes.count || 0,
      tables: tablesRes.count || 0,
      intercomCalls: intercomRes.data ? new Set(intercomRes.data.map((m: any) => m.session_id)).size : 0,
      totalRevenue: totalRev,
      occupancyRate: roomsRes.count ? Math.min(100, Math.round(((bookingsRes.count || 0) / roomsRes.count) * 100)) : 0,
      pendingOrders: pendingOrdersRes.count || 0,
    };
  }

  const kpis = [
    { title: 'Est. Revenue', value: `₦${stats.totalRevenue.toLocaleString()}`, change: 'Total', icon: DollarSign, color: 'border-brown-300 bg-[#1A0A02] text-brown-300' },
    { title: 'Est. Occupancy', value: `${stats.occupancyRate}%`, change: 'Current', icon: TrendingUp, color: 'border-emerald-300 bg-[#1A0A02] text-brown-300' },
    { title: 'Total Bookings', value: stats.bookings.toString(), change: 'Lifetime', icon: BookOpen, color: 'border-purple-300 bg-[#1A0A02] text-brown-300' },
    { title: 'Intercom Inquiries', value: stats.intercomCalls.toString(), change: 'Real-time', icon: Headset, color: 'border-red-300 bg-[#1A0A02] text-brown-300' },
    { title: 'Pending Orders', value: stats.pendingOrders.toString(), change: 'Live', icon: ShoppingBag, color: 'border-orange-300 bg-[#1A0A02] text-brown-300' },
  ];

  const quickLinks = [
    { title: 'Intercom Hub', icon: Headset, href: '/admin/intercom', desc: `${stats.intercomCalls} Live guest inquiries`, bg: 'bg-brown-500/20 text-brown-300 border-brown-500/30' },
    { title: 'Staff Roles (RBAC)', icon: Shield, href: '/admin/staff', desc: 'Role-based access permissions', bg: 'bg-brown-500/20 text-brown-300 border-brown-500/30' },
    { title: 'Bookings Tracker', icon: BookOpen, href: '/admin/bookings', desc: `${stats.bookings} Reservations total`, bg: 'bg-brown-500/20 text-brown-300 border-brown-500/30' },
    { title: 'Restaurant & Lounge Orders', icon: ShoppingBag, href: '/admin/orders', desc: `${stats.pendingOrders} Pending orders`, bg: 'bg-brown-500/20 text-brown-300 border-brown-500/30' },
    { title: 'Rooms & Suites', icon: BedDouble, href: '/admin/rooms', desc: `${stats.rooms} Configured rooms`, bg: 'bg-brown-500/20 text-brown-300 border-brown-500/30' },
    { title: 'Restaurant & Lounge Menu', icon: UtensilsCrossed, href: '/admin/menu', desc: `${stats.menuItems} F&B Items`, bg: 'bg-brown-500/20 text-brown-300 border-brown-500/30' },
    { title: 'Table QR Codes', icon: QrCode, href: '/admin/qr', desc: `${stats.tables} Tables configured`, bg: 'bg-brown-500/20 text-brown-300 border-brown-500/30' },
  ];

  return (
    <div className="animate-fade-in-up space-y-8">
      {/* Header */}
      <AdminPageHeader
        title="Management Portal"
        icon={LayoutDashboard}
        subtitle={`Operational overview for ${hotel?.name || 'Joebrown Palace Hotel and Suites'}`}
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Overview' }]}
      />

      {/* Welcome Banner */}
      <div className="p-8 bg-white/[0.02] border border-white/10 rounded-2xl shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#D4A373]/80 via-transparent to-transparent"></div>
        <h2 className="text-2xl font-serif text-white mb-2 font-semibold">
          {hotel?.name || 'Joebrown Palace Hotel and Suites'} Staff Dashboard
        </h2>
        <p className="text-sm text-white/60 font-normal">
          Monitor guest bookings, live intercom inquiries, menu items, and room status in real-time.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`p-6 bg-[#0D0501] border border-white/10 hover:border-[#D4A373]/50 transition-colors rounded-3xl shadow-xl`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs uppercase tracking-wider text-brown-400 font-bold">{kpi.title}</span>
                <div className="p-2.5 rounded-xl bg-[#1A0A02] border border-white/5">
                  <Icon size={18} className="text-[#D4A373]" />
                </div>
              </div>
              <div className="text-3xl font-serif text-white mb-2 font-bold">{kpi.value}</div>
              <span className="text-[11px] text-[#D4A373] font-mono font-semibold">{kpi.change} Activity</span>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-xl font-serif text-white mb-6 font-semibold">Operational Shortcuts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.title}
                href={link.href}
                className="p-6 flex items-start gap-5 hover:border-[#D4A373]/50 transition-all bg-[#0D0501] border border-white/10 rounded-3xl shadow-xl group"
              >
                <div className={`p-4 rounded-2xl bg-[#1A0A02] border border-white/5 group-hover:bg-[#D4A373]/10 transition-colors text-[#D4A373]`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className="text-lg text-white font-semibold mb-1 font-serif group-hover:text-[#D4A373] transition-colors">{link.title}</h4>
                  <p className="text-xs text-white/60 font-normal">{link.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
