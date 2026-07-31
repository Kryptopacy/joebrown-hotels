'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Star, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function FeedbackPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('general');
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comments.trim()) {
      setErrorMsg('Please provide your name and your feedback.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Get hotel ID for Joebrown
      const { data: hotelData } = await supabase
        .from('hotels')
        .select('id')
        .eq('slug', 'joebrown')
        .maybeSingle();

      const { error } = await supabase.from('feedback').insert({
        hotel_id: hotelData?.id || null,
        guest_name: name.trim(),
        guest_email: email.trim() || null,
        category,
        rating,
        comments: comments.trim(),
      });

      if (error) throw error;
      
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#2C1E16] flex flex-col justify-between">
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="bg-[#1A0A02] p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-[#5D3A1A]/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4A373] via-[#b45309] to-[#D4A373]" />
            <div className="w-20 h-20 bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-emerald-400" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#E6CCB2] mb-4">Thank You!</h1>
            <p className="text-[#8D6E63] mb-8">
              Your feedback is incredibly valuable to us. We constantly strive to improve, and your insights help us provide the best experience possible at Joebrown.
            </p>
            <Link 
              href="/"
              className="inline-block px-8 py-4 bg-[#3E2723] hover:bg-[#1A110B] text-white font-extrabold rounded-full text-[10px] uppercase tracking-[0.25em] transition-all shadow-lg"
            >
              Return Home
            </Link>
          </div>
        </main>
        <Footer hotelName="Joebrown Palace Hotel and Suites" hotelAddress="" hotelPhone="" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2C1E16] flex flex-col justify-between">
      {/* Header */}
      <section className="relative pt-32 pb-16 px-4 text-white border-b border-[#5D3A1A]/30 overflow-hidden bg-[#1A0A02]">
        <Image
          src="/images/lounge_texture.jpg"
          alt="Lounge Texture"
          fill
          priority
          sizes="100vw"
          className="object-cover z-0 scale-105 text-transparent brightness-50"
        />
        <div className="absolute inset-0 bg-[#1A0A02]/60 z-0" />
        <div className="container mx-auto relative max-w-3xl z-10 text-center">
          <span className="text-[#D4A373] text-xs font-extrabold uppercase tracking-[0.25em] mb-4 block">Share Your Experience</span>
          <h1 className="text-4xl md:text-5xl font-serif mb-4 font-bold text-white drop-shadow-md">Guest Feedback</h1>
          <p className="text-white/80 text-lg font-medium">We'd love to hear about your experience with us.</p>
        </div>
      </section>

      {/* Form Section */}
      <main className="flex-grow container mx-auto max-w-3xl px-4 py-12">
        <form onSubmit={handleSubmit} className="bg-[#1A0A02] p-6 md:p-10 rounded-3xl shadow-2xl border border-[#5D3A1A]/40 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4A373] via-[#b45309] to-[#D4A373]" />
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-800/50 rounded-xl flex items-start gap-3 text-red-400">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm font-semibold">{errorMsg}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Your Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Adebayo O."
                  className="w-full bg-[#0D0501] border border-[#5D3A1A] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="For follow-ups"
                  className="w-full bg-[#0D0501] border border-[#5D3A1A] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0D0501] border border-[#5D3A1A] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="general">General Experience</option>
                  <option value="staff">Staff & Service</option>
                  <option value="room">Hotel Room</option>
                  <option value="kitchen">Restaurant & Lounge</option>
                  <option value="business">Business & Corporate</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">Rating</label>
                <div className="flex items-center gap-2 h-[48px]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={star <= rating ? "fill-brown-400 text-brown-500" : "text-brown-200 fill-transparent"}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-[#D4A373] font-bold px-1 flex items-center justify-between">
                  <span>Your Comments *</span>
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Tell us what you loved or how we can improve..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0D0501] border border-[#5D3A1A] rounded-xl text-sm font-semibold text-white placeholder:text-[#8D6E63]/60 focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-colors resize-none"
                />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#3E2723] hover:bg-[#1A110B] disabled:bg-[#3E2723]/50 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-[0.25em] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} /> Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer hotelName="Joebrown Palace Hotel and Suites" hotelAddress="" hotelPhone="" />
    </div>
  );
}
