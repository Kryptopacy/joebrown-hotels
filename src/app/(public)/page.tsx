import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to Joebrown Palace Hotel and Suites, offering premium rooms and exquisite dining.',
  alternates: {
    canonical: 'https://joebrownhotels.com'
  }
};
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import CustomerIntercom from '@/components/CustomerIntercom';
import RoomCardCarousel from '@/components/RoomCardCarousel';
import PremiumGallery from '@/components/PremiumGallery';
import { BedDouble, Calendar, Users, ArrowRight, Award, CheckCircle2, Utensils, ShieldCheck, Gamepad2, Car } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';


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
  const hotelAddress = hotel?.address || 'Lagos, Nigeria';
  const hotelPhone = hotel?.whatsapp_number || '+2348000000000';

  let rooms: any[] = [];
  if (hotel) {
    const { data: roomData } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotel.id)
      .eq('is_featured', true)
      .order('display_order', { ascending: true })
      .limit(3);
    if (roomData && roomData.length > 0) rooms = roomData;
  }



  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#2C1E16] flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      {/* 1. HERO BANNER WITH STUNNING PARALLAX IMAGE & ELEGANT TYPOGRAPHY */}
      <section className="relative min-h-[92vh] flex flex-col justify-between pt-32 md:pt-36 pb-20 px-4 md:px-8 overflow-hidden bg-[#2C1E16]">
        {/* Cinematic Edge-to-Edge Exterior Background */}
        <Image 
          src="/JB/gallery/jb_logo_badge.JPG" 
          alt="Joebrown Palace Hotel and Suites"
          fill
          priority
          quality={75}
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
            <Link href="/menu" className="flex items-center justify-center gap-2 px-8 py-3 bg-white/10 backdrop-blur-md text-white font-semibold text-[0.8rem] uppercase tracking-[2px] rounded border border-white hover:bg-white hover:text-[#2C1E16] transition-all duration-300">
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

      {/* 2.5. OUR FACILITIES SECTION */}
      <section className="py-24 md:py-32 px-4 md:px-8 bg-[#0a0604]">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">
                Discover Our Exceptional<br />Hotel Facilities
              </h2>
              <p className="text-[#A1887F] text-sm md:text-base leading-relaxed max-w-xl">
                We provide unmatched comfort, personalized service, and amenities that make every guest feel truly special.
              </p>
            </div>
            <Link href="/contact" className="btn-primary self-start lg:self-center px-8">
              Contact Us
            </Link>
          </div>

          {/* Facilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Card 1: Rooms & Suites */}
            <div className="bg-[#1A0A02] rounded-[2rem] text-center flex flex-col items-center border border-[#5D3A1A]/40 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(212,163,115,0.15)] hover:border-[#D4A373]/50 relative overflow-hidden pb-10 group">
              <div className="absolute top-0 left-0 right-0 h-[120px] bg-[#0D0501] rounded-b-[100%] scale-x-150 origin-top border-b border-[#5D3A1A]/30 transition-colors group-hover:border-[#D4A373]/30"></div>
              <div className="relative z-10 w-[100px] h-[100px] bg-[#1A0A02] rounded-full flex items-center justify-center mt-[70px] mb-6 border-[6px] border-[#1A0A02] mx-auto shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_10px_30px_rgba(212,163,115,0.15)] transition-shadow duration-300">
                <BedDouble size={40} className="text-[#D4A373] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
              </div>
              <div className="relative z-10 px-8">
                <h3 className="text-2xl font-serif text-white mb-4 group-hover:text-[#D4A373] transition-colors">Rooms and Suites</h3>
                <p className="text-[#A1887F] text-sm leading-relaxed font-light">
                  Relax in elegantly designed rooms and suites offering modern comfort, luxury amenities, and scenic views.
                </p>
              </div>
            </div>

            {/* Card 2: 24-Hour Security */}
            <div className="bg-[#1A0A02] rounded-[2rem] text-center flex flex-col items-center border border-[#5D3A1A]/40 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(212,163,115,0.15)] hover:border-[#D4A373]/50 relative overflow-hidden pb-10 group">
              <div className="absolute top-0 left-0 right-0 h-[120px] bg-[#0D0501] rounded-b-[100%] scale-x-150 origin-top border-b border-[#5D3A1A]/30 transition-colors group-hover:border-[#D4A373]/30"></div>
              <div className="relative z-10 w-[100px] h-[100px] bg-[#1A0A02] rounded-full flex items-center justify-center mt-[70px] mb-6 border-[6px] border-[#1A0A02] mx-auto shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_10px_30px_rgba(212,163,115,0.15)] transition-shadow duration-300">
                <ShieldCheck size={40} className="text-[#D4A373] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
              </div>
              <div className="relative z-10 px-8">
                <h3 className="text-2xl font-serif text-white mb-4 group-hover:text-[#D4A373] transition-colors">24-Hour Security</h3>
                <p className="text-[#A1887F] text-sm leading-relaxed font-light">
                  Enjoy peace of mind with our 24-hour security ensuring your safety and comfort throughout your stay.
                </p>
              </div>
            </div>

            {/* Card 3: Lounge Games & Billiards */}
            <div className="bg-[#1A0A02] rounded-[2rem] text-center flex flex-col items-center border border-[#5D3A1A]/40 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(212,163,115,0.15)] hover:border-[#D4A373]/50 relative overflow-hidden pb-10 group">
              <div className="absolute top-0 left-0 right-0 h-[120px] bg-[#0D0501] rounded-b-[100%] scale-x-150 origin-top border-b border-[#5D3A1A]/30 transition-colors group-hover:border-[#D4A373]/30"></div>
              <div className="relative z-10 w-[100px] h-[100px] bg-[#1A0A02] rounded-full flex items-center justify-center mt-[70px] mb-6 border-[6px] border-[#1A0A02] mx-auto shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_10px_30px_rgba(212,163,115,0.15)] transition-shadow duration-300">
                <Gamepad2 size={40} className="text-[#D4A373] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
              </div>
              <div className="relative z-10 px-8">
                <h3 className="text-2xl font-serif text-white mb-4 group-hover:text-[#D4A373] transition-colors">Lounge & Games</h3>
                <p className="text-[#A1887F] text-sm leading-relaxed font-light">
                  Unwind in our vibrant lounge featuring a championship pool table, games, and a warm ambiance for socializing.
                </p>
              </div>
            </div>

            {/* Card 4: Free Parking & Laundromat */}
            <div className="bg-[#1A0A02] rounded-[2rem] text-center flex flex-col items-center border border-[#5D3A1A]/40 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(212,163,115,0.15)] hover:border-[#D4A373]/50 relative overflow-hidden pb-10 group">
              <div className="absolute top-0 left-0 right-0 h-[120px] bg-[#0D0501] rounded-b-[100%] scale-x-150 origin-top border-b border-[#5D3A1A]/30 transition-colors group-hover:border-[#D4A373]/30"></div>
              <div className="relative z-10 w-[100px] h-[100px] bg-[#1A0A02] rounded-full flex items-center justify-center mt-[70px] mb-6 border-[6px] border-[#1A0A02] mx-auto shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_10px_30px_rgba(212,163,115,0.15)] transition-shadow duration-300">
                <Car size={40} className="text-[#D4A373] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
              </div>
              <div className="relative z-10 px-8">
                <h3 className="text-2xl font-serif text-white mb-4 group-hover:text-[#D4A373] transition-colors">Free Parking & Laundry</h3>
                <p className="text-[#A1887F] text-sm leading-relaxed font-light">
                  Enjoy complimentary secure on-site parking and convenient access to our modern guest laundromat.
                </p>
              </div>
            </div>
          </div>
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
              <div key={room.id} className="bg-[#1A0A02] rounded-3xl border border-[#5D3A1A]/40 shadow-2xl group flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(212,163,115,0.15)] hover:border-[#D4A373]/50">
                <div className="flex-1 flex flex-col">
                  <div className="relative">
                    <RoomCardCarousel images={room.images || []} roomName={room.name} />
                    {/* Subtle gradient overlay at bottom of image to blend into the dark card */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1A0A02] to-transparent pointer-events-none" />
                  </div>
                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-serif text-white mb-3 group-hover:text-[#D4A373] transition-colors">{room.name}</h3>
                      <p className="text-[#A1887F] text-sm leading-relaxed line-clamp-2 mb-6 font-light">{room.description}</p>
                    </div>
                    <div className="flex items-center gap-6 text-[11px] uppercase tracking-widest text-[#A1887F] pt-6 border-t border-white/10">
                      <span className="flex items-center gap-2"><BedDouble size={14} className="text-[#D4A373]" /> {room.max_guests} Guests</span>
                      <span className="flex items-center gap-2"><Award size={14} className="text-[#D4A373]" /> {room.size_sqm || 35} m²</span>
                    </div>
                  </div>
                </div>
                <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
                  <div>
                    <span className="text-[10px] text-[#A1887F] block uppercase tracking-[0.2em] font-semibold mb-1">Rate</span>
                    <div className="text-[#D4A373] font-serif text-2xl font-bold">
                      ₦{Number(room.price_per_night).toLocaleString()} <span className="text-xs font-sans text-[#A1887F] font-normal">/night</span>
                    </div>
                  </div>
                  <Link href={`/rooms/${room.slug}`} className="bg-[#D4A373] text-[#1A0A02] font-bold tracking-widest uppercase text-[10px] px-6 py-3 rounded-full hover:bg-white transition-colors shadow-[0_0_15px_rgba(212,163,115,0.2)]">
                    Book Room
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PREMIUM BENTO BOX GALLERY */}
      <PremiumGallery hotelId={hotel?.id} />

      {/* 5. BAR & KITCHEN SECTION */}
      <section className="py-32 px-4 md:px-8 bg-transparent">
        <div className="container mx-auto max-w-6xl animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[550px] rounded-lg overflow-hidden glass-card group">
              <Image 
                src="/JB/gallery/restaurant_brighter.JPG" 
                alt="Joebrown Restaurant Food and Drinks"
                fill
                quality={75}
                sizes="(max-width: 1024px) 100vw, 50vw"
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
