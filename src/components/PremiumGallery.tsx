'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  url: string;
  gridClass: string;
}

const DEFAULT_CATEGORIES = ['Environment', 'Lounge', 'Rooms', 'Restaurant', 'Bar', 'Amenities', 'Details'];
const DEFAULT_TITLES = ['The Joebrown Experience', 'Elegant Spaces', 'Refined Comfort', 'Atmospheric Luxury', 'Premium Amenities', 'Beautiful Architecture'];

const GRID_CLASSES = [
  'col-span-1 md:col-span-2 row-span-2 min-h-[300px] md:min-h-[500px]',
  'col-span-1 row-span-1 min-h-[250px]',
  'col-span-1 row-span-2 min-h-[300px] md:min-h-[500px]',
  'col-span-1 row-span-1 min-h-[250px]',
  'col-span-1 md:col-span-2 row-span-1 min-h-[250px]',
  'col-span-1 row-span-1 min-h-[250px]',
  'col-span-1 md:col-span-2 row-span-2 min-h-[350px]',
  'col-span-1 row-span-2 min-h-[300px]',
];

export default function PremiumGallery({ initialImages = [] }: { initialImages?: string[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    // If we have images from the server, shuffle and assign them
    let urls = [...initialImages];
    if (urls.length === 0) {
      // Fallback to demo images if folder is empty
      urls = [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1436018626274-89acd1d6ec9d?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800'
      ];
    } else {
      // Shuffle the array of images
      urls.sort(() => Math.random() - 0.5);
      // Take up to 10 for the gallery to keep the bento box tidy
      urls = urls.slice(0, 10);
    }

    const items: GalleryItem[] = urls.map((url, idx) => ({
      id: idx,
      url,
      title: DEFAULT_TITLES[Math.floor(Math.random() * DEFAULT_TITLES.length)],
      category: DEFAULT_CATEGORIES[Math.floor(Math.random() * DEFAULT_CATEGORIES.length)],
      gridClass: GRID_CLASSES[idx % GRID_CLASSES.length],
    }));

    setGalleryItems(items);
  }, [initialImages]);

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % galleryItems.length);
  }, [lightboxIndex]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + galleryItems.length) % galleryItems.length);
  }, [lightboxIndex]);

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
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div className="max-w-2xl">
            <span className="text-[#D4A373] text-xs font-extrabold uppercase tracking-[0.25em]">Discover The Estate</span>
            <h2 className="text-4xl md:text-6xl font-serif text-white mt-2 mb-4 font-bold">The Joebrown Experience</h2>
            <p className="text-[#E6CCB2] text-sm md:text-base leading-relaxed font-medium">
              Immerse yourself in our meticulously designed spaces. From the breathtaking aerial views of our expansive grounds to the intimate ambiance of our continental bar and fine dining restaurant.
            </p>
          </div>
        </div>

        {/* Asymmetric Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[250px] gap-4">
          {galleryItems.map((item, idx) => (
            <div 
              key={item.id}
              onClick={() => openLightbox(idx)}
              className={`relative group overflow-hidden rounded-2xl cursor-pointer bg-[#3B1904] ${item.gridClass}`}
            >
              {/* Image with slow zoom on hover */}
              <img 
                src={item.url}
                alt={item.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              
              {/* Cinematic Dark Gradient Overlay (fades in on hover) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Persistent category tag */}
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <span className="text-[10px] uppercase tracking-widest text-white font-bold">{item.category}</span>
              </div>

              {/* Text Reveal (slides up on hover) */}
              <div className="absolute bottom-0 left-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 w-full flex justify-between items-end">
                <div>
                  <h3 className="text-xl md:text-2xl font-serif text-white font-bold">{item.title}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                  <ZoomIn size={18} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cinematic Full-Screen Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in">
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
            className="relative w-full h-full max-w-[90vw] max-h-[85vh] flex items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* The Main Image */}
            <img
              src={galleryItems[lightboxIndex].url.replace('&w=800', '&w=1600').replace('&w=1200', '&w=1600')}
              alt={galleryItems[lightboxIndex].title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-fade-in-up"
            />
            
            {/* Lightbox Caption */}
            <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 text-center w-full">
              <h3 className="text-white font-serif text-2xl font-bold">{galleryItems[lightboxIndex].title}</h3>
              <p className="text-[#D4A373] text-sm tracking-widest uppercase mt-1">{galleryItems[lightboxIndex].category}</p>
            </div>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); goNext(); }} 
            className="absolute right-4 md:right-12 z-50 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 backdrop-blur-md hidden sm:block" 
            aria-label="Next"
          >
            <ChevronRight size={32} />
          </button>

          {/* Mobile Swipe Areas */}
          <div className="absolute inset-y-0 left-0 w-1/4 z-40 sm:hidden" onClick={(e) => { e.stopPropagation(); goPrev(); }} />
          <div className="absolute inset-y-0 right-0 w-1/4 z-40 sm:hidden" onClick={(e) => { e.stopPropagation(); goNext(); }} />
        </div>
      )}
    </section>
  );
}
