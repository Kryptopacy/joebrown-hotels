import React from 'react';
import Link from 'next/link';

export const revalidate = 3600;
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import CustomerIntercom from '@/components/CustomerIntercom';
import RoomsClient from '@/components/RoomsClient';
import { Phone, Mail, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function RoomsPage() {
  const supabase = await createClient();
  
  const { data: hotel } = await supabase.from('hotels').select('*').eq('slug', 'joebrown').maybeSingle();
  const hotelName = hotel?.name || 'Joebrown Palace Hotel and Suites';
  const hotelAddress = hotel?.address || '4, Goodness Avenue, Ore Ofe Estate, off Akala Express, Lagos, Lagos State, Nigeria';
  const hotelPhone = hotel?.whatsapp_number || '+234 800 joebrown';
  
  let rooms: any[] = [];
  if (hotel) {
    const res = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotel.id)
      .order('display_order', { ascending: true });
    if (res.data && res.data.length > 0) rooms = res.data;
  }



  return (
    <main className="min-h-screen relative text-[#E6CCB2] flex flex-col justify-between overflow-x-hidden bg-[#0A0401]">
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: "url('/JB/others/towel_monogram.JPG')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
      {/* Sharp Cinematic Luxury Dark Overlay to make the background pop without whitewashing */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/70 via-[#0A0401]/60 to-[#0A0401] pointer-events-none" />
      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        <Navbar />

        {/* ELEGANT HERO HEADER CARD OVER TEXTURE (NO BADGE PILLS) */}
        <section className="pt-36 pb-8 px-4 md:px-8 relative overflow-hidden">
          <div className="container mx-auto max-w-5xl relative z-10 p-8 md:p-12 rounded-3xl bg-[#1A0A02] border border-[#5D3A1A]/40 shadow-2xl text-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D4A373] via-[#b45309] to-[#D4A373]" />
            <h1 className="text-4xl sm:text-6xl font-serif text-[#E6CCB2] mb-4 font-extrabold tracking-tight">Rooms & Suites</h1>
            <p className="text-[#8D6E63] max-w-2xl mx-auto text-base sm:text-lg font-semibold leading-relaxed">
              Choose from our comfortable, air-conditioned rooms and suites. All rooms include high-speed Wi-Fi, Smart TV, en-suite bathroom, and 24/7 express kitchen service.
            </p>
          </div>
        </section>

        {/* SEARCHABLE ROOMS CLIENT */}
        <section className="container mx-auto max-w-6xl my-4 px-4 md:px-8 flex-1">
          <RoomsClient initialRooms={rooms} />
        </section>

        {/* UNIFIED REUSABLE FOOTER */}
        <Footer hotelName={hotelName} hotelAddress={hotelAddress} hotelPhone={hotelPhone} />
      </div>

      <CustomerIntercom />
      <WhatsAppButton />
    </main>
  );
}
