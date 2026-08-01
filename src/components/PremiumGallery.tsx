'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface GalleryItem {
  id: string;
  url: string;
  title: string;
  gridClass: string;
}

const BENTO_CLASSES = [
  'md:col-span-2 md:row-span-2 col-span-1 row-span-1 min-h-[300px] md:min-h-[500px]',
  'md:col-span-2 md:row-span-1 col-span-1 row-span-1 min-h-[250px]',
  'md:col-span-1 md:row-span-1 col-span-1 row-span-1 min-h-[250px]',
  'md:col-span-1 md:row-span-1 col-span-1 row-span-1 min-h-[250px]',
  'md:col-span-2 md:row-span-1 col-span-1 row-span-1 min-h-[250px]',
  'md:col-span-2 md:row-span-1 col-span-1 row-span-1 min-h-[250px]',
];

// Fallback images if DB isn't set up yet
const FALLBACK_IMAGES = [
  { url: '/JB/gallery/jb_logo_badge.JPG', title: 'Joebrown Palace Hotel' },
  { url: '/JB/gallery/reception.JPG', title: 'Grand Reception' },
  { url: '/JB/gallery/restaurant_brighter.JPG', title: 'Restaurant & Lounge' },
  { url: '/JB/gallery/P1160317.JPG', title: 'Elegant Spaces' },
  { url: '/JB/gallery/P1160327.JPG', title: 'Atmospheric Luxury' },
  { url: '/JB/gallery/restaurant_aesthetics.JPG', title: 'Refined Dining' },
  { url: '/JB/gallery/P1160356.JPG', title: 'Hotel Details' },
  { url: '/JB/gallery/reception_area_aesthetics.JPG', title: 'Reception Aesthetics' },
  { url: '/JB/gallery/P1160349.JPG', title: 'Bar & Lounge' },
  { url: '/JB/gallery/P1160360.JPG', title: 'Interior Design' },
  { url: '/JB/gallery/towel_monogram.JPG', title: 'Premium Amenities' },
  { url: '/JB/gallery/outsside_view_angle.JPG', title: 'Hotel Exterior' },
];

export default function PremiumGallery({ hotelId }: { hotelId?: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [pool, setPool] = useState<{ url: string; title: string }[]>([]);
  const [fadeSlot, setFadeSlot] = useState<number | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(true);

  useEffect(() => {
    const load = async () => {
      let allImages: { url: string; title: string }[] = [];

      // Try to load from Supabase
      if (hotelId) {
        try {
          const supabase = createClient();
          
          // Fetch settings
          const { data: hotelData } = await supabase.from('hotels').select('gallery_randomize').eq('id', hotelId).maybeSingle();
          const shouldRandomize = hotelData?.gallery_randomize ?? true;
          setIsRandomizing(shouldRandomize);

          const { data } = await supabase
            .from('gallery_images')
            .select('url, title')
            .eq('hotel_id', hotelId)
            .eq('is_active', true)
            .order('display_order', { ascending: true });

          if (data && data.length > 0) {
            allImages = data.map(d => ({ url: d.url, title: d.title || 'The Joebrown Experience' }));
          }
        } catch {
          // Fall through to fallback
        }
      }

      // Use fallback if DB returns nothing
      if (allImages.length === 0) {
        allImages = FALLBACK_IMAGES;
      }

      let display = [];
      let remaining = [];

      if (isRandomizing) {
        // Shuffle the full pool
        const shuffled = [...allImages].sort(() => Math.random() - 0.5);
        display = shuffled.slice(0, 6);
        remaining = shuffled.slice(6);
      } else {
        // Use exact display order
        display = allImages.slice(0, 6);
        remaining = allImages.slice(6);
      }

      setGalleryItems(
        display.map((img, idx) => ({
          id: `${idx}-${Date.now()}`,
          url: img.url,
          title: img.title,
          gridClass: BENTO_CLASSES[idx],
        }))
      );
      setPool(remaining);
    };

    load();
  }, [hotelId, isRandomizing]);

  // Auto-shuffle every 5 seconds
  useEffect(() => {
    if (!isRandomizing) return;
    if (galleryItems.length === 0 || pool.length === 0) return;

    const interval = setInterval(() => {
      const slotIndex = Math.floor(Math.random() * 6);
      const poolIndex = Math.floor(Math.random() * pool.length);
      const incoming = pool[poolIndex];
      const outgoing = { url: galleryItems[slotIndex].url, title: galleryItems[slotIndex].title };

      setFadeSlot(slotIndex);

      setTimeout(() => {
        setGalleryItems(prev => {
          const updated = [...prev];
          updated[slotIndex] = {
            id: `${slotIndex}-${Date.now()}`,
            url: incoming.url,
            title: incoming.title,
            gridClass: BENTO_CLASSES[slotIndex],
          };
          return updated;
        });
        setPool(prev => {
          const updated = [...prev];
          updated[poolIndex] = outgoing;
          return updated;
        });
        setTimeout(() => setFadeSlot(null), 50);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [galleryItems, pool]);

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % galleryItems.length);
  }, [lightboxIndex, galleryItems.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + galleryItems.length) % galleryItems.length);
  }, [lightboxIndex, galleryItems.length]);

  useEffect(() => {
    if (lightboxIndex === null) {
      document.body.style.overflow = 'auto';
      return;
    }
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, goNext, goPrev]);

  if (galleryItems.length === 0) return null;

  return (
    <section className="py-24 px-4 md:px-8 bg-[#170801] text-[#FFFCEB] overflow-hidden">
      <div className="container mx-auto max-w-7xl">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div className="max-w-2xl">
            <span className="text-[#D4A373] text-xs font-extrabold uppercase tracking-[0.25em]">Discover The Estate</span>
            <h2 className="text-4xl md:text-6xl font-serif text-white mt-2 mb-4 font-bold">The Joebrown Experience</h2>
            <p className="text-[#E6CCB2] text-sm md:text-base leading-relaxed font-medium">
              Immerse yourself in our meticulously designed spaces. From breathtaking exteriors to the intimate ambiance of our restaurant and lounge.
            </p>
          </div>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[250px] gap-4">
          {galleryItems.map((item, idx) => (
            <div
              key={`slot-${idx}`}
              onClick={() => openLightbox(idx)}
              className={`relative group overflow-hidden rounded-2xl cursor-pointer bg-[#3B1904] ${item.gridClass} transition-opacity duration-500 ease-in-out ${fadeSlot === idx ? 'opacity-0' : 'opacity-100'}`}
            >
              <Image
                src={item.url}
                alt={item.title}
                fill
                quality={75}
                sizes={
                  idx === 0
                    ? '(max-width: 768px) 100vw, 50vw'
                    : '(max-width: 768px) 100vw, 25vw'
                }
                className="absolute inset-0 object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <span className="text-[10px] uppercase tracking-widest text-white font-bold">Gallery</span>
              </div>
              <div className="absolute bottom-0 left-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 w-full flex justify-between items-end">
                <h3 className="text-xl md:text-2xl font-serif text-white font-bold">{item.title}</h3>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                  <ZoomIn size={18} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 md:top-8 md:right-8 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 text-white/50 text-xs font-bold tracking-[0.2em]">
            {lightboxIndex + 1} / {galleryItems.length}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 md:left-12 z-50 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 backdrop-blur-md hidden sm:block"
            aria-label="Previous"
          >
            <ChevronLeft size={32} />
          </button>

          <div
            className="relative w-full h-full max-w-[90vw] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={galleryItems[lightboxIndex].url}
                alt={galleryItems[lightboxIndex].title}
                fill
                quality={90}
                sizes="90vw"
                className="object-contain rounded-lg shadow-2xl"
              />
            </div>
            <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 text-center w-full">
              <h3 className="text-white font-serif text-2xl font-bold">{galleryItems[lightboxIndex].title}</h3>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 md:right-12 z-50 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 backdrop-blur-md hidden sm:block"
            aria-label="Next"
          >
            <ChevronRight size={32} />
          </button>

          <div className="absolute inset-y-0 left-0 w-1/4 z-40 sm:hidden" onClick={(e) => { e.stopPropagation(); goPrev(); }} />
          <div className="absolute inset-y-0 right-0 w-1/4 z-40 sm:hidden" onClick={(e) => { e.stopPropagation(); goNext(); }} />
        </div>
      )}
    </section>
  );
}
