import React, { Suspense } from 'react';
import MenuClient from '@/components/MenuClient';
import Navbar from '@/components/Navbar';
import WhatsAppButton from '@/components/WhatsAppButton';
import CustomerIntercom from '@/components/CustomerIntercom';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 3600;

export default async function MenuPage() {
  const supabase = await createClient();
  const { data: hotel } = await supabase.from('hotels').select('id').eq('slug', 'joebrown').maybeSingle();
  
  let categories: any[] = [];
  let items: any[] = [];
  
  if (hotel) {
    const [catRes, itemRes] = await Promise.all([
      supabase.from('menu_categories').select('*').eq('hotel_id', hotel.id).eq('is_active', true).order('display_order'),
      supabase.from('menu_items').select('*').eq('hotel_id', hotel.id).order('display_order')
    ]);
    
    categories = catRes.data || [];
    items = itemRes.data || [];
    

  }



  return (
    <main className="min-h-screen bg-[#0A0401] pb-24 text-white">
      <Navbar />
      <Suspense fallback={
        <div className="animate-pulse flex flex-col min-h-screen">
          <div className="w-full h-80 bg-[#1A0A02]"></div>
          <div className="container mx-auto max-w-5xl px-4 py-8">
            <div className="h-12 w-full max-w-xl mx-auto bg-white/5 rounded-full mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-[#1A0A02] rounded-3xl border border-white/5"></div>
              ))}
            </div>
          </div>
        </div>
      }>
        <MenuClient initialCategories={categories} initialItems={items} />
      </Suspense>
      <CustomerIntercom />
      <WhatsAppButton />
    </main>
  );
}
