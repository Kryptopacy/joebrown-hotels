'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SorterPage() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [addToGallery, setAddToGallery] = useState(false);
  
  const fetchImages = async () => {
    try {
      const res = await fetch('/api/list-images');
      const data = await res.json();
      setImages(data.images || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const moveImage = async (filename: string, category: string) => {
    try {
      const res = await fetch('/api/sort-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, category, addToGallery })
      });
      if (res.ok) {
        setImages(prev => prev.filter(img => img !== filename));
        // Reset the gallery toggle for the next image
        setAddToGallery(false);
      } else {
        alert('Failed to move image');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to move image');
    }
  };

  if (loading) return <div className="p-8 text-white min-h-screen bg-[#1A0A02]">Loading images...</div>;
  if (images.length === 0) return <div className="p-8 text-white text-xl min-h-screen bg-[#1A0A02]">All images sorted! 🎉</div>;

  const image = images[0];

  const categories = [
    'exterior', 'reception', 'restaurant', 'lounge', 'rooftop', 'others',
    'rooms/room_unsorted', 'rooms/room_type_1', 'rooms/room_type_2', 'rooms/room_type_3', 'rooms/room_type_4'
  ];

  return (
    <div className="min-h-screen bg-[#1A0A02] text-[#E6CCB2] p-8 flex flex-col items-center">
      <h1 className="text-3xl font-serif text-white mb-2">Image Sorter</h1>
      <p className="mb-8 text-[#8D6E63]">{images.length} images remaining</p>
      
      <div className="flex gap-12 w-full max-w-6xl">
        <div className="flex-1 bg-black/40 rounded-2xl p-4 border border-[#5D3A1A]/30 flex flex-col items-center justify-center min-h-[600px]">
          <div className="relative w-full h-[500px]">
            <Image 
              src={`/JB/${image}`} 
              alt={image} 
              fill 
              className="object-contain"
            />
          </div>
          <p className="mt-4 text-sm font-mono text-[#D4A373]">{image}</p>
        </div>

        <div className="w-80 flex flex-col gap-4">
          
          <label className="flex items-center gap-3 p-4 bg-emerald-900/20 border border-emerald-700/50 rounded-xl cursor-pointer hover:bg-emerald-900/40 transition-colors">
            <input 
              type="checkbox" 
              checked={addToGallery}
              onChange={(e) => setAddToGallery(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded"
            />
            <span className="text-emerald-100 font-semibold">🌟 Also copy to Gallery</span>
          </label>

          <div className="h-px bg-white/10 my-2"></div>

          <h2 className="text-xl text-white font-semibold mb-2">Move To:</h2>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => moveImage(image, cat)}
              className="bg-[#2C1203] hover:bg-[#5D4037] border border-[#5D3A1A] text-white py-3 px-4 rounded-xl text-left transition-colors font-medium text-sm"
            >
              {cat}
            </button>
          ))}
          
          <div className="h-px bg-white/10 my-4"></div>
          
          <button 
            onClick={() => {
              setImages(prev => {
                const newArr = [...prev];
                newArr.push(newArr.shift()!);
                return newArr;
              });
              setAddToGallery(false);
            }}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 py-3 px-4 rounded-xl text-left transition-colors font-medium text-sm mt-4"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
