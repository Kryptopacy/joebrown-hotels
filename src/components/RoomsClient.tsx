'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BedDouble, Award, ArrowRight, Search } from 'lucide-react';
import RoomCardCarousel from '@/components/RoomCardCarousel';

interface RoomsClientProps {
  initialRooms: any[];
}

export default function RoomsClient({ initialRooms }: RoomsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [guestFilter, setGuestFilter] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Derive categories from room names for scalability
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    initialRooms.forEach(room => {
      const lower = room.name.toLowerCase();
      if (lower.includes('suite')) cats.add('Suites');
      else if (lower.includes('executive')) cats.add('Executive');
      else if (lower.includes('deluxe')) cats.add('Deluxe');
      else if (lower.includes('standard')) cats.add('Standard');
      else cats.add('Classic');
    });
    return Array.from(cats).sort();
  }, [initialRooms]);

  const getRoomCategory = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('suite')) return 'Suites';
    if (lower.includes('executive')) return 'Executive';
    if (lower.includes('deluxe')) return 'Deluxe';
    if (lower.includes('standard')) return 'Standard';
    return 'Classic';
  };

  const filteredRooms = initialRooms.filter((room) => {
    const matchesSearch = 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGuests = 
      guestFilter === 'all' || room.max_guests >= parseInt(guestFilter);

    const matchesCategory = 
      activeCategory === 'all' || getRoomCategory(room.name) === activeCategory;

    return matchesSearch && matchesGuests && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* CATEGORY FILTER ROW */}
      <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <button
          onClick={() => setActiveCategory('all')}
          className={`whitespace-nowrap px-5 py-2 text-sm font-bold rounded-full transition-all border ${activeCategory === 'all' ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-md' : 'bg-[#2C1203]/60 text-[#D4A373] hover:bg-[#3E2723]/60 border-[#5D3A1A]/40'}`}
        >
          All Rooms
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-5 py-2 text-sm font-bold rounded-full transition-all border ${activeCategory === cat ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-md' : 'bg-[#2C1203]/60 text-[#D4A373] hover:bg-[#3E2723]/60 border-[#5D3A1A]/40'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-[#1A0A02] border border-[#5D3A1A]/40 rounded-2xl shadow-xl p-5 md:p-6 flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A373]" size={18} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms by suite title or features..."
            className="w-full pl-11 pr-4 py-3 bg-[#0D0501] text-white placeholder:text-[#8D6E63]/60 border border-[#5D3A1A] rounded-xl focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] text-sm font-semibold shadow-inner transition-all"
          />
        </div>

        {/* Capacity Selector */}
        <div className="w-full md:w-56">
          <select 
            value={guestFilter}
            onChange={(e) => setGuestFilter(e.target.value)}
            className="w-full bg-[#0D0501] text-white border border-[#5D3A1A] rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Guests Capacity</option>
            <option value="1">1+ Guest</option>
            <option value="2">2+ Guests</option>
            <option value="3">3+ Guests</option>
          </select>
        </div>
      </div>

      {/* ROOM CARDS GRID */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-20 text-[#8D6E63] border border-[#5D3A1A]/40 rounded-2xl bg-[#1A0A02]">
          No rooms match your search criteria "{searchQuery}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.slice(0, visibleCount).map((room) => (
            <div key={room.id} className="group flex flex-col justify-between overflow-hidden bg-[#1A0A02] border border-white/10 rounded-3xl shadow-2xl hover:border-[#D4A373]/50 hover:-translate-y-1 transition-all duration-500">
              <div className="flex-1 flex flex-col">
                <div className="relative shrink-0 h-64 border-b border-white/5">
                  <Link href={`/rooms/${room.slug}`} className="block absolute inset-0 z-20" aria-label={`View ${room.name} details`} />
                  <RoomCardCarousel images={room.images || []} roomName={room.name} />
                  
                  {/* Premium availability badge with glassmorphism */}
                  <div className="absolute top-4 right-4 z-30 bg-[#1A0A02]/60 backdrop-blur-md px-4 py-1.5 text-[10px] text-[#D4A373] uppercase tracking-widest font-bold border border-white/10 shadow-lg rounded-full">
                    {room.is_available ? 'Available' : 'Booked'}
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#1A0A02] to-[#120701]">
                  <div>
                    <h3 className="text-3xl font-serif text-white mb-3 group-hover:text-[#D4A373] transition-colors font-bold tracking-wide">{room.name}</h3>
                    <p className="text-[#A1887F] text-sm line-clamp-2 mb-6 font-light leading-relaxed">{room.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-[#D4A373] pt-6 border-t border-white/5">
                    <span className="flex items-center gap-2 font-medium"><BedDouble size={18} className="text-[#E6CCB2]" /> {room.max_guests} Guests Max</span>
                    <span className="flex items-center gap-2 font-medium"><Award size={18} className="text-[#E6CCB2]" /> {room.size_sqm || 35} m²</span>
                  </div>
                </div>
              </div>

              {/* BOTTOM BAR WITH GLASSMORPHISM & GOLD BUTTON */}
              <div className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-white/5 bg-white/5 backdrop-blur-xl gap-4">
                <div>
                  <span className="text-[10px] text-[#A1887F] block uppercase tracking-[0.2em] font-medium mb-1">Rate from</span>
                  <div className="text-white font-serif text-3xl font-bold leading-none">
                    ₦{Number(room.price_per_night).toLocaleString()}
                    <span className="text-sm text-[#A1887F] font-sans font-normal ml-2">/night</span>
                  </div>
                </div>
                <Link href={`/rooms/${room.slug}`} className="bg-[#D4A373] hover:bg-[#E6CCB2] text-[#1A0A02] text-xs uppercase tracking-[0.2em] px-8 py-4 flex items-center gap-2 justify-center font-bold shadow-[0_0_20px_rgba(212,163,115,0.3)] hover:shadow-[0_0_25px_rgba(230,204,178,0.5)] w-full sm:w-auto shrink-0 rounded-full transition-all duration-300">
                  Book Room <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredRooms.length > visibleCount && (
        <div className="flex justify-center pt-8">
          <button 
            onClick={() => setVisibleCount(prev => prev + 12)}
            className="px-8 py-4 bg-transparent border border-[#5D3A1A]/60 text-[#D4A373] font-bold rounded-xl shadow-sm hover:bg-[#2C1203] hover:shadow-md transition-all text-xs uppercase tracking-wider"
          >
            Load More Rooms
          </button>
        </div>
      )}
    </div>
  );
}
