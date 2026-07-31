'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useHotel } from '@/contexts/HotelContext';

export default function WhatsAppButton() {
  const { settings, hotel } = useHotel();
  const phoneNumber = settings?.whatsapp_number || '+2348000000000';
  const message = `Hello ${hotel?.name || 'Joebrown Palace Hotel'}, I'd like to make an enquiry.`;

  const waUrl = `https://wa.me/${phoneNumber.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-full shadow-2xl hover:scale-105 transition-transform duration-300 border border-emerald-400/40"
      aria-label="Chat with us on WhatsApp"
    >
      <div className="relative flex items-center justify-center">
        <MessageCircle size={22} className="relative z-10" />
      </div>
      <span className="text-xs font-bold tracking-wide hidden sm:inline-block">WhatsApp Us</span>
    </a>
  );
}
