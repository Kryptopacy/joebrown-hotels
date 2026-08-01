'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, Crown, Phone, Mail, Search, Star, RefreshCw, TrendingUp, Filter, ShoppingBag } from 'lucide-react';

const NAIRA_PER_POINT = 1000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function CRMPage() {
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [guestSearch, setGuestSearch] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'hotel' | 'bar_kitchen'>('all');
  const [dbGuests, setDbGuests] = useState<any[]>([]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    const { data: hotel } = await supabase.from('hotels').select('id').eq('slug', 'joebrown').maybeSingle();
    if (!hotel) { setIsLoading(false); return; }

    const { data: b } = await supabase
      .from('bookings')
      .select('*, rooms(name)')
      .eq('hotel_id', hotel.id)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false });

    const { data: g } = await supabase
      .from('guests')
      .select('*')
      .eq('hotel_id', hotel.id);

    setBookings(b || []);
    setDbGuests(g || []);
    setIsLoading(false);
  };

  // ── Guest profiles derived from bookings AND guests table ─────────────────
  // Each unique phone = one guest profile. We detect repeats automatically.

  const guestProfiles = useMemo(() => {
    const map: Record<string, {
      phone: string; name: string; email?: string;
      visits: any[]; totalSpend: number; lastStay: string; firstStay: string;
      points: number; types: Set<string>;
    }> = {};

    // 1. Process bookings (Hotel Guests)
    bookings.forEach(b => {
      const key = b.guest_phone;
      if (!map[key]) {
        map[key] = {
          phone: b.guest_phone,
          name: b.guest_name,
          email: b.guest_email,
          visits: [],
          totalSpend: 0,
          lastStay: b.check_in,
          firstStay: b.check_in,
          points: 0,
          types: new Set(['Hotel'])
        };
      }
      map[key].visits.push(b);
      map[key].totalSpend += Number(b.total_amount || 0);
      map[key].types.add('Hotel');
      if (b.check_in > map[key].lastStay) map[key].lastStay = b.check_in;
      if (b.check_in < map[key].firstStay) map[key].firstStay = b.check_in;
    });

    // 2. Process guests (Restaurant & Lounge Customers)
    dbGuests.forEach(g => {
      const key = g.phone_number;
      if (!map[key]) {
        map[key] = {
          phone: g.phone_number,
          name: g.name,
          visits: [],
          totalSpend: 0,
          lastStay: new Date().toISOString(), // Bar customers don't have stays, fallback
          firstStay: new Date().toISOString(),
          points: 0,
          types: new Set()
        };
      }
      map[key].types.add('Restaurant & Lounge');
      map[key].totalSpend += Number(g.total_spend || 0);
      map[key].points += Number(g.loyalty_points || 0);
      // We don't have discrete 'visits' for food orders, but we can fake an empty array to not break UI
    });

    return Object.values(map).map(p => {
      // Calculate dynamic points from bookings (1 pt per NAIRA_PER_POINT)
      const bookingSpend = p.visits.reduce((acc, v) => acc + Number(v.total_amount || 0), 0);
      p.points += Math.floor(bookingSpend / NAIRA_PER_POINT);
      return p;
    }).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [bookings, dbGuests]);

  const filtered = useMemo(() => {
    let result = guestProfiles;

    // Filter by Tab
    if (activeTab === 'hotel') {
      result = result.filter(g => g.types.has('Hotel'));
    } else if (activeTab === 'bar_kitchen') {
      result = result.filter(g => g.types.has('Restaurant & Lounge'));
    }

    // Filter by Search
    if (guestSearch) {
      const q = guestSearch.toLowerCase();
      result = result.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.phone.includes(q) ||
        g.email?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [guestProfiles, guestSearch, activeTab]);

  const repeatGuests = guestProfiles.filter(g => g.visits.length > 1);
  const totalRevenue = guestProfiles.reduce((s, g) => s + g.totalSpend, 0);

  const selected = selectedGuest ? guestProfiles.find(g => g.phone === selectedGuest) : null;

  // ─────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="animate-fade-in-up space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded bg-white/10 animate-pulse"></div>
          <div className="h-8 w-64 bg-white/10 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#0D0501] border border-white/10 rounded-3xl p-5 shadow-sm animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="h-3 bg-white/10 rounded w-24"></div>
                <div className="w-9 h-9 rounded-xl bg-white/10"></div>
              </div>
              <div className="h-8 bg-white/10 rounded w-20"></div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 animate-pulse">
          <div className="h-11 bg-[#0D0501] border border-white/10 rounded-xl flex-1"></div>
          <div className="h-11 bg-[#0D0501] border border-white/10 rounded-xl w-64 hidden sm:block"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm h-[600px] animate-pulse"></div>
          <div className="lg:col-span-3 bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm h-[600px] animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users size={28} className="text-[#D4A373]" />
          <h1 className="text-3xl font-serif text-white font-bold">CRM — Guest Intelligence</h1>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 text-sm text-white/50 hover:text-[#D4A373] transition-colors font-bold self-start">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users,     label: 'Total Unique Guests', value: guestProfiles.length.toString(),      color: 'bg-brown-600' },
          { icon: RefreshCw, label: 'Returning Guests',    value: repeatGuests.length.toString(),       color: 'bg--500/200' },
          { icon: TrendingUp,label: 'Lifetime Revenue',    value: `₦${totalRevenue.toLocaleString()}`,  color: 'bg--500/200' },
          { icon: Star,      label: 'Avg Spend / Guest',   value: `₦${guestProfiles.length > 0 ? Math.round(totalRevenue / guestProfiles.length).toLocaleString() : 0}`, color: 'bg--500/200' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-[#0D0501] border border-white/10 rounded-3xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-white/50 font-bold">{label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={16} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-serif font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            type="text"
            placeholder="Search guest by name, phone, or email…"
            value={guestSearch}
            onChange={e => setGuestSearch(e.target.value)}
            className="w-full pl-11 h-11 bg-[#0D0501] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brown-500 shadow-sm transition-all"
          />
        </div>
        <div className="flex bg-[#0D0501] border border-white/10 rounded-xl p-1 shrink-0 overflow-x-auto">
          {[
            { id: 'all', label: 'All Customers' },
            { id: 'hotel', label: 'Hotel' },
            { id: 'bar_kitchen', label: 'Restaurant & Lounge' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'hotel' | 'bar_kitchen')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#D4A373] text-[#1A0A02]'
                  : 'text-white/50 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guest List + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Guest List */}
        <div className="lg:col-span-2 bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <h2 className="font-serif font-bold text-white">All Guests</h2>
            <span className="text-xs text-white/40 font-bold">{filtered.length} guests</span>
          </div>
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-6 text-white/40 text-sm text-center">No guests found.</p>
            ) : filtered.map((guest, idx) => {
              const isRepeat = guest.visits.length > 1;
              const isSelected = selectedGuest === guest.phone;
              const isTop3 = idx < 3;
              return (
                <button
                  key={guest.phone}
                  onClick={() => setSelectedGuest(isSelected ? null : guest.phone)}
                  className={`w-full text-left p-4 flex items-center gap-3 hover:bg-white/5 transition-colors ${isSelected ? 'bg-[#1A0A02] border-l-2 border-brown-500' : ''}`}
                >
                  {/* Avatar / rank */}
                  <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-sm ${
                    isTop3 ? 'bg-[#1A0A02] text-[#D4A373]' : 'bg-white/10 text-white/50'
                  }`}>
                    {isTop3 ? <Crown size={14} className="text-[#D4A373]" /> : guest.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-white text-sm truncate">{guest.name}</p>
                      {guest.types.has('Hotel') && guest.types.has('Restaurant & Lounge') ? (
                        <span className="shrink-0 text-[9px] bg--500/20 text-purple-600 border border--500/30 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">Both</span>
                      ) : guest.types.has('Hotel') ? (
                        <span className="shrink-0 text-[9px] bg--500/20 text-blue-600 border border--500/30 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">Hotel</span>
                      ) : (
                        <span className="shrink-0 text-[9px] bg--500/20 text-orange-600 border border--500/30 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">Restaurant & Lounge</span>
                      )}
                      {isRepeat && (
                        <span className="shrink-0 text-[9px] bg--500/20 text-emerald-600 border border--500/30 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">Returning</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-serif font-bold text-[#D4A373] text-sm">₦{guest.totalSpend.toLocaleString()}</p>
                    <p className="text-[10px] text-white/40 font-bold flex items-center gap-1 justify-end mt-0.5"><Star size={10} className="text-brown-400 fill-brown-400" /> {guest.points} pts</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Guest Detail Panel */}
        <div className="lg:col-span-3">
          {!selected ? (
            <div className="bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm p-12 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <Users size={36} className="text-white/20 mb-3" />
              <p className="text-white/40 font-medium">Select a guest to view their profile</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-serif font-bold text-white">{selected.name}</h2>
                      {selected.visits.length > 1 && (
                        <span className="text-[10px] bg--500/20 text-blue-600 border border--500/30 font-bold px-2 py-0.5 rounded-full uppercase">Returning Guest</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <a href={`tel:${selected.phone}`} className="flex items-center gap-1.5 text-sm text-white/60 hover:text-[#D4A373] transition-colors">
                        <Phone size={13} /> {selected.phone}
                      </a>
                      {selected.email && (
                        <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 text-sm text-white/60 hover:text-[#D4A373] transition-colors">
                          <Mail size={13} /> {selected.email}
                        </a>
                      )}
                      <div className="flex gap-1.5 mt-1">
                        {Array.from(selected.types).map((type: string) => (
                           <span key={type} className="text-[10px] bg-white/10 text-white/60 border border-white/10 font-bold px-2 py-0.5 rounded-full uppercase">{type} Customer</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selected.name}! Thank you for choosing Joebrown Palace Hotels & Lounge.`)}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 bg--500/200 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.558 4.13 1.535 5.868L0 24l6.271-1.521A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.807 9.807 0 01-5.032-1.378l-.36-.214-3.724.977.993-3.63-.234-.374A9.786 9.786 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.42 0 9.818 4.398 9.818 9.818 0 5.421-4.398 9.818-9.818 9.818z"/></svg>
                    Message Guest
                  </a>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-white/10">
                  {[
                    { label: 'Total Stays',    value: selected.visits.length.toString() },
                    { label: 'Lifetime Spend', value: `₦${selected.totalSpend.toLocaleString()}` },
                    { label: 'Loyalty Pts',    value: selected.points.toString() },
                    { label: 'Last Active',      value: selected.visits.length > 0 ? fmt(selected.lastStay) : 'Recently' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#1A0A02] rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">{label}</p>
                      <p className="font-serif font-bold text-white text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stay History */}
              {selected.visits.length > 0 ? (
                <div className="bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <h3 className="font-serif font-bold text-white">Stay History</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {selected.visits.map((v: any) => {
                      const statusMeta: Record<string, string> = {
                        pending: 'bg-[#1A0A02] text-[#D4A373] border-white/10',
                        confirmed: 'bg--500/20 text--300 border--500/30',
                        checked_in: 'bg--500/20 text--300 border--500/30',
                        checked_out: 'bg--500/20 text--300 border-white/10',
                      };
                      const color = statusMeta[v.status] || 'bg--500/20 text--300 border-white/10';
                      
                      return (
                        <div key={v.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1A0A02]/30 transition-colors">
                          <div>
                            <p className="font-bold text-white text-sm mb-1">{v.rooms?.name || 'Unknown Room'}</p>
                            <p className="text-xs text-white/50 font-medium">
                              {fmt(v.check_in)} — {fmt(v.check_out)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${color}`}>
                              {v.status.replace('_', ' ')}
                            </span>
                            <span className="font-serif font-bold text-[#D4A373]">₦{Number(v.total_amount).toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm p-8 text-center">
                  <ShoppingBag size={24} className="text-white/20 mx-auto mb-2" />
                  <p className="text-white/50 text-sm font-medium">This customer has only placed Restaurant & Lounge orders.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Returning Guests Highlight */}
      {repeatGuests.length > 0 && (
        <div className="bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center gap-2 bg-white/5">
            <Crown size={18} className="text-[#D4A373]" />
            <h2 className="font-serif font-bold text-white">VIP — Top Returning Guests</h2>
            <span className="text-xs text-white/40 font-bold ml-auto">{repeatGuests.length} returning guests</span>
          </div>
          <div className="divide-y divide-white/5">
            {repeatGuests.slice(0, 10).map((guest, idx) => (
              <div key={guest.phone} className="p-5 flex items-center justify-between hover:bg-[#1A0A02]/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? 'bg-[#1A0A02] text-[#D4A373]' : 'bg-white/10 text-white/50'
                  }`}>#{idx + 1}</div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{guest.name}</h3>
                    <p className="text-xs text-white/50">{guest.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-serif font-bold text-[#D4A373]">₦{guest.totalSpend.toLocaleString()}</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{guest.visits.length} stays</p>
                  <span className="text-xs font-bold text-blue-600 bg--500/20 border border--500/30 rounded-full px-2 py-0.5 inline-block mt-0.5">↩ Returning</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
