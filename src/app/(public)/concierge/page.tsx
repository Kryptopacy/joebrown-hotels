'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomerIntercom from '@/components/CustomerIntercom';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useHotel } from '@/contexts/HotelContext';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Bell, Sparkles, Wind, Bath, ArrowRight } from 'lucide-react';

const SERVICES = [
  { id: 'cleaning', label: 'Room Cleaning', icon: Sparkles, desc: 'Request housekeeping for your room.' },
  { id: 'towels', label: 'Fresh Towels', icon: Bath, desc: 'Request extra bath and hand towels.' },
  { id: 'late_checkout', label: 'Late Checkout', icon: Wind, desc: 'Request an extension on your checkout time.' },
  { id: 'other', label: 'Other Request', icon: Bell, desc: 'Any other assistance you might need.' }
];

export default function ConciergePage() {
  const { hotel } = useHotel();
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber || !selectedService) {
      toast.error('Please enter your room number and select a service.');
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from('service_requests').insert({
      hotel_id: hotel?.id || null,
      room_number: roomNumber,
      request_type: selectedService,
      status: 'pending'
    });

    setIsSubmitting(false);

    if (error) {
      toast.error('Failed to submit request. Please call the front desk.');
    } else {
      toast.success('Request received! A staff member is on the way.', { duration: 5000 });
      setRoomNumber('');
      setSelectedService('');
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#2C1E16] flex flex-col justify-between">
      <Navbar />

      <section className="container mx-auto max-w-2xl pt-40 pb-20 px-4 flex-grow animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#1A0A02] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#5D3A1A]/50 shadow-lg">
            <Bell size={32} className="text-[#D4A373]" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-[#2C1E16] mb-2">Digital Concierge</h1>
          <p className="text-[#8D6E63] font-medium">Request room service with a single tap.</p>
        </div>

        <div className="bg-[#1A0A02] border border-[#5D3A1A]/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D4A373] via-[#b45309] to-[#D4A373]" />
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-[10px] font-bold text-[#D4A373] uppercase tracking-wider mb-2">Your Room Number</label>
              <input
                type="text"
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                placeholder="e.g. 304"
                className="w-full px-4 py-3 bg-[#0D0501] border border-[#5D3A1A] text-white font-medium placeholder:text-[#8D6E63]/60 focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] rounded-xl transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#D4A373] uppercase tracking-wider mb-3">How can we help?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SERVICES.map(srv => {
                  const Icon = srv.icon;
                  const isActive = selectedService === srv.id;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setSelectedService(srv.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        isActive 
                          ? 'border-[#D4A373] bg-[#2C1203] shadow-md' 
                          : 'border-[#5D3A1A]/50 bg-white/5 hover:border-[#D4A373]/50 hover:bg-[#2C1203]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <Icon size={20} className={isActive ? 'text-[#D4A373]' : 'text-[#8D6E63]'} />
                        <span className={`font-bold ${isActive ? 'text-[#E6CCB2]' : 'text-[#8D6E63]'}`}>{srv.label}</span>
                      </div>
                      <p className="text-xs text-slate-500">{srv.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedService || !roomNumber}
              className="w-full py-4 bg-brown-700 hover:bg-brown-800 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-brown-900/20"
            >
              {isSubmitting ? 'Sending Request...' : 'Submit Request'} <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>

      <Footer hotelName={hotel?.name || 'Joebrown'} hotelAddress={hotel?.address || ''} hotelPhone={hotel?.whatsapp_number || ''} />
      <WhatsAppButton />
    </main>
  );
}
