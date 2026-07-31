'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface RoomGalleryProps {
  images: string[];
  roomName: string;
}

export default function RoomGallery({ images, roomName }: RoomGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % images.length);
  }, [lightboxIndex, images.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
  }, [lightboxIndex, images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, goNext, goPrev]);

  if (!images || images.length <= 1) return null;

  const galleryImages = images.slice(1);

  return (
    <>
      <div>
        <h2 className="text-2xl font-serif mb-4 text-slate-900 pb-3 border-b border-brown-200 font-bold">Room Photos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {galleryImages.map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative aspect-[4/3] rounded-xl overflow-hidden border border-brown-200 shadow-sm cursor-pointer group"
              onClick={() => openLightbox(idx + 1)}
            >
              <Image
                src={imgUrl}
                alt={`${roomName} — photo ${idx + 2}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105 text-transparent"
              />
              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-all duration-300 flex items-center justify-center">
                <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button onClick={closeLightbox} className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" aria-label="Close">
            <X size={22} />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
          {images.length > 1 && (
            <button onClick={e => { e.stopPropagation(); goPrev(); }} className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" aria-label="Previous">
              <ChevronLeft size={24} />
            </button>
          )}
          <div
            className="relative w-full max-w-4xl mx-20 aspect-[4/3] rounded-xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={`${roomName} — photo ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>
          {images.length > 1 && (
            <button onClick={e => { e.stopPropagation(); goNext(); }} className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" aria-label="Next">
              <ChevronRight size={24} />
            </button>
          )}
          {images.length > 2 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4">
              {images.map((img, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`relative w-12 h-9 rounded overflow-hidden border-2 transition-all shrink-0 ${i === lightboxIndex ? 'border-brown-400 scale-110' : 'border-white/20 opacity-60 hover:opacity-100'}`}>
                  <Image src={img} alt="" fill className="object-cover text-transparent" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
