import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ArrowRight, ShieldCheck, Clock, Utensils, BedDouble } from 'lucide-react';

import Image from 'next/image';

interface FooterProps {
  hotelName?: string;
  hotelAddress?: string;
  hotelPhone?: string;
}

export default function Footer({
  hotelName = 'Joebrown Palace Hotel and Suites',
  hotelAddress = '4, Goodness Avenue, Ore Ofe Estate, off Akala Express, Lagos, Lagos State, Nigeria',
  hotelPhone = '+234 800 joebrown',
}: FooterProps) {
  return (
    <footer className="relative text-white pt-24 pb-32 px-4 md:px-8 overflow-hidden bg-[#0A0401] border-t border-white/5">
      
      {/* Subtle Glowing Brand Aura in Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#D4A373]/5 blur-[130px] pointer-events-none rounded-full" />

      {/* Main Grid Content */}
      <div className="container mx-auto max-w-6xl relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* Col 1: Brand & Tagline */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg p-1.5 shrink-0 overflow-hidden">
              <Image src="/jb_logo_transparent.PNG" alt="Joebrown Logo" fill className="object-contain p-1.5" sizes="48px" />
            </div>
            <span className="text-3xl font-serif text-white font-normal tracking-wide">{hotelName}</span>
          </div>
          
          <p className="text-[#A1887F] text-sm max-w-md leading-relaxed font-light">
            Refined accommodations, freshly prepared local & continental kitchen dining, ice-cold lounge drinks, and 24/7 express room service in Lagos, Nigeria.
          </p>

          <div className="pt-4 flex flex-wrap gap-6 text-[11px] uppercase tracking-widest text-[#D7D3C8]">
            <span className="flex items-center gap-2"><Clock size={14} className="text-[#D4A373]" /> 24/7 Front Desk</span>
            <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-[#D4A373]" /> Secure Premises</span>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.25em] text-white font-semibold mb-6 pb-3 border-b border-white/10">
            Navigation
          </h4>
          <ul className="space-y-4 text-[13px] font-light">
            <li>
              <Link href="/rooms" className="text-[#A1887F] hover:text-[#D4A373] transition-colors flex items-center gap-3">
                <BedDouble size={14} className="text-[#D4A373]" /> Rooms & Suites
              </Link>
            </li>
            <li>
              <Link href="/menu" className="text-[#A1887F] hover:text-[#D4A373] transition-colors flex items-center gap-3">
                <Utensils size={14} className="text-[#D4A373]" /> Restaurant & Lounge Menu
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-[#A1887F] hover:text-[#D4A373] transition-colors flex items-center gap-3">
                <MapPin size={14} className="text-[#D4A373]" /> Contact & Location
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-[#A1887F] hover:text-[#D4A373] transition-colors flex items-center gap-3">
                <ArrowRight size={14} className="text-[#D4A373]" /> Staff Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Contact Info */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.25em] text-white font-semibold mb-6 pb-3 border-b border-white/10">
            Direct Contact
          </h4>
          <ul className="space-y-5 text-[13px] font-light">
            <li className="flex items-start gap-3">
              <Phone size={16} className="text-[#D4A373] shrink-0 mt-0.5" />
              <span className="text-[#A1887F]">{hotelPhone}</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={16} className="text-[#D4A373] shrink-0 mt-0.5" />
              <span className="text-[#A1887F]">info@joebrownhotels.com</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-[#D4A373] shrink-0 mt-0.5" />
              <span className="text-[#A1887F] leading-relaxed">{hotelAddress}</span>
            </li>
          </ul>
        </div>

      </div>

      {/* COPYRIGHT ROW SHIFTED SAFELY ABOVE DIVIDER WITH pb-32 OVERLAP CLEARANCE */}
      <div className="container mx-auto max-w-6xl relative z-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] tracking-widest text-[#737373] font-medium gap-4 uppercase">
        <p>© {new Date().getFullYear()} {hotelName}. All rights reserved.</p>
        <p className="flex items-center gap-2">
          Need a custom platform?{' '}
          <Link 
            href="/build-with-us" 
            className="text-[#D4A373] hover:text-white font-bold transition-colors"
          >
            Build With Us (Pacy Labs)
          </Link>
        </p>
      </div>

    </footer>
  );
}
