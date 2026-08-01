'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  BarChart3, TrendingUp, BedDouble, Utensils, GlassWater,
  Percent, DollarSign, Download, ArrowUpRight, ArrowDownRight, FileText
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toYMD = (d: Date) => d.toISOString().split('T')[0];
const nightsBetween = (ci: string, co: string) => Math.max(0, Math.ceil((new Date(co).getTime() - new Date(ci).getTime()) / 86400000));
const formatMoney = (n: number) => '₦' + Math.round(n).toLocaleString();

// ─── Components ───────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, sub, color, delta }: any) {
  return (
    <div className="bg-[#0D0501] border border-white/10 hover:border-[#D4A373]/50 transition-colors rounded-3xl p-6 shadow-xl relative overflow-hidden group">
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs uppercase tracking-wider text-brown-400 font-bold">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-[#1A0A02] border border-white/5`}>
          <Icon size={18} className="text-[#D4A373]" />
        </div>
      </div>
      <p className="text-3xl font-serif font-bold text-white">{value}</p>
      
      <div className="flex items-center justify-between mt-3">
        {sub && <p className="text-xs text-white/50 font-medium">{sub}</p>}
        {delta !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${delta >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'restaurant' | 'lounge' | 'ledger'>('overview');
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'bookings' | 'restaurant' | 'lounge'>('all');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    const { data: hotel } = await supabase.from('hotels').select('id').eq('slug', 'joebrown').maybeSingle();
    if (!hotel) { setIsLoading(false); return; }
    const hid = hotel.id;

    const [bRes, oRes, oiRes, rRes, cRes] = await Promise.all([
      supabase.from('bookings').select('*').eq('hotel_id', hid),
      supabase.from('orders').select('*').eq('hotel_id', hid),
      supabase.from('order_items').select('*, menu_items(category_id)'),
      supabase.from('rooms').select('id, name').eq('hotel_id', hid),
      supabase.from('menu_categories').select('id, type').eq('hotel_id', hid),
    ]);

    setBookings(bRes.data || []);
    setOrders(oRes.data || []);
    setOrderItems(oiRes.data || []);
    setRooms(rRes.data || []);
    setCategories(cRes.data || []);
    setIsLoading(false);
  };

  // ── Timeframes ─────────────────────────────────────────────────────────────
  const now = new Date();
  const { periodStart, prevPeriodStart, daysInPeriod } = useMemo(() => {
    if (period === 'all') return { periodStart: '2000-01-01', prevPeriodStart: '1900-01-01', daysInPeriod: 365 };
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    
    const d1 = new Date(now); d1.setDate(d1.getDate() - days);
    const d2 = new Date(now); d2.setDate(d2.getDate() - (days * 2));
    
    return { periodStart: toYMD(d1), prevPeriodStart: toYMD(d2), daysInPeriod: days };
  }, [period, now]);

  // ── Metrics Calculation ────────────────────────────────────────────────────
  const calcMetrics = (start: string, end: string) => {
    const bks = bookings.filter(b => b.created_at >= start && b.created_at < end && b.status !== 'cancelled');
    const ords = orders.filter(o => o.payment_status === 'paid' && o.created_at >= start && o.created_at < end);
    
    let roomRev = 0, restRev = 0, loungeRev = 0;
    let restFoodRev = 0, restDrinkRev = 0;
    let loungeFoodRev = 0, loungeDrinkRev = 0;
    let nightsSold = 0;

    bks.forEach(b => {
      roomRev += Number(b.total_amount || 0);
      nightsSold += nightsBetween(b.check_in, b.check_out);
    });

    ords.forEach(o => {
      const stream = o.stream || 'restaurant';
      const items = orderItems.filter(oi => oi.order_id === o.id);
      items.forEach(oi => {
        const catId = oi.menu_items?.category_id;
        const type = categories.find(c => c.id === catId)?.type || 'food';
        const amt = Number(oi.item_price) * Number(oi.quantity);
        if (stream === 'restaurant') {
          restRev += amt;
          if (type === 'food') restFoodRev += amt;
          else restDrinkRev += amt;
        } else {
          loungeRev += amt;
          if (type === 'food') loungeFoodRev += amt;
          else loungeDrinkRev += amt;
        }
      });
    });

    const totalRev = roomRev + restRev + loungeRev;
    const totalAvail = (rooms.length || 1) * daysInPeriod;
    const occ = totalAvail > 0 ? (nightsSold / totalAvail) * 100 : 0;
    const adr = nightsSold > 0 ? roomRev / nightsSold : 0;
    const revpar = adr * (occ / 100);

    return { 
      totalRev, roomRev, restRev, loungeRev, occ, adr, revpar, nightsSold, ordersCount: ords.length, bookingsCount: bks.length,
      restFoodRev, restDrinkRev, loungeFoodRev, loungeDrinkRev
    };
  };

  const curr = useMemo(() => calcMetrics(periodStart, '2100-01-01'), [periodStart, bookings, orders, orderItems, categories, rooms]);
  const prev = useMemo(() => calcMetrics(prevPeriodStart, periodStart), [prevPeriodStart, periodStart, bookings, orders, orderItems, categories, rooms]);

  const calcDelta = (c: number, p: number) => (p === 0 ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100);
  const deltas = {
    totalRev: calcDelta(curr.totalRev, prev.totalRev),
    roomRev: calcDelta(curr.roomRev, prev.roomRev),
    restRev: calcDelta(curr.restRev, prev.restRev),
    loungeRev: calcDelta(curr.loungeRev, prev.loungeRev),
    occ: calcDelta(curr.occ, prev.occ),
    adr: calcDelta(curr.adr, prev.adr),
    revpar: calcDelta(curr.revpar, prev.revpar),
  };

  // ── Ledger Entries ────────────────────────────────────────────────────────
  const ledgerEntries = useMemo(() => {
    const entries: any[] = [];
    bookings.forEach(b => {
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

    orders.forEach(o => {
      if (o.created_at >= periodStart) {
        const stream = o.stream || 'restaurant';
        const items = orderItems.filter(oi => oi.order_id === o.id);
        let totalAmt = 0;
        items.forEach(oi => {
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

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bookings, orders, orderItems, categories, periodStart]);

  const filteredLedger = useMemo(() => {
    if (ledgerFilter === 'all') return ledgerEntries;
    return ledgerEntries.filter(e => e.stream === ledgerFilter);
  }, [ledgerEntries, ledgerFilter]);


  // ── Render Helpers ────────────────────────────────────────────────────────
  if (isLoading) return <div className="p-8 text-center animate-pulse text-brown-500">Loading Analytics...</div>;

  return (
    <div className="animate-fade-in-up space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BarChart3 size={28} className="text-[#D4A373]" />
            <h1 className="text-3xl font-serif text-white font-bold">Analytics & Revenue</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Tabs */}
            <div className="flex bg-[#0D0501] border border-white/10 rounded-2xl p-1.5 gap-1 shadow-xl">
              {(['overview', 'bookings', 'restaurant', 'lounge', 'ledger'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all capitalize ${activeTab === tab ? 'bg-[#D4A373] text-[#1A0A02]' : 'text-white/50 hover:text-white'}`}>
                  {tab}
                </button>
              ))}
            </div>
            {/* Timeframe */}
            <div className="flex bg-[#0D0501] border border-white/10 rounded-2xl p-1.5 gap-1 shadow-xl">
              {(['7d', '30d', '90d', 'all'] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${period === p ? 'bg-[#1A0A02] text-[#1A0A02]' : 'text-white/50 hover:text-white'}`}>
                  {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : 'All Time'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      {activeTab !== 'ledger' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(activeTab === 'overview') && (
            <KPICard icon={TrendingUp} label="Total Revenue" value={formatMoney(curr.totalRev)} sub="All Streams" color="bg-brown-600" delta={deltas.totalRev} />
          )}
          {(activeTab === 'overview' || activeTab === 'bookings') && (
            <>
              <KPICard icon={BedDouble} label="Room Revenue" value={formatMoney(curr.roomRev)} sub={`${curr.nightsSold} nights`} color="bg-brown-500/200" delta={deltas.roomRev} />
              <KPICard icon={Percent} label="Occupancy" value={`${curr.occ.toFixed(1)}%`} sub="Avg fill rate" color="bg-brown-500/200" delta={deltas.occ} />
              <KPICard icon={DollarSign} label="RevPAR" value={formatMoney(curr.revpar)} sub="Per available room" color="bg-brown-500/200" delta={deltas.revpar} />
            </>
          )}
          {(activeTab === 'overview' || activeTab === 'restaurant') && (
            <>
              <KPICard icon={Utensils} label="Restaurant Rev" value={formatMoney(curr.restRev)} sub="Total sales" color="bg-brown-500/200" delta={deltas.restRev} />
              {activeTab === 'restaurant' && (
                <>
                  <KPICard icon={Utensils} label="Food Sales" value={formatMoney(curr.restFoodRev)} sub="In Restaurant" color="bg-emerald-400" />
                  <KPICard icon={GlassWater} label="Drink Sales" value={formatMoney(curr.restDrinkRev)} sub="In Restaurant" color="bg-brown-500/200" />
                </>
              )}
            </>
          )}
          {(activeTab === 'overview' || activeTab === 'lounge') && (
            <>
              <KPICard icon={GlassWater} label="Lounge Rev" value={formatMoney(curr.loungeRev)} sub="Total sales" color="bg-brown-500/200" delta={deltas.loungeRev} />
              {activeTab === 'lounge' && (
                <>
                  <KPICard icon={Utensils} label="Food Sales" value={formatMoney(curr.loungeFoodRev)} sub="In Lounge" color="bg-amber-400" />
                  <KPICard icon={GlassWater} label="Drink Sales" value={formatMoney(curr.loungeDrinkRev)} sub="In Lounge" color="bg-brown-500/200" />
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Ledger UI ── */}
      {activeTab === 'ledger' && (
        <div className="bg-[#0D0501] border border-white/10 rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white/5">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-[#D4A373]" />
              <h2 className="font-serif text-xl font-bold text-white">Financial Ledger</h2>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              {/* Filter */}
              <div className="flex bg-[#1A0A02] rounded-xl p-1.5 border border-white/5">
                {(['all', 'bookings', 'restaurant', 'lounge'] as const).map(f => (
                  <button key={f} onClick={() => setLedgerFilter(f)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${ledgerFilter === f ? 'bg-[#D4A373] shadow-md text-[#1A0A02]' : 'text-white/50 hover:text-white'}`}>
                    {f}
                  </button>
                ))}
              </div>
              <a 
                href={`/api/export-ledger?range=${period}&stream=${ledgerFilter}`}
                download
                className="flex items-center gap-2 bg-[#D4A373] hover:bg-[#b45309] text-[#1A0A02] px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
              >
                <Download size={18} /> Export CSV
              </a>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 border-b border-white/10">
                  <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Date</th>
                  <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">ID</th>
                  <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Stream</th>
                  <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Customer</th>
                  <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider">Status</th>
                  <th className="p-5 text-xs font-bold text-white/50 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLedger.length === 0 ? (
                  <tr><td colSpan={6} className="p-10 text-center text-white/40">No records found.</td></tr>
                ) : (
                  filteredLedger.map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-5 text-sm text-white/70">{new Date(row.date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}</td>
                      <td className="p-5 text-sm font-mono text-white font-medium">{row.id}</td>
                      <td className="p-5 text-sm">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          row.stream === 'bookings' ? 'bg-brown-500/200/20 text-blue-300' :
                          row.stream === 'restaurant' ? 'bg-brown-500/200/20 text-emerald-300' : 'bg-brown-500/200/20 text-amber-300'
                        }`}>
                          {row.stream}
                        </span>
                      </td>
                      <td className="p-5 text-sm text-white/80">{row.customer}</td>
                      <td className="p-5 text-sm">
                        <span className={`capitalize text-xs font-bold ${
                          ['paid', 'confirmed'].includes(row.status) ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-5 text-sm font-bold text-white text-right font-serif">
                        ₦{row.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
