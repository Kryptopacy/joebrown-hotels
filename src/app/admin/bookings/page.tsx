'use client';

import React, { useEffect, useState, useMemo, Fragment } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  BookOpen, Search, Calendar as CalendarIcon, User, Phone, Mail, 
  CalendarCheck, CalendarX, BedDouble, Clock, Plus, 
  ChevronLeft, ChevronRight, X, BarChart3, List, Wrench, CreditCard, Award, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hotelId, setHotelId] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<'table' | 'calendar' | 'timeline'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('month');
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Maintenance Form State
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintRoomId, setMaintRoomId] = useState('');
  const [maintCheckIn, setMaintCheckIn] = useState('');
  const [maintCheckOut, setMaintCheckOut] = useState('');
  const [isSubmittingMaint, setIsSubmittingMaint] = useState(false);

  // Guest Intelligence & Sidebar State
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [guestProfile, setGuestProfile] = useState<any>(null);

  // Manual Booking Form State
  const [mbRoomId, setMbRoomId] = useState('');
  const [mbCheckIn, setMbCheckIn] = useState('');
  const [mbCheckOut, setMbCheckOut] = useState('');
  const [mbGuestsCount, setMbGuestsCount] = useState('1');
  const [mbGuestName, setMbGuestName] = useState('');
  const [mbGuestPhone, setMbGuestPhone] = useState('');
  const [mbGuestEmail, setMbGuestEmail] = useState('');
  const [mbSpecialReqs, setMbSpecialReqs] = useState('');
  const [mbStatus, setMbStatus] = useState('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchHotelIdAndData();
  }, []);

  useEffect(() => {
    const fetchGuestProfile = async () => {
      if (!selectedBooking?.guest_phone) {
        setGuestProfile(null);
        return;
      }
      const { data } = await supabase.from('guests').select('*').eq('phone_number', selectedBooking.guest_phone).maybeSingle();
      if (data) {
        setGuestProfile(data);
      } else {
        setGuestProfile(null);
      }
    };
    fetchGuestProfile();
  }, [selectedBooking, supabase]);

  const fetchHotelIdAndData = async () => {
    const { data: hotelData } = await supabase.from('hotels').select('id').eq('slug', 'joebrown').single();
    if (hotelData) {
      setHotelId(hotelData.id);
      fetchRooms(hotelData.id);
      fetchBookings(hotelData.id);
    }
  };

  const fetchRooms = async (hid: string) => {
    const { data } = await supabase.from('rooms').select('id, name, price_per_night').eq('hotel_id', hid);
    if (data) setRooms(data);
  };

  const fetchBookings = async (hid: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*, rooms(name)')
      .eq('hotel_id', hid)
      .order('check_in', { ascending: false });
      
    if (data) setBookings(data);
    setIsLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
    if (error) {
      toast.error('Failed to update booking status.');
    } else {
      toast.success(`Booking marked as ${newStatus.replace('_', ' ')}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'checked_in': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'maintenance': return 'bg-white/10 text-white/80 border-white/20';
      default: return 'bg-[#1A0A02] text-[#D4A373] border-white/10'; // pending
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch(status) {
      case 'paid': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-800 border border-emerald-200">Paid</span>;
      case 'unpaid': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-800 border border-red-200">Unpaid</span>;
      default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white/10 text-brown-800 border border-white/10">Pending</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  };

  const compareDates = (dateA: string, dateB: string) => {
    if (!dateA || !dateB) return 0;
    const a = new Date(dateA);
    const b = new Date(dateB);
    return Math.ceil((b.getTime() - a.getTime()) / (1000 * 3600 * 24));
  }

  // --- TODAY PANEL STATS ---
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDate = new Date(todayStr);

  const stats = useMemo(() => {
    let arrivals = 0, departures = 0, inHouse = 0, pending = 0;
    bookings.forEach(b => {
      const bCheckIn = new Date(b.check_in).toISOString().split('T')[0];
      const bCheckOut = new Date(b.check_out).toISOString().split('T')[0];
      
      if (bCheckIn === todayStr && (b.status === 'confirmed' || b.status === 'pending')) arrivals++;
      if (bCheckOut === todayStr && b.status === 'checked_in') departures++;
      if (bCheckIn <= todayStr && bCheckOut > todayStr && b.status === 'checked_in') inHouse++;
      if (b.status === 'pending') pending++;
    });
    return { arrivals, departures, inHouse, pending };
  }, [bookings, todayStr]);

  // --- FILTERING ---
  const filteredBookings = useMemo(() => {
    let filtered = bookings.filter(b => 
      b.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (b.guest_email && b.guest_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      b.guest_phone.includes(searchTerm)
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (dateRange !== 'all') {
      const now = new Date();
      if (dateRange === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        filtered = filtered.filter(b => b.check_in >= startOfMonth && b.check_in <= endOfMonth);
      } else if (dateRange === 'week') {
        const last7 = new Date(now);
        last7.setDate(last7.getDate() - 7);
        const last7Str = last7.toISOString().split('T')[0];
        const todayS = now.toISOString().split('T')[0];
        filtered = filtered.filter(b => b.check_in >= last7Str && b.check_in <= todayS);
      }
    }

    return filtered;
  }, [bookings, searchTerm, statusFilter, dateRange]);


  // --- MANUAL BOOKING SUBMIT ---
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelId || !mbRoomId || !mbCheckIn || !mbCheckOut || !mbGuestName || !mbGuestPhone) {
      toast.error('Please fill out all required fields.');
      return;
    }

    if (mbCheckIn >= mbCheckOut) {
      toast.error('Check-out date must be after check-in date.');
      return;
    }

    setIsSubmitting(true);

    // Conflict Check
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', mbRoomId)
      .not('status', 'eq', 'cancelled')
      .or(`and(check_in.lt.${mbCheckOut},check_out.gt.${mbCheckIn})`);

    if (conflicts && conflicts.length > 0) {
      toast.error('Room is not available for these dates.');
      setIsSubmitting(false);
      return;
    }

    const room = rooms.find(r => r.id === mbRoomId);
    const nights = compareDates(mbCheckIn, mbCheckOut);
    const totalAmount = nights * (room?.price_per_night || 0);

    const { error } = await supabase.from('bookings').insert({
      hotel_id: hotelId,
      room_id: mbRoomId,
      guest_name: mbGuestName,
      guest_phone: mbGuestPhone,
      guest_email: mbGuestEmail,
      check_in: mbCheckIn,
      check_out: mbCheckOut,
      guests_count: parseInt(mbGuestsCount),
      special_requests: mbSpecialReqs,
      status: mbStatus,
      total_amount: totalAmount,
      payment_status: 'unpaid'
    });

    if (error) {
      console.error(error);
      toast.error('Failed to create booking.');
    } else {
      toast.success('Booking created successfully!');
      setIsBookingModalOpen(false);
      fetchBookings(hotelId);
      // Reset form
      setMbRoomId('');
      setMbCheckIn('');
      setMbCheckOut('');
      setMbGuestName('');
      setMbGuestPhone('');
      setMbGuestEmail('');
      setMbSpecialReqs('');
    }
    setIsSubmitting(false);
  };

  // --- MAINTENANCE SUBMIT ---
  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelId || !maintRoomId || !maintCheckIn || !maintCheckOut) {
      toast.error('Please fill out all required fields.');
      return;
    }

    if (maintCheckIn >= maintCheckOut) {
      toast.error('End date must be after start date.');
      return;
    }

    setIsSubmittingMaint(true);

    // Conflict Check
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', maintRoomId)
      .not('status', 'eq', 'cancelled')
      .or(`and(check_in.lt.${maintCheckOut},check_out.gt.${maintCheckIn})`);

    if (conflicts && conflicts.length > 0) {
      toast.error('Room is not available for these dates.');
      setIsSubmittingMaint(false);
      return;
    }

    const { error } = await supabase.from('bookings').insert({
      hotel_id: hotelId,
      room_id: maintRoomId,
      guest_name: 'MAINTENANCE',
      guest_phone: 'N/A',
      guest_email: 'N/A',
      check_in: maintCheckIn,
      check_out: maintCheckOut,
      guests_count: 1,
      special_requests: 'Room blocked for maintenance',
      status: 'maintenance',
      total_amount: 0,
      payment_status: 'paid'
    });

    if (error) {
      console.error(error);
      toast.error('Failed to create maintenance block.');
    } else {
      toast.success('Room blocked for maintenance successfully!');
      setIsMaintenanceModalOpen(false);
      fetchBookings(hotelId);
      setMaintRoomId('');
      setMaintCheckIn('');
      setMaintCheckOut('');
    }
    setIsSubmittingMaint(false);
  };

  const handleDropBooking = async (e: React.DragEvent, targetRoomId: string, targetCheckIn: string) => {
    e.preventDefault();
    const bookingId = e.dataTransfer.getData('booking_id');
    if (!bookingId) return;

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const nights = compareDates(booking.check_in, booking.check_out);
    const newCheckOutDate = new Date(targetCheckIn);
    newCheckOutDate.setDate(newCheckOutDate.getDate() + nights);
    const newCheckOut = newCheckOutDate.toISOString().split('T')[0];

    // Optimistic update
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, room_id: targetRoomId, check_in: targetCheckIn, check_out: newCheckOut } : b));
    
    const { error } = await supabase.from('bookings').update({ 
      room_id: targetRoomId, 
      check_in: targetCheckIn, 
      check_out: newCheckOut 
    }).eq('id', bookingId);
    
    if (error) {
      toast.error('Failed to update booking dates.');
      if (hotelId) fetchBookings(hotelId); // revert
    } else {
      toast.success('Booking reassigned successfully.');
    }
  };


  // --- VIEWS COMPONENTS ---
  const TableView = () => (
    <div className="glass-card bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm overflow-x-auto min-h-[500px]">
      <table className="w-full text-left min-w-[900px]">
        <thead className="bg-[#1A0A02] border-b border-white/10">
          <tr>
            <th className="p-4 text-xs tracking-wider uppercase text-white/60 font-semibold sticky left-0 bg-[#1A0A02] z-10 border-r border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap">Guest Info</th>
            <th className="p-4 text-xs tracking-wider uppercase text-white/60 font-semibold">Reservation Dates</th>
            <th className="p-4 text-xs tracking-wider uppercase text-white/60 font-semibold">Room & Amount</th>
            <th className="p-4 text-xs tracking-wider uppercase text-white/60 font-semibold">Payment</th>
            <th className="p-4 text-xs tracking-wider uppercase text-white/60 font-semibold">Details</th>
            <th className="p-4 text-xs tracking-wider uppercase text-white/60 font-semibold text-center whitespace-nowrap">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <tr key={i} className="animate-pulse border-b border-white/10">
                <td className="p-4"><div className="h-4 bg-white/10 rounded w-32 mb-2"></div><div className="h-3 bg-white/5 rounded w-24"></div></td>
                <td className="p-4"><div className="h-4 bg-white/10 rounded w-28 mb-2"></div><div className="h-3 bg-white/5 rounded w-20"></div></td>
                <td className="p-4"><div className="h-4 bg-white/10 rounded w-24 mb-2"></div><div className="h-4 bg-white/5 rounded w-16"></div></td>
                <td className="p-4"><div className="h-6 bg-white/10 rounded-full w-16"></div></td>
                <td className="p-4"><div className="h-4 bg-white/10 rounded w-16 mb-2"></div><div className="h-3 bg-white/5 rounded w-32"></div></td>
                <td className="p-4"><div className="h-6 bg-white/10 rounded-full w-24 mx-auto"></div></td>
              </tr>
            ))
          ) : filteredBookings.length === 0 ? (
            <tr><td colSpan={6} className="p-8 text-center text-white/50 font-medium">No bookings found.</td></tr>
          ) : (
            filteredBookings.map((booking) => (
              <tr key={booking.id} onClick={() => setSelectedBooking(booking)} className="hover:bg-white/5 transition-colors relative group cursor-pointer">
                <td className="p-4 align-top sticky left-0 bg-[#0D0501] group-hover:bg-white/5 z-10 border-r border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap transition-colors">
                  <div className="flex items-center gap-2 font-semibold text-white mb-1"><User size={14} className="text-white/40"/> {booking.guest_name}</div>
                  <div className="flex items-center gap-2 text-xs text-white/60 mb-1"><Phone size={12}/> {booking.guest_phone}</div>
                  {booking.guest_email && <div className="flex items-center gap-2 text-xs text-white/60"><Mail size={12}/> {booking.guest_email}</div>}
                </td>
                <td className="p-4 align-top">
                  <div className="flex items-center gap-2 text-white font-medium mb-1">
                    <CalendarIcon size={14} className="text-[#D4A373]"/>
                    {formatDate(booking.check_in)}
                  </div>
                  <div className="text-xs text-white/50 ml-5 border-l border-white/10 pl-2 my-1 h-3">{compareDates(booking.check_in, booking.check_out)} Nights</div>
                  <div className="flex items-center gap-2 text-white font-medium ml-5">
                    {formatDate(booking.check_out)}
                  </div>
                </td>
                <td className="p-4 align-top">
                  <div className="font-semibold text-white mb-1">{booking.rooms?.name || 'Custom/No Room'}</div>
                  <div className="text-[#D4A373] font-serif font-bold">₦{(booking.total_price || booking.total_amount || 0).toLocaleString()}</div>
                </td>
                <td className="p-4 align-top">
                  {getPaymentStatusBadge(booking.payment_status)}
                </td>
                <td className="p-4 align-top w-48">
                  <div className="text-xs text-white/60 mb-1"><strong className="text-white">Guests:</strong> {booking.guests_count || 1}</div>
                  <div className="text-xs text-white/60 line-clamp-3">
                    <strong className="text-white">Reqs:</strong> {booking.special_requests || 'None'}
                  </div>
                </td>
                <td className="p-4 align-top text-center relative">
                  <select 
                      value={booking.status}
                      onChange={(e) => updateStatus(booking.id, e.target.value)}
                      className={`text-xs font-semibold appearance-none cursor-pointer w-full text-center py-1.5 px-2 rounded-full border transition-all hover:brightness-105 focus:outline-none focus:ring-1 focus:ring-brown-500 ${getStatusColor(booking.status)}`}
                  >
                      <option value="pending" className="bg-[#0D0501] text-white">Pending</option>
                      <option value="confirmed" className="bg-[#0D0501] text-white">Confirmed</option>
                      <option value="checked_in" className="bg-[#0D0501] text-white">Checked In</option>
                      <option value="completed" className="bg-[#0D0501] text-white">Completed</option>
                      <option value="cancelled" className="bg-[#0D0501] text-white">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const [calMonth, setCalMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const CalendarView = () => {
    const startOffset = calMonth.getDay();
    const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
    
    const nextMonth = () => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1));
    const prevMonth = () => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1));

    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(calMonth.getFullYear(), calMonth.getMonth(), i));

    return (
      <div className="glass-card bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm p-6 min-h-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-white">
            {calMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 border border-white/10 rounded-lg hover:bg-[#1A0A02] text-white/80 transition-colors"><ChevronLeft size={20}/></button>
            <button onClick={nextMonth} className="p-2 border border-white/10 rounded-lg hover:bg-[#1A0A02] text-white/80 transition-colors"><ChevronRight size={20}/></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-white/10 rounded-xl overflow-hidden border border-white/10">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="bg-[#1A0A02] p-3 text-center text-sm font-semibold text-white/60">{d}</div>
          ))}
          {days.map((day, idx) => {
            if (!day) return <div key={idx} className="bg-[#1A0A02] min-h-[120px]"></div>;
            
            const dayStr = day.toISOString().split('T')[0];
            const isToday = dayStr === todayStr;
            const dayBookings = filteredBookings.filter(b => b.check_in <= dayStr && b.check_out > dayStr);

            return (
              <div key={idx} className={`bg-[#0D0501] min-h-[120px] p-2 flex flex-col gap-1 transition-colors hover:bg-white/5 ${isToday ? 'ring-2 ring-inset ring-brown-500' : ''}`}>
                <div className={`text-right text-sm font-medium ${isToday ? 'text-[#D4A373]' : 'text-white/50'}`}>{day.getDate()}</div>
                <div className="flex flex-col gap-1">
                  {dayBookings.slice(0, 3).map((b, i) => {
                    let dotColor = 'bg-slate-400';
                    if (b.status === 'confirmed') dotColor = 'bg-blue-500';
                    if (b.status === 'checked_in') dotColor = 'bg-purple-500';
                    if (b.status === 'pending') dotColor = 'bg-[#D4A373]';
                    if (b.status === 'completed') dotColor = 'bg-emerald-500';
                    if (b.status === 'cancelled') dotColor = 'bg-red-500 opacity-50';
                    if (b.status === 'maintenance') dotColor = 'bg-white/40';

                    return (
                      <div key={i} onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }} className="flex items-center gap-1.5 text-xs truncate cursor-pointer hover:bg-black/5 rounded px-1 -mx-1" title={b.guest_name}>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`}></div>
                        <span className="truncate text-white/80">{b.guest_name}</span>
                      </div>
                    )
                  })}
                  {dayBookings.length > 3 && <div className="text-xs text-white/40 pl-3">+{dayBookings.length - 3} more</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  const [tlStartDate, setTlStartDate] = useState(new Date());
  const TimelineView = () => {
    // 14 day window
    const days = Array.from({length: 14}, (_, i) => {
      const d = new Date(tlStartDate);
      d.setDate(d.getDate() + i);
      return d;
    });

    const nextWindow = () => {
      const n = new Date(tlStartDate);
      n.setDate(n.getDate() + 7);
      setTlStartDate(n);
    }
    const prevWindow = () => {
      const n = new Date(tlStartDate);
      n.setDate(n.getDate() - 7);
      setTlStartDate(n);
    }

    return (
      <div className="glass-card bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
          <h2 className="font-serif font-semibold text-white">Tape Chart (14 Days)</h2>
          <div className="flex gap-2">
            <button onClick={prevWindow} className="p-1.5 border border-white/10 rounded-lg hover:bg-[#1A0A02] text-white/80 transition-colors bg-[#0D0501]"><ChevronLeft size={18}/></button>
            <button onClick={() => setTlStartDate(new Date())} className="px-3 py-1.5 border border-white/10 rounded-lg hover:bg-[#1A0A02] text-white/80 transition-colors text-sm font-medium bg-[#0D0501]">Today</button>
            <button onClick={nextWindow} className="p-1.5 border border-white/10 rounded-lg hover:bg-[#1A0A02] text-white/80 transition-colors bg-[#0D0501]"><ChevronRight size={18}/></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px] border-collapse">
            <thead>
              <tr>
                <th className="p-3 w-48 min-w-[192px] border-b border-white/10 bg-[#0D0501] sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-sm font-semibold text-white/80">Room</th>
                {days.map((d, i) => {
                  const isToday = d.toISOString().split('T')[0] === todayStr;
                  return (
                    <th key={i} className={`p-2 min-w-[100px] border-b border-l border-white/10 text-center text-xs font-medium ${isToday ? 'bg-[#D4A373] text-[#1A0A02]' : 'bg-[#1A0A02] text-white/60'}`}>
                      <div>{d.toLocaleString('default', { weekday: 'short' })}</div>
                      <div className="font-bold">{d.getDate()} {d.toLocaleString('default', { month: 'short' })}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id} className="group">
                  <td className="p-3 w-48 min-w-[192px] border-b border-white/10 bg-[#0D0501] group-hover:bg-white/5 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors">
                    <div className="font-medium text-white text-sm truncate">{room.name}</div>
                  </td>
                  {days.map((d, i) => {
                    const dStr = d.toISOString().split('T')[0];
                    const isToday = dStr === todayStr;
                    
                    // Find a booking that spans this day for this room
                    const booking = filteredBookings.find(b => b.room_id === room.id && b.check_in <= dStr && b.check_out > dStr);
                    
                    // Check if this day is the START of the booking to render the label
                    const isStart = booking && booking.check_in === dStr;
                    const isFirstVisibleDay = booking && i === 0 && booking.check_in < dStr;
                    const shouldRenderLabel = isStart || isFirstVisibleDay;

                    if (!booking) {
                      return <td key={i} className={`border-b border-l border-white/10 h-14 ${isToday ? 'bg-white/5' : 'bg-[#0D0501]'}`}></td>;
                    }

                    // Determine colors
                    let bgCol = 'bg-white/20', textCol = 'text-white', borderCol = 'border-white/20';
                    if (booking.status === 'confirmed') { bgCol = 'bg-blue-500/20'; textCol = 'text-blue-300'; borderCol = 'border-blue-500/30'; }
                    if (booking.status === 'checked_in') { bgCol = 'bg-purple-500/20'; textCol = 'text-purple-300'; borderCol = 'border-purple-500/30'; }
                    if (booking.status === 'pending') { bgCol = 'bg-[#D4A373]/20'; textCol = 'text-[#D4A373]'; borderCol = 'border-[#D4A373]/30'; }
                    if (booking.status === 'completed') { bgCol = 'bg-emerald-500/20'; textCol = 'text-emerald-800'; borderCol = 'border-emerald-500/30'; }
                    if (booking.status === 'cancelled') { bgCol = 'bg-red-500/20 opacity-50'; textCol = 'text-red-800'; borderCol = 'border-red-500/30'; }
                    if (booking.status === 'maintenance') { bgCol = 'bg-white/20'; textCol = 'text-white'; borderCol = 'border-white/30'; }

                    return (
                      <td key={i} className={`border-b border-l border-white/10 p-1 h-14 relative ${isToday ? 'bg-white/5' : 'bg-[#0D0501]'}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDropBooking(e, room.id, dStr)}
                      >
                        <div 
                          draggable={true}
                          onDragStart={(e) => e.dataTransfer.setData('booking_id', booking.id)}
                          onClick={() => setSelectedBooking(booking)}
                          className={`absolute top-1 bottom-1 left-0 right-0 ${bgCol} ${borderCol} border-y ${isStart ? 'border-l rounded-l-md ml-1' : ''} ${(booking.check_out === new Date(d.getTime() + 86400000).toISOString().split('T')[0]) ? 'border-r rounded-r-md mr-1' : ''} flex items-center px-2 overflow-hidden z-0 cursor-pointer hover:brightness-95 transition-all shadow-sm`}
                        >
                           {shouldRenderLabel && (
                             <span className={`text-xs font-semibold whitespace-nowrap z-10 ${textCol}`}>
                               {booking.guest_name}
                             </span>
                           )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  };


  return (
    <div className="animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <BookOpen size={28} className="text-[#D4A373]" />
          <h1 className="text-3xl font-serif text-white font-bold">Bookings Manager</h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsMaintenanceModalOpen(true)}
            className="flex items-center gap-2 bg-[#0D0501] hover:bg-[#1A0A02] text-white/80 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm border border-white/10"
          >
            <Wrench size={18} /> Block Room
          </button>
          <button 
            onClick={() => setIsBookingModalOpen(true)}
            className="flex items-center gap-2 bg-[#D4A373] hover:bg-[#b45309] text-[#1A0A02] px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus size={18} /> New Booking
          </button>
        </div>
      </div>

      {/* TODAY PANEL */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card bg-[#0D0501] border border-white/10 rounded-3xl p-4 flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><CalendarCheck size={80}/></div>
          <div className="p-3 bg-[#1A0A02] rounded-xl text-[#D4A373]"><CalendarCheck size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.arrivals}</div>
            <div className="text-xs font-medium text-white/50 uppercase tracking-wider">Arrivals Today</div>
          </div>
        </div>
        <div className="glass-card bg-[#0D0501] border border-white/10 rounded-3xl p-4 flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><CalendarX size={80}/></div>
          <div className="p-3 bg-[#1A0A02] rounded-xl text-[#D4A373]"><CalendarX size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.departures}</div>
            <div className="text-xs font-medium text-white/50 uppercase tracking-wider">Departures Today</div>
          </div>
        </div>
        <div className="glass-card bg-[#0D0501] border border-white/10 rounded-3xl p-4 flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><BedDouble size={80}/></div>
          <div className="p-3 bg-[#1A0A02] rounded-xl text-[#D4A373]"><BedDouble size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.inHouse}</div>
            <div className="text-xs font-medium text-white/50 uppercase tracking-wider">In-House Now</div>
          </div>
        </div>
        <div className="glass-card bg-[#0D0501] border border-white/10 rounded-3xl p-4 flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><Clock size={80}/></div>
          <div className="p-3 bg-[#1A0A02] rounded-xl text-[#D4A373]"><Clock size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.pending}</div>
            <div className="text-xs font-medium text-white/50 uppercase tracking-wider">Pending Review</div>
          </div>
        </div>
      </div>

      {/* FILTERS & TOGGLES */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-6">
        {/* Status Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 xl:pb-0 w-full xl:w-auto hide-scrollbar">
          {[
            { id: 'all', label: 'All', icon: null },
            { id: 'pending', label: 'Pending', icon: '🕐' },
            { id: 'confirmed', label: 'Confirmed', icon: '✅' },
            { id: 'checked_in', label: 'Checked In', icon: '🏨' },
            { id: 'completed', label: 'Completed', icon: '✔' },
            { id: 'cancelled', label: 'Cancelled', icon: '❌' }
          ].map(s => {
            const count = s.id === 'all' ? bookings.length : bookings.filter(b => b.status === s.id).length;
            const isActive = statusFilter === s.id;
            return (
              <button 
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${isActive ? 'bg-[#D4A373] text-[#1A0A02] border-[#D4A373]' : 'bg-[#0D0501] text-white/60 border-white/10 hover:border-[#D4A373]/30'}`}
              >
                {s.icon && <span>{s.icon}</span>} {s.label} ({count})
              </button>
            )
          })}
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-start md:items-center">
          {/* Search */}
          <div className="relative w-full md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0D0501] border border-white/10 focus:border-brown-500 text-white placeholder:text-white/40 text-sm pl-9 pr-4 py-2 h-10 rounded-xl outline-none transition-all shadow-sm"
            />
          </div>

          {/* Date Range */}
          <div className="flex bg-[#0D0501] border border-white/10 rounded-xl p-1 shadow-sm w-full md:w-auto">
            {['week', 'month', 'all'].map(dr => (
              <button
                key={dr}
                onClick={() => setDateRange(dr as 'week' | 'month' | 'all')}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${dateRange === dr ? 'bg-[#D4A373] text-[#1A0A02]' : 'text-white/60 hover:bg-[#1A0A02]'}`}
              >
                {dr === 'all' ? 'All Time' : `This ${dr}`}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex bg-[#0D0501] border border-white/10 rounded-xl p-1 shadow-sm w-full md:w-auto hidden md:flex">
             <button onClick={() => setActiveView('table')} className={`p-1.5 rounded-lg transition-colors ${activeView === 'table' ? 'bg-[#D4A373] text-[#1A0A02]' : 'text-white/40 hover:text-white/60'}`} title="Table View"><List size={18}/></button>
             <button onClick={() => setActiveView('calendar')} className={`p-1.5 rounded-lg transition-colors ${activeView === 'calendar' ? 'bg-[#D4A373] text-[#1A0A02]' : 'text-white/40 hover:text-white/60'}`} title="Calendar View"><CalendarIcon size={18}/></button>
             <button onClick={() => setActiveView('timeline')} className={`p-1.5 rounded-lg transition-colors ${activeView === 'timeline' ? 'bg-[#D4A373] text-[#1A0A02]' : 'text-white/40 hover:text-white/60'}`} title="Timeline View"><BarChart3 size={18} className="rotate-90"/></button>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      {activeView === 'table' && <TableView />}
      {activeView === 'calendar' && <CalendarView />}
      {activeView === 'timeline' && <TimelineView />}

      {/* MANUAL BOOKING MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0501] rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2"><Plus size={20} className="text-[#D4A373]"/> Create New Booking</h2>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-white/40 hover:text-white/60 transition-colors"><X size={24}/></button>
            </div>
            <form onSubmit={handleCreateBooking} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Room *</label>
                  <select 
                    required value={mbRoomId} onChange={e => setMbRoomId(e.target.value)}
                    className="w-full bg-[#1A0A02] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-brown-500 p-2.5 outline-none transition-all"
                  >
                    <option value="" disabled>Select a room</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} - ₦{r.price_per_night.toLocaleString()}/night</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Guests Count</label>
                  <input 
                    type="number" min="1" max="10" required value={mbGuestsCount} onChange={e => setMbGuestsCount(e.target.value)}
                    className="w-full bg-[#1A0A02] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-brown-500 p-2.5 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Check-in Date *</label>
                  <input 
                    type="date" required value={mbCheckIn} onChange={e => setMbCheckIn(e.target.value)}
                    className="w-full bg-[#1A0A02] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-brown-500 p-2.5 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Check-out Date *</label>
                  <input 
                    type="date" required value={mbCheckOut} onChange={e => setMbCheckOut(e.target.value)}
                    className="w-full bg-[#1A0A02] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-brown-500 p-2.5 outline-none transition-all"
                  />
                  {mbCheckIn && mbCheckOut && mbCheckIn < mbCheckOut && (
                    <div className="text-xs text-[#D4A373] mt-1 font-medium">{compareDates(mbCheckIn, mbCheckOut)} nights</div>
                  )}
                </div>
              </div>

              <hr className="border-white/10 mb-6"/>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Guest Name *</label>
                  <input 
                    type="text" required placeholder="John Doe" value={mbGuestName} onChange={e => setMbGuestName(e.target.value)}
                    className="w-full bg-[#1A0A02] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-brown-500 p-2.5 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Guest Phone *</label>
                  <input 
                    type="tel" required placeholder="+234..." value={mbGuestPhone} onChange={e => setMbGuestPhone(e.target.value)}
                    className="w-full bg-[#1A0A02] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-brown-500 p-2.5 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Guest Email (Optional)</label>
                  <input 
                    type="email" placeholder="john@example.com" value={mbGuestEmail} onChange={e => setMbGuestEmail(e.target.value)}
                    className="w-full bg-[#1A0A02] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-brown-500 p-2.5 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Special Requests</label>
                  <textarea 
                    rows={2} placeholder="Any specific requirements..." value={mbSpecialReqs} onChange={e => setMbSpecialReqs(e.target.value)}
                    className="w-full bg-[#1A0A02] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-brown-500 p-2.5 outline-none transition-all"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Initial Status</label>
                  <select 
                    value={mbStatus} onChange={e => setMbStatus(e.target.value)}
                    className="w-full bg-[#1A0A02] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-brown-500 focus:border-brown-500 p-2.5 outline-none transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button" onClick={() => setIsBookingModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-white/60 font-medium hover:bg-white/10 transition-colors"
                >Cancel</button>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brown-600 text-white font-medium hover:bg-brown-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAINTENANCE MODAL */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0501] rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2"><Wrench size={20} className="text-white/60"/> Block Room</h2>
              <button onClick={() => setIsMaintenanceModalOpen(false)} className="text-white/40 hover:text-white/60 transition-colors"><X size={24}/></button>
            </div>
            <form onSubmit={handleCreateMaintenance} className="p-6">
              <div className="flex flex-col gap-5 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Room *</label>
                  <select 
                    required value={maintRoomId} onChange={e => setMaintRoomId(e.target.value)}
                    className="w-full bg-[#1A0A02] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 p-2.5 outline-none transition-all"
                  >
                    <option value="" disabled>Select a room</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Start Date *</label>
                  <input 
                    type="date" required value={maintCheckIn} onChange={e => setMaintCheckIn(e.target.value)}
                    className="w-full bg-[#1A0A02] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 p-2.5 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">End Date *</label>
                  <input 
                    type="date" required value={maintCheckOut} onChange={e => setMaintCheckOut(e.target.value)}
                    className="w-full bg-[#1A0A02] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 p-2.5 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button" onClick={() => setIsMaintenanceModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-white/60 font-medium hover:bg-white/10 transition-colors"
                >Cancel</button>
                <button 
                  type="submit" disabled={isSubmittingMaint}
                  className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  {isSubmittingMaint ? 'Saving...' : 'Confirm Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GUEST INTELLIGENCE SIDEBAR */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[400px] bg-[#0D0501] shadow-[-5px_0_25px_-5px_rgba(0,0,0,0.1)] transform transition-transform duration-300 z-50 flex flex-col border-l border-white/10 ${selectedBooking ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedBooking && (
          <>
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-serif font-bold text-white">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-white/40 hover:text-white/60 transition-colors bg-[#0D0501] p-1 rounded-lg border border-white/10"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {/* Guest Info */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 text-[#D4A373] flex items-center justify-center font-bold text-lg">
                    {selectedBooking.guest_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{selectedBooking.guest_name}</h3>
                    {guestProfile?.visit_count > 1 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-brown-200 to-yellow-400 text-[#D4A373] shadow-sm mt-1">
                        <Award size={12}/> Returning VIP
                      </span>
                    ) : (
                      <span className="text-xs text-white/50 font-medium">Guest</span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3 bg-[#1A0A02] p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <Phone size={16} className="text-white/40"/> {selectedBooking.guest_phone}
                  </div>
                  {selectedBooking.guest_email && selectedBooking.guest_email !== 'N/A' && (
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <Mail size={16} className="text-white/40"/> {selectedBooking.guest_email}
                    </div>
                  )}
                  {guestProfile && (
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <CreditCard size={16} className="text-white/40"/> Total Spend: <span className="font-semibold text-white">₦{(guestProfile.total_spend || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {guestProfile && (
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <Info size={16} className="text-white/40"/> Visits: <span className="font-semibold text-white">{guestProfile.visit_count || 1}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reservation Info */}
              <div className="mb-8">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Reservation Details</h4>
                <div className="bg-[#0D0501] border border-white/10 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <div>
                      <div className="text-xs text-white/50 font-medium mb-1">Check In</div>
                      <div className="font-semibold text-white">{formatDate(selectedBooking.check_in)}</div>
                    </div>
                    <div className="text-[#D4A373]"><ChevronRight size={16}/></div>
                    <div className="text-right">
                      <div className="text-xs text-white/50 font-medium mb-1">Check Out</div>
                      <div className="font-semibold text-white">{formatDate(selectedBooking.check_out)}</div>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-white/60">Room:</span>
                      <span className="font-semibold text-white">{selectedBooking.rooms?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-white/60">Guests:</span>
                      <span className="font-semibold text-white">{selectedBooking.guests_count || 1}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/60">Total Amount:</span>
                      <span className="font-bold text-[#D4A373]">₦{(selectedBooking.total_amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="mb-8">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Manage Status</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Booking Status</label>
                    <select 
                      value={selectedBooking.status}
                      onChange={(e) => {
                        updateStatus(selectedBooking.id, e.target.value);
                        setSelectedBooking({...selectedBooking, status: e.target.value});
                      }}
                      className="w-full bg-[#0D0501] border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-brown-500 p-2.5 shadow-sm outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_in">Checked In</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.special_requests && (
                <div>
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Special Requests</h4>
                  <div className="bg-[#1A0A02] text-[#D4A373] p-4 rounded-xl text-sm border border-white/10">
                    {selectedBooking.special_requests}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
