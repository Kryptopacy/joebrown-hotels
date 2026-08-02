'use client';

import React, { useState, useEffect } from 'react';
import { useHotel } from '@/contexts/HotelContext';
import { createClient } from '@/lib/supabase/client';
import { Calendar, Users, ChevronRight, ChevronLeft, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface BookingModalProps {
  room: {
    id: string;
    name: string;
    price_per_night: number;
    is_available: boolean;
  };
}

const fmt = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default function BookingModal({ room }: BookingModalProps) {
  const { hotel, settings } = useHotel();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [champagneUpsell, setChampagneUpsell] = useState(false);
  const [blockedRanges, setBlockedRanges] = useState<{ check_in: string; check_out: string }[]>([]);

  // Form State
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [requests, setRequests] = useState('');

  // Fetch blocked dates on mount
  useEffect(() => {
    const fetchBlocked = async () => {
      const supabase = createClient();
      const { data } = await supabase.rpc('get_blocked_dates', { p_room_id: room.id });
      if (data) setBlockedRanges(data);
    };
    fetchBlocked();
  }, [room.id]);

  // Calculations
  const calcNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const n = Math.ceil(diff / (1000 * 3600 * 24));
    return n > 0 ? n : 0;
  };
  const nights = calcNights();
  const basePrice = nights * room.price_per_night;
  const totalPrice = basePrice + (champagneUpsell ? 20000 : 0);
  const todayStr = new Date().toISOString().split('T')[0];

  // Format blocked periods for display
  const blockedDisplay = blockedRanges.map(r => {
    const ciDate = new Date(r.check_in + 'T00:00:00');
    const coDate = new Date(r.check_out + 'T00:00:00');
    return `${ciDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${coDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
  });

  const handleNext = async () => {
    if (step === 1) {
      if (!checkIn || !checkOut || nights <= 0) {
        toast.error('Please select valid check-in and check-out dates.');
        return;
      }
      // Conflict check
      const supabase = createClient();
      const { data: conflicts } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', room.id)
        .lt('check_in', checkOut)
        .gt('check_out', checkIn)
        .neq('status', 'cancelled');

      if (conflicts && conflicts.length > 0) {
        toast.error('These dates overlap with an existing booking. Please select different dates.');
        return;
      }
    }
    if (step === 2) {
      if (!name || !phone) {
        toast.error('Please fill in your name and phone number.');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotel) return;

    setIsSubmitting(true);
    const supabase = createClient();
    const initialStatus = settings?.payment_enabled ? 'pending_payment' : 'pending';

    const { data: bookingId, error } = await supabase.rpc('book_room_atomically', {
      p_hotel_id: hotel.id,
      p_room_id: room.id,
      p_guest_name: name,
      p_guest_phone: phone,
      p_guest_email: email || null,
      p_check_in: checkIn,
      p_check_out: checkOut,
      p_guests_count: guests,
      p_special_requests: requests || null,
      p_total_amount: totalPrice,
      p_status: initialStatus,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message || 'Failed to submit booking. Please try again.');
      return;
    }

    // Send confirmation email
    if (email) {
      try {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'booking',
            to: email,
            payload: {
              guestName: name,
              bookingRef: typeof bookingId === 'string' ? bookingId.substring(0, 8).toUpperCase() : 'BKG-001',
              checkIn,
              checkOut,
              roomName: room.name,
              totalAmount: totalPrice,
            }
          }),
        });
      } catch (err) {
        console.error('Failed to send confirmation email', err);
      }
    }

    // Push notification to admin
    try {
      await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Booking Request',
          body: `${name} wants to book ${room.name} (${nights} nights).`,
          url: '/admin/bookings',
        }),
      });
    } catch (_) {}

    if (settings?.payment_enabled) {
      toast.success('Redirecting to Payment Gateway…');
      setTimeout(() => alert('Simulated Payment Gateway Redirect!'), 1000);
    } else {
      toast.success('Reservation received! Connecting to concierge on WhatsApp…');
      const msg = `Hello Joebrown Palace Hotels & Lounge,\n\nI would like to confirm my booking:\n*Room:* ${room.name}\n*Check-in:* ${checkIn}\n*Check-out:* ${checkOut} (${nights} nights)\n*Guests:* ${guests}\n*Total Rate:* ₦${totalPrice.toLocaleString()}\n*Name:* ${name}\n*Phone:* ${phone}${requests ? `\n*Requests:* ${requests}` : ''}\n\nPlease confirm my reservation!`;
      const waUrl = `https://wa.me/${(settings?.whatsapp_number || '+2348000000000').replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(msg)}`;
      window.location.href = waUrl;
    }
  };

  if (!room.is_available) {
    return (
      <div className="w-full py-4 text-center bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold text-sm">
        This room is currently unavailable for booking.
      </div>
    );
  }

  // ── Step Progress ──────────────────────────────────────────────────────────
  const steps = ['Dates', 'Guest Info', 'Confirm'];

  return (
    <div className="w-full">
      {/* Progress Stepper */}
      <div className="flex items-center mb-8 relative">
        {steps.map((label, idx) => {
          const s = idx + 1;
          const isActive = step === s;
          const isDone = step > s;
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-brown-600 text-white' : 'bg-brown-100 text-slate-400 border border-brown-200'
                }`}>
                  {isDone ? <CheckCircle size={14} /> : s}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-brown-700' : 'text-slate-400'}`}>{label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-px mx-2 mt-[-12px] transition-colors ${step > s ? 'bg-emerald-400' : 'bg-brown-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <form onSubmit={submitBooking}>

        {/* ── Step 1: Dates ── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in-up">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                <Calendar size={12} className="inline mr-1 text-brown-600" />Check-in Date
              </label>
              <input
                type="date"
                className="w-full bg-white border border-brown-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-brown-600 transition-all"
                value={checkIn}
                min={todayStr}
                onChange={e => setCheckIn(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                <Calendar size={12} className="inline mr-1 text-brown-600" />Check-out Date
              </label>
              <input
                type="date"
                className="w-full bg-white border border-brown-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-brown-600 transition-all"
                value={checkOut}
                min={checkIn || todayStr}
                onChange={e => setCheckOut(e.target.value)}
                required
              />
            </div>

            {/* Blocked dates indicator */}
            {blockedDisplay.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-1">⛔ Already Booked</p>
                <p className="text-[11px] text-red-500 leading-relaxed">{blockedDisplay.join('  •  ')}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                <Users size={12} className="inline mr-1 text-brown-600" />Number of Guests
              </label>
              <select
                className="w-full bg-white border border-brown-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-brown-600 transition-all"
                value={guests}
                onChange={e => setGuests(Number(e.target.value))}
              >
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>

            {/* Price preview */}
            {nights > 0 && (
              <div className="bg-brown-50 border border-brown-200 rounded-xl p-4">
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>₦{room.price_per_night.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
                  <span className="font-semibold text-slate-800">₦{basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-serif font-bold text-brown-700 text-lg border-t border-brown-200 pt-2">
                  <span>Subtotal</span>
                  <span>₦{basePrice.toLocaleString()}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="w-full bg-brown-600 hover:bg-brown-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              Continue <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 2: Guest Details ── */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in-up">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name *</label>
              <input
                type="text"
                className="w-full bg-white border border-brown-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-brown-600 transition-all"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="e.g. Adebayo Johnson"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">WhatsApp / Phone *</label>
              <input
                type="tel"
                className="w-full bg-white border border-brown-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-brown-600 transition-all"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                placeholder="+234..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
              <input
                type="email"
                className="w-full bg-white border border-brown-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-brown-600 transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Special Requests</label>
              <textarea
                className="w-full bg-white border border-brown-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-brown-600 transition-all resize-none"
                rows={2}
                value={requests}
                onChange={e => setRequests(e.target.value)}
                placeholder="Early check-in, extra pillows, dietary needs…"
              />
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={handleBack} className="w-1/3 bg-white border border-brown-300 text-slate-700 hover:bg-brown-50 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-1">
                <ChevronLeft size={15} /> Back
              </button>
              <button type="button" onClick={handleNext} disabled={!name || !phone} className="w-2/3 bg-brown-600 hover:bg-brown-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                Review <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Confirm ── */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in-up">
            {/* Champagne Upsell */}
            <div className="bg-brown-900/10 border border-brown-400/40 rounded-xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-serif font-bold text-brown-800 text-base">🥂 Champagne Welcome</p>
                <p className="text-xs text-slate-600 mt-0.5">A chilled bottle on arrival — the perfect start.</p>
                <p className="text-sm font-bold text-brown-700 mt-1">+ ₦20,000</p>
              </div>
              <button
                type="button"
                onClick={() => setChampagneUpsell(u => !u)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${champagneUpsell ? 'bg-brown-600 text-white' : 'bg-white border border-brown-400 text-brown-700 hover:bg-brown-50'}`}
              >
                {champagneUpsell ? '✓ Added' : 'Add'}
              </button>
            </div>

            {/* Booking Summary */}
            <div className="bg-brown-50 border border-brown-200 rounded-xl p-4 space-y-2 text-sm">
              <h4 className="font-serif font-bold text-slate-900 text-base mb-3">Booking Summary</h4>
              {[
                ['Room', room.name],
                ['Check-in', fmt(checkIn)],
                ['Check-out', fmt(checkOut)],
                ['Duration', `${nights} night${nights > 1 ? 's' : ''}`],
                ['Guest', name],
                ['Phone', phone],
                ...(email ? [['Email', email]] : []),
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-500 font-medium">{label}</span>
                  <span className="text-slate-800 font-semibold text-right max-w-[60%] truncate">{val}</span>
                </div>
              ))}
              {champagneUpsell && (
                <div className="flex justify-between text-brown-700 font-semibold border-t border-brown-200 pt-2 mt-2">
                  <span>Champagne Add-on</span><span>+₦20,000</span>
                </div>
              )}
              <div className="flex justify-between font-serif font-bold text-brown-700 text-lg border-t border-brown-300 pt-3 mt-1">
                <span>Total Due</span>
                <span>₦{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center">
              {settings?.payment_enabled
                ? 'You will be redirected to our secure payment gateway.'
                : 'You will be connected to our concierge on WhatsApp to confirm your stay.'}
            </p>

            <div className="flex gap-3">
              <button type="button" onClick={handleBack} disabled={isSubmitting}
                className="w-1/3 bg-white border border-brown-300 text-slate-700 hover:bg-brown-50 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-1">
                <ChevronLeft size={15} /> Back
              </button>
              <button type="submit" disabled={isSubmitting}
                className="w-2/3 bg-brown-600 hover:bg-brown-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {isSubmitting
                  ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
                  : settings?.payment_enabled ? 'Pay Now' : 'Confirm via WhatsApp'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
