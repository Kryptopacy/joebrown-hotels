import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import CustomerIntercom from '@/components/CustomerIntercom';
import RoomCardCarousel from '@/components/RoomCardCarousel';
import PremiumGallery from '@/components/PremiumGallery';
import { BedDouble, Calendar, Users, ArrowRight, Award, CheckCircle2, Utensils } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

export default async function LandingPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();

  const { data: hotel } = await supabase
    .from('hotels')
    .select('*')
    .eq('slug', 'joebrown')
    .maybeSingle();

  const hotelName = hotel?.name || 'Joebrown Palace Hotel and Suites';
  const hotelAddress = hotel?.address || 'Your Hotel Address Here, City, State, Country';
  const hotelPhone = hotel?.whatsapp_number || '+1234567890';

  let rooms: any[] = [];
  if (hotel) {
    const { data: roomData } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotel.id)
      .order('display_order', { ascending: true })
      .limit(3);
    if (roomData && roomData.length > 0) rooms = roomData;
  }

  // Fetch gallery images
  let galleryImages: string[] = [];
  try {
    const galleryDir = path.join(process.cwd(), 'public', 'JB', 'gallery');
    if (fs.existsSync(galleryDir)) {
      galleryImages = fs.readdirSync(galleryDir)
        .filter(f => f.match(/\.(jpg|jpeg|png)$/i))
        .map(f => `/JB/gallery/${f}`);
    }
  } catch (err) {
    console.error('Error reading gallery:', err);
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#2C1E16] flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      {/* 1. HERO BANNER WITH STUNNING PARALLAX IMAGE & ELEGANT TYPOGRAPHY */}
      <section className="relative min-h-[92vh] flex flex-col justify-between pt-32 md:pt-36 pb-20 px-4 md:px-8 overflow-hidden bg-[#2C1E16]">
        {/* Cinematic Edge-to-Edge Exterior Background */}
        <Image 
          src="/JB/jb_logo_badge.JPG" 
          alt="Joebrown Palace Hotel and Suites"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover z-0 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1E16] via-transparent to-black/30 z-0 pointer-events-none" />

        <div className="container mx-auto my-auto text-center z-10 pt-10 max-w-5xl relative animate-fade-in-up">
          {/* Masterpiece Title with Perfect Line Height & Sharp Contrast */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif text-white mb-6 tracking-tight leading-[1.05] font-normal">
            Joebrown Palace<br />Hotel and Suites
          </h1>

          {/* Subtitle in High-Legibility Font */}
          <p className="text-white/90 max-w-2xl mx-auto text-sm sm:text-lg font-light mb-12 leading-relaxed tracking-wide">
            {hotel?.description || 'Refined accommodations, freshly prepared local & continental dining, ice-cold drinks, and an atmospheric lounge in Lagos.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-6">
            <Link href="/rooms" className="btn-primary">
              View Rooms & Book Stay <ArrowRight size={16} />
            </Link>
            <Link href="/menu" className="btn-secondary text-white border-white hover:bg-white hover:text-[#2C1E16]">
              <Utensils size={16} /> Restaurant & Lounge Menu
            </Link>
          </div>
        </div>

        {/* 2. ELEVATED RESERVATION SEARCH CARD */}
        <div className="container mx-auto mt-10 z-20 max-w-5xl relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <form action="/rooms" method="GET" className="glass-card p-6 md:p-8 flex flex-col lg:flex-row items-center gap-6 relative overflow-hidden">
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#5C554F] font-semibold mb-2 flex items-center gap-2">
                  <Calendar size={14} className="text-brown" /> Check-in Date
                </label>
                <input
                  type="date"
                  name="checkIn"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-[#FAF9F6] text-sm py-3 px-4 text-[#2C1E16] border border-[#E5E1D8] rounded-md focus:outline-none focus:border-brown transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#5C554F] font-semibold mb-2 flex items-center gap-2">
                  <Calendar size={14} className="text-brown" /> Check-out Date
                </label>
                <input
                  type="date"
                  name="checkOut"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-[#FAF9F6] text-sm py-3 px-4 text-[#2C1E16] border border-[#E5E1D8] rounded-md focus:outline-none focus:border-brown transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#5C554F] font-semibold mb-2 flex items-center gap-2">
                  <Users size={14} className="text-brown" /> Guests
                </label>
                <select name="guests" className="w-full bg-[#FAF9F6] text-sm py-3 px-4 text-[#2C1E16] border border-[#E5E1D8] rounded-md focus:outline-none focus:border-brown transition-colors">
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full lg:w-auto h-full min-h-[46px] whitespace-nowrap">
              Check Availability
            </button>
          </form>
        </div>
      </section>

      {/* 3. FEATURED ROOMS SECTION WITH REAL ROOM PHOTOS */}
      <section className="py-32 px-4 md:px-8 bg-transparent">
        <div className="container mx-auto max-w-6xl animate-fade-in-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
            <div>
              <span className="text-brown text-[10px] font-semibold uppercase tracking-[0.25em]">Guest Accommodations</span>
              <h2 className="text-4xl md:text-5xl font-serif text-[#2C1E16] mt-2">Rooms & Suites</h2>
            </div>
            <Link href="/rooms" className="text-xs font-semibold uppercase tracking-widest text-brown hover:text-brown-dark flex items-center gap-2 group transition-colors">
              View All Rooms <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {rooms.map((room) => (
              <div key={room.id} className="glass-card group flex flex-col justify-between overflow-hidden">
                <div className="flex-1 flex flex-col">
                  <RoomCardCarousel images={room.images || []} roomName={room.name} />
                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-serif text-[#2C1E16] mb-3 group-hover:text-brown transition-colors">{room.name}</h3>
                      <p className="text-[#5C554F] text-sm leading-relaxed line-clamp-2 mb-6 font-light">{room.description}</p>
                    </div>
                    <div className="flex items-center gap-6 text-[11px] uppercase tracking-widest text-[#5C554F] pt-6 border-t border-[#E5E1D8]">
                      <span className="flex items-center gap-2"><BedDouble size={14} className="text-brown" /> {room.max_guests} Guests</span>
                      <span className="flex items-center gap-2"><Award size={14} className="text-brown" /> {room.size_sqm || 35} m²</span>
                    </div>
                  </div>
                </div>
                <div className="px-8 py-6 border-t border-[#E5E1D8] flex items-center justify-between bg-white/50">
                  <div>
                    <span className="text-[10px] text-[#5C554F] block uppercase tracking-[0.2em] font-semibold mb-1">Rate</span>
                    <div className="text-brown font-serif text-2xl">
                      ₦{Number(room.price_per_night).toLocaleString()} <span className="text-xs font-sans text-[#5C554F]">/night</span>
                    </div>
                  </div>
                  <Link href={`/rooms/${room.slug}`} className="btn-secondary text-[10px] px-6 py-2">
                    Book Room
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PREMIUM BENTO BOX GALLERY */}
      <PremiumGallery initialImages={galleryImages} />

      {/* 5. BAR & KITCHEN SECTION */}
      <section className="py-32 px-4 md:px-8 bg-transparent">
        <div className="container mx-auto max-w-6xl animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[550px] rounded-lg overflow-hidden glass-card group">
              <Image 
                src="/JB/restaurant_brighter.JPG" 
                alt="Joebrown Restaurant Food and Drinks"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-[1.5s]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-white text-sm font-light leading-relaxed">Enjoy freshly cooked meals, grilled dishes, and ice-cold drinks in an atmosphere of refined elegance.</p>
              </div>
            </div>

            <div className="pl-0 lg:pl-10">
              <span className="text-brown text-[10px] font-semibold uppercase tracking-[0.25em]">Dining & Refreshments</span>
              <h2 className="text-4xl md:text-5xl font-serif text-[#2C1E16] mt-2 mb-8">Restaurant & Lounge</h2>
              <p className="text-[#5C554F] text-base leading-relaxed mb-10 font-light">
                Enjoy freshly prepared Nigerian specialties, pepper soup, grilled meals, savory snacks, alongside ice-cold beers, fine wines, cognac, and handcrafted cocktails. Guests can order online directly from their phones using room or table QR codes.
              </p>
              <div className="space-y-4 mb-12">
                <div className="flex items-center gap-4 text-sm text-[#2C1E16] font-medium">
                  <CheckCircle2 size={16} className="text-brown flex-shrink-0" />
                  <span>Freshly Prepared Local Delicacies & Grills</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#2C1E16] font-medium">
                  <CheckCircle2 size={16} className="text-brown flex-shrink-0" />
                  <span>Fine Wines, Cognac & Handcrafted Cocktails</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#2C1E16] font-medium">
                  <CheckCircle2 size={16} className="text-brown flex-shrink-0" />
                  <span>Digital QR Ordering for Rooms & Lounge Tables</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#2C1E16] font-medium">
                  <CheckCircle2 size={16} className="text-brown flex-shrink-0" />
                  <span>24/7 Kitchen Order Dispatch & Room Delivery</span>
                </div>
              </div>
              <Link href="/menu" className="btn-primary">
                <Utensils size={16} /> Explore Menus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. REUSABLE LUXURY FOOTER WITH CLEAR COPYRIGHT POSITIONING */}
      <Footer hotelName={hotelName} hotelAddress={hotelAddress} hotelPhone={hotelPhone} />

      <WhatsAppButton />
      <CustomerIntercom />
    </main>
  );
}
