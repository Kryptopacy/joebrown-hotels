import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 3600;

import Navbar from '@/components/Navbar';
import WhatsAppButton from '@/components/WhatsAppButton';
import CustomerIntercom from '@/components/CustomerIntercom';
import AvailabilityBadge from '@/components/AvailabilityBadge';
import BookingModal from '@/components/BookingModal';
import RoomGallery from '@/components/RoomGallery';
import Footer from '@/components/Footer';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { BedDouble, ShieldCheck, Award } from 'lucide-react';

export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  );
  const { data: hotel } = await supabase.from('hotels').select('id').eq('slug', 'joebrown').maybeSingle();
  
  if (!hotel) return [];
  
  const { data: rooms } = await supabase
    .from('rooms')
    .select('slug')
    .eq('hotel_id', hotel.id);
    
  return (rooms || []).map((room) => ({
    slug: room.slug,
  }));
}

export default async function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerClient();
  
  const { data: hotel } = await supabase.from('hotels').select('*').eq('slug', 'joebrown').maybeSingle();
  const hotelName = hotel?.name || 'Joebrown Palace Hotel and Suites';
  const hotelAddress = hotel?.address || '4, Goodness Avenue, Ore Ofe Estate, off Akala Express, Lagos, Lagos State, Nigeria';
  const hotelPhone = hotel?.whatsapp_number || '+234 800 joebrown';
  
  let room: any = null;

  if (hotel) {
    const { data: dbRoom } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotel.id)
      .eq('slug', slug)
      .maybeSingle();
    if (dbRoom) room = dbRoom;
  }



  if (!room) return notFound();

  const heroImage = room.images?.[0] || '/images/suite.jpg';

  return (
    <main className="min-h-screen bg-[#FFFCEB] text-slate-900 flex flex-col justify-between">
      <Navbar />

      {/* Hero Atmosphere */}
      <section className="relative h-[55vh] md:h-[65vh] w-full bg-slate-900 overflow-hidden">
        <Image 
          src={heroImage} 
          alt={room.name}
          fill
          priority
          className="object-cover opacity-80 scale-105 text-transparent"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFFCEB] via-slate-900/60 to-slate-950/70 z-10" />
        
        <div className="absolute bottom-0 left-0 w-full z-20 pb-12 px-4 md:px-8">
          <div className="container mx-auto max-w-5xl">
            <div className="mb-4">
              <AvailabilityBadge roomId={room.id} initialAvailability={room.is_available} />
            </div>
            <h1 className="text-4xl md:text-6xl font-serif text-slate-900 mb-3 tracking-tight font-bold">{room.name}</h1>
            <div className="text-brown-700 font-serif text-2xl md:text-3xl font-bold">
              ₦{Number(room.price_per_night).toLocaleString()} <span className="text-sm font-sans font-medium tracking-widest text-slate-600 uppercase">/ night</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto max-w-5xl my-12 px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-2xl font-serif mb-4 text-slate-900 pb-3 border-b border-brown-200 font-bold">Room Overview</h2>
              <p className="text-slate-700 leading-relaxed text-base font-normal">
                {room.description || 'Experience comfortable, air-conditioned accommodations tailored to your comfort.'}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif mb-4 text-slate-900 pb-3 border-b border-brown-200 font-bold">Amenities & Specifications</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700 font-normal text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-brown-600 font-bold">•</span> Max Capacity: {room.max_guests} Guests
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brown-600 font-bold">•</span> Room Area: {room.size_sqm || 35} m²
                </li>
                {room.amenities?.map((amenity: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-brown-600 font-bold">•</span> {amenity}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Gallery with Lightbox */}
            {room.images?.length > 1 && (
              <RoomGallery images={room.images} roomName={room.name} />
            )}
          </div>

          {/* Sticky Booking Panel */}
          <div className="relative">
            <div className="sticky top-32 glass-card p-6 md:p-8 bg-[#FFFDF5] border border-brown-300 rounded-2xl shadow-xl">
              <h3 className="text-xl font-serif text-slate-900 mb-2 font-bold">Book {room.name}</h3>
              <p className="text-slate-600 text-xs mb-6 font-normal">Select your check-in and check-out dates to confirm your stay.</p>
              
              <BookingModal room={room} />
              
              <div className="mt-6 pt-6 border-t border-brown-200 text-center">
                <p className="text-xs text-slate-500 mb-2 font-normal">Need assistance?</p>
                <a href="#intercom" className="text-xs text-brown-700 hover:underline font-bold uppercase tracking-wider">Contact Duty Officer</a>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* UNIFIED REUSABLE FOOTER */}
      <Footer hotelName={hotelName} hotelAddress={hotelAddress} hotelPhone={hotelPhone} />

      <CustomerIntercom />
      <WhatsAppButton />
    </main>
  );
}
