'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useHotel } from '@/contexts/HotelContext';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { hotel } = useHotel();
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 30);
      // The gallery/dark section starts at roughly 92vh
      const heroHeight = window.innerHeight * 0.92;
      // Gallery section is ~800px, so dark from heroHeight to heroHeight+800
      const galleryEnd = heroHeight + 900;
      setOverDark(y > heroHeight - 80 && y < galleryEnd);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClasses = `fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ease-in-out ${
    scrolled
      ? 'top-4 w-[95%] md:w-[88%] max-w-6xl bg-[#1A0A02]/90 backdrop-blur-2xl border border-[#5D3A1A]/40 rounded-full py-2 shadow-[0_8px_40px_rgba(0,0,0,0.40)]'
      : 'top-6 w-[95%] md:w-[92%] max-w-7xl bg-[#1A0A02]/70 backdrop-blur-md border border-[#5D3A1A]/50 rounded-full py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.2)]'
  }`;

  return (
    <>
      <nav className={navClasses}>
        <div className="px-5 md:px-8 flex justify-between items-center gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative h-8 md:h-10 w-8 md:w-10">
              <Image src="/jb_logo_transparent.PNG" alt="Joebrown Logo" fill className="object-contain" sizes="(max-width: 768px) 32px, 40px" />
            </div>
            <div className="flex flex-col shrink-0">
              <span className="text-[20px] md:text-[22px] font-serif tracking-tight whitespace-nowrap leading-none mb-1 text-[#E6CCB2]">
                Joebrown
              </span>
              <span className="text-[9px] tracking-[0.28em] uppercase font-sans font-bold whitespace-nowrap leading-none text-[#D4A373]">
                Palace Hotel & Suites
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-7 xl:gap-9 shrink-0">
            {(['Rooms & Suites', 'Restaurant & Lounge', 'Contact', 'Staff Portal'] as const).map((label) => {
              const href = label === 'Rooms & Suites' ? '/rooms' : label === 'Restaurant & Lounge' ? '/menu' : label === 'Contact' ? '/contact' : '/admin';
              return (
                <Link
                  key={label}
                  href={href}
                  className="text-[10px] uppercase tracking-[0.25em] font-extrabold transition-colors whitespace-nowrap text-[#E6CCB2] hover:text-[#D4A373]"
                >
                  {label}
                </Link>
              );
            })}
            <Link
              href="/rooms"
              className="px-6 py-2.5 rounded-full text-[9.5px] uppercase tracking-[0.25em] font-extrabold transition-all duration-300 shadow-sm hover:shadow-md ml-1 bg-[#D4A373] hover:bg-[#E6CCB2] text-[#1A0A02]"
            >
              Book Stay
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-1.5 shrink-0 transition-colors text-[#E6CCB2] hover:text-[#D4A373]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed z-40 animate-fade-in-up"
          style={{ top: scrolled ? '76px' : '92px', left: '50%', transform: 'translateX(-50%)', width: '95%', maxWidth: '600px' }}
        >
          <div className="bg-[#1A0A02]/95 backdrop-blur-2xl rounded-3xl border border-[#5D3A1A]/50 shadow-[0_20px_60px_rgba(0,0,0,0.4)] py-6 px-6 flex flex-col gap-1">
            <Link href="/rooms" onClick={() => setMobileMenuOpen(false)} className="text-[11px] uppercase tracking-[0.22em] text-[#E6CCB2] font-bold hover:text-[#D4A373] py-3.5 border-b border-[#5D3A1A]/30 transition-colors">
              Rooms & Suites
            </Link>
            <Link href="/menu" onClick={() => setMobileMenuOpen(false)} className="text-[11px] uppercase tracking-[0.22em] text-[#E6CCB2] font-bold hover:text-[#D4A373] py-3.5 border-b border-[#5D3A1A]/30 transition-colors">
              Restaurant & Lounge
            </Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-[11px] uppercase tracking-[0.22em] text-[#E6CCB2] font-bold hover:text-[#D4A373] py-3.5 border-b border-[#5D3A1A]/30 transition-colors">
              Contact
            </Link>
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-[11px] uppercase tracking-[0.22em] text-[#8D6E63] font-bold py-3.5 border-b border-[#5D3A1A]/30 transition-colors">
              Staff Portal
            </Link>
            <Link
              href="/rooms"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-[#D4A373] hover:bg-[#E6CCB2] text-[#1A0A02] w-full text-center mt-4 py-3.5 rounded-full text-[10px] uppercase tracking-[0.25em] font-extrabold transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Book Stay
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
