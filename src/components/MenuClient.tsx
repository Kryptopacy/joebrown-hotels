'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useHotel } from '@/contexts/HotelContext';
import {
  UtensilsCrossed, Wine, Search, ShoppingCart, Plus, Minus, X, Trash2,
  CreditCard, Upload, CheckCircle, Copy, ChevronRight
} from 'lucide-react';
import Footer from '@/components/Footer';

interface CartItem {
  menuItem: any;
  quantity: number;
}

interface MenuClientProps {
  initialCategories: any[];
  initialItems: any[];
}

export default function MenuClient({ initialCategories, initialItems }: MenuClientProps) {
  const [items, setItems] = useState(initialItems);
  const [typeFilter, setTypeFilter] = useState<'food' | 'drink'>('food');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string } | null>(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Order form
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [roomOrTable, setRoomOrTable] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [orderStream, setOrderStream] = useState<'restaurant' | 'lounge'>('restaurant');

  const searchParams = useSearchParams();
  const roomNumber = searchParams.get('room');
  const tableNumber = searchParams.get('table');
  const { hotel } = useHotel();
  const supabase = createClient();

  // Pre-fill room/table from URL params
  useEffect(() => {
    if (tableNumber) {
      setRoomOrTable(`Table ${tableNumber}`);
      setOrderStream('restaurant');
    }
    else if (roomNumber) {
      setRoomOrTable(`Room ${roomNumber}`);
      setOrderStream('restaurant');
    }
  }, [tableNumber, roomNumber]);

  // Auto-detect stream based on user input
  useEffect(() => {
    const loc = roomOrTable.toLowerCase();
    if (loc.includes('lounge') || loc.includes('bar') || loc.includes('sofa') || loc.includes('pool')) {
      setOrderStream('lounge');
    } else if (loc.includes('table') || loc.includes('restaurant') || loc.includes('din') || loc.includes('room')) {
      setOrderStream('restaurant');
    }
  }, [roomOrTable]);

  // Realtime menu item updates
  useEffect(() => {
    if (!hotel) return;
    const channel = supabase
      .channel('menu_items_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'menu_items', filter: `hotel_id=eq.${hotel.id}` },
        (payload) => {
          setItems((prev) =>
            prev.map(i => i.id === payload.new.id ? { ...i, is_available: payload.new.is_available } : i)
          );
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [hotel, supabase]);

  const filteredCategories = initialCategories.filter(c => c.type === typeFilter);
  const displayedItems = items.filter(i => {
    const isRightType = filteredCategories.some(c => c.id === i.category_id);
    const isRightCat = activeCategory === 'all' || i.category_id === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return isRightType && isRightCat && matchesSearch;
  });

  // Cart helpers
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);
  const cartTotal = cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItem: item, quantity: 1 }];
    });
    setSelectedItem(null);
  };

  const changeQty = (itemId: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(c => c.menuItem.id === itemId ? { ...c, quantity: c.quantity + delta } : c);
      return updated.filter(c => c.quantity > 0);
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== itemId));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingScreenshot(true);
    try {
      const filename = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('payment-screenshots')
        .upload(filename, file);
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('payment-screenshots').getPublicUrl(data.path);
        setScreenshotUrl(urlData.publicUrl);
      }
    } catch (_) {
      // Bucket may not exist — fail gracefully
    }
    setUploadingScreenshot(false);
  };

  const handleConfirmOrder = async () => {
    if (!guestName.trim()) return;
    setIsSubmitting(true);
    try {
      const orderNumber = 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          hotel_id: hotel?.id || null,
          order_number: orderNumber,
          guest_name: guestName.trim(),
          room_or_table: roomOrTable.trim() || null,
          status: 'pending',
          payment_status: screenshotUrl ? 'transfer_submitted' : 'unpaid',
          payment_method: 'bank_transfer',
          total_amount: cartTotal,
          payment_screenshot_url: screenshotUrl || null,
          special_instructions: specialInstructions.trim() || null,
          stream: orderStream,
        })
        .select()
        .maybeSingle();

      if (orderError) throw orderError;

      const orderItems = cart.map(c => ({
        order_id: orderData.id,
        menu_item_id: c.menuItem.id,
        item_name: c.menuItem.name,
        item_price: c.menuItem.price,
        quantity: c.quantity,
      }));

      await supabase.from('order_items').insert(orderItems);

      // Send Order Receipt Email
      if (guestEmail.trim()) {
        try {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'order',
              to: guestEmail.trim(),
              payload: {
                guestName: guestName.trim(),
                orderNumber: orderData?.order_number || orderNumber,
                roomOrTable: roomOrTable.trim(),
                items: orderItems.map(i => ({ name: i.item_name, quantity: i.quantity, price: i.item_price })),
                totalAmount: cartTotal,
              }
            }),
          });
        } catch (err) {
          console.error('Failed to send kitchen order email', err);
        }
      }

      // Upsert Guest (CRM)
      if (guestPhone.trim()) {
        const { data: existingGuest } = await supabase
          .from('guests')
          .select('id, total_spend, visit_count, loyalty_points')
          .eq('phone_number', guestPhone.trim())
          .maybeSingle();

        // Dynamic Loyalty Settings
        const nairaPerPoint = hotel?.naira_per_loyalty_point || 1000;
        const milestoneThreshold = hotel?.loyalty_milestone_threshold || 5000;

        const earnedPoints = Math.floor(cartTotal / nairaPerPoint); 

        if (existingGuest) {
          const newPoints = Number(existingGuest.loyalty_points || 0) + earnedPoints;
          await supabase.from('guests').update({
            total_spend: Number(existingGuest.total_spend || 0) + cartTotal,
            visit_count: Number(existingGuest.visit_count || 0) + 1,
            loyalty_points: newPoints,
            name: guestName.trim()
          }).eq('id', existingGuest.id);

          // Loyalty Milestone Check
          if (newPoints >= milestoneThreshold && Number(existingGuest.loyalty_points || 0) < milestoneThreshold && guestEmail.trim()) {
            fetch('/api/email/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'loyalty_milestone',
                to: guestEmail.trim(),
                payload: { guestName: guestName.trim(), points: newPoints }
              })
            }).catch(console.error);
          }
        } else {
          await supabase.from('guests').insert({
            hotel_id: hotel?.id || null,
            phone_number: guestPhone.trim(),
            name: guestName.trim(),
            total_spend: cartTotal,
            visit_count: 1,
            loyalty_points: earnedPoints
          });

          // Loyalty Milestone Check for new guests
          if (earnedPoints >= milestoneThreshold && guestEmail.trim()) {
            fetch('/api/email/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'loyalty_milestone',
                to: guestEmail.trim(),
                payload: { guestName: guestName.trim(), points: earnedPoints }
              })
            }).catch(console.error);
          }
        }
      }

      // Trigger Web Push Notification to Admin Dashboard
      try {
        await fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `New Order: ${orderNumber}`,
            body: `${guestName} (${roomOrTable || 'Walk-in'}): ₦${cartTotal.toLocaleString()}`,
            url: `/admin/orders`
          })
        });
      } catch (err) {
        console.error('Failed to dispatch push notification', err);
      }

      setOrderSuccess({ orderNumber: orderData.order_number || orderNumber });
      setCart([]);
      setGuestName('');
      setGuestPhone('');
      setGuestEmail('');
      setSpecialInstructions('');
      setScreenshotUrl('');
    } catch (err) {
      console.error('Order error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bankName = hotel?.bank_name || 'First Bank Nigeria';
  const bankAccountNumber = hotel?.bank_account_number || '0123456789';
  const bankAccountName = hotel?.bank_account_name || 'Joebrown Palace Hotel and Suites';

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2C1E16] flex flex-col justify-between overflow-x-hidden">

      {/* HERO HEADER */}
      <section className="relative pt-40 pb-20 px-4 text-white border-b-2 border-[#5D3A1A]/50 overflow-hidden">
        <Image
          src={typeFilter === 'drink' ? "/JB/gallery/P1160349.JPG" : "/JB/gallery/restaurant_brighter.JPG"}
          alt="Lounge Texture Header Backdrop"
          fill
          priority
          className="object-cover z-0 scale-105"
        />
        {/* Cinematic dark luxury overlay to let the image shine sharply */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A02] via-black/40 to-black/20 z-0" />
        <div className="container mx-auto relative max-w-5xl z-10">
          {tableNumber && (
            <p className="text-xs font-mono font-bold text-brown-200 mb-3">
              🪑 Lounge Table Service — Table #{tableNumber}
            </p>
          )}
          {roomNumber && (
            <p className="text-xs font-mono font-bold text-brown-200 mb-3">
              🛎 Room Service — Room #{roomNumber}
            </p>
          )}
          <h1 className="text-4xl md:text-6xl font-serif mb-3 text-white font-extrabold drop-shadow-lg">Bar &amp; Kitchen Menu</h1>
          <p className="text-white/90 max-w-2xl text-base sm:text-lg font-semibold drop-shadow-md">
            Freshly prepared Nigerian meals, pepper soup, grilled specialties, light snacks, alongside ice-cold beers, fine wines, cognac, and handcrafted cocktails.
          </p>
        </div>
      </section>

      {/* SEARCH BAR & TYPE TOGGLE */}
      <section className="sticky top-16 md:top-20 z-40 bg-[#1A0A02]/95 backdrop-blur-md border-b-2 border-[#5D3A1A]/50/80 py-4 shadow-md">
        <div className="container mx-auto max-w-5xl px-4 space-y-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A373]" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meals, pepper soup, grills, cocktails, beers..."
              className="w-full pl-11 pr-4 py-3 bg-[#2C1203]/60 text-[#E6CCB2] border-2 border-[#5D3A1A]/50 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#D4A373] shadow-inner"
            />
          </div>
          <div className="flex justify-center gap-10">
            <button
              onClick={() => { setTypeFilter('food'); setActiveCategory('all'); }}
              className={`flex items-center gap-2 text-xl font-serif pb-2 border-b-2 font-bold transition-colors ${typeFilter === 'food' ? 'text-[#D4A373] border-[#D4A373]' : 'text-[#8D6E63] border-transparent hover:text-[#E6CCB2]'}`}
            >
              <UtensilsCrossed size={20} /> Kitchen &amp; Meals
            </button>
            <button
              onClick={() => { setTypeFilter('drink'); setActiveCategory('all'); }}
              className={`flex items-center gap-2 text-xl font-serif pb-2 border-b-2 font-bold transition-colors ${typeFilter === 'drink' ? 'text-[#D4A373] border-[#D4A373]' : 'text-[#8D6E63] border-transparent hover:text-[#E6CCB2]'}`}
            >
              <Wine size={20} /> Drinks &amp; Bar
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORY FILTER ROW */}
      <section className="bg-[#1A0A02] border-b border-[#5D3A1A]/30">
        <div className="container mx-auto max-w-5xl py-3 flex overflow-x-auto hide-scrollbar gap-3 px-4">
          <button
            onClick={() => setActiveCategory('all')}
            className={`whitespace-nowrap px-4 py-1.5 text-xs font-bold transition-colors ${activeCategory === 'all' ? 'bg-[#3E2723] text-white border-[#3E2723]' : 'bg-[#2C1203]/60 text-[#D4A373] hover:bg-[#3E2723]/60 border border-[#5D3A1A]/50'}`}
          >
            All Items
          </button>
          {filteredCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-1.5 text-xs font-bold transition-colors ${activeCategory === cat.id ? 'bg-[#3E2723] text-white border-[#3E2723]' : 'bg-[#2C1203]/60 text-[#D4A373] hover:bg-[#3E2723]/60 border border-[#5D3A1A]/50'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* ITEMS GRID */}
      <section className="container mx-auto max-w-5xl my-10 px-4 flex-1 pb-28">
        {displayedItems.length === 0 ? (
          <div className="text-center py-20 text-[#8D6E63]/80 border-2 border-[#5D3A1A]/50 rounded-2xl bg-[#2C1203]/60">
            No items match your search &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedItems.slice(0, visibleCount).map((item: any) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`flex gap-4 p-4 rounded-2xl border-2 transition-all text-left w-full ${
                  item.is_available
                    ? 'bg-[#2C1203]/60 border-[#5D3A1A]/50 hover:border-brown-500 shadow-md hover:shadow-xl cursor-pointer'
                    : 'bg-[#1A0A02]/50/70 border-[#5D3A1A]/30 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-[#2C1203]/40 rounded-xl overflow-hidden relative border border-[#5D3A1A]/30">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover text-transparent" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#5D3A1A] bg-[#2C1203]/40">
                      <UtensilsCrossed size={20} className="opacity-40" />
                    </div>
                  )}
                  {!item.is_available && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-center p-1">
                      <span className="text-[10px] uppercase font-bold text-red-100">Out of Stock</span>
                    </div>
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 flex flex-col pt-1">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className={`font-serif text-lg leading-tight font-semibold ${item.is_available ? 'text-[#E6CCB2]' : 'text-[#5D3A1A] line-through'}`}>
                      {item.name}
                    </h4>
                    <span className="font-serif text-[#D4A373] font-bold whitespace-nowrap">₦{Number(item.price).toLocaleString()}</span>
                  </div>
                  <p className="text-[#8D6E63] text-xs line-clamp-2 font-medium leading-relaxed flex-grow">{item.description}</p>
                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] text-[#E6CCB2] font-bold">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {displayedItems.length > visibleCount && (
          <div className="flex justify-center pt-8">
            <button 
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="px-8 py-3 bg-[#1A0A02] border-2 border-[#5D3A1A]/50 text-[#E6CCB2] font-bold rounded-xl shadow-sm hover:bg-[#1A0A02]/50 hover:shadow-md transition-all"
            >
              Load More Items
            </button>
          </div>
        )}
      </section>

      {/* FLOATING CART BUTTON */}
      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-brown-700 hover:bg-[#3E2723] text-white border-[#3E2723] font-bold px-5 py-3.5 rounded-2xl shadow-2xl shadow-brown-900/40 transition-all active:scale-95"
        >
          <ShoppingCart size={20} />
          <span>View Order</span>
          <span className="bg-[#1A0A02] text-[#D4A373] rounded-full w-6 h-6 flex items-center justify-center text-xs font-black ml-1">
            {cartCount}
          </span>
        </button>
      )}

      {/* ITEM DETAIL MODAL */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[#2C1203]/60 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {selectedItem.image_url && (
              <div className="relative h-52 w-full overflow-hidden rounded-t-2xl">
                <Image src={selectedItem.image_url} alt={selectedItem.name} fill className="object-cover text-transparent" />
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-1">
                <h2 className="text-2xl font-serif font-bold text-[#E6CCB2] leading-tight">{selectedItem.name}</h2>
                <button onClick={() => setSelectedItem(null)} className="text-[#5D3A1A] hover:text-[#E6CCB2] ml-2 flex-shrink-0 p-1">
                  <X size={22} />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-2xl font-serif font-black text-[#D4A373]">₦{Number(selectedItem.price).toLocaleString()}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${selectedItem.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                  {selectedItem.is_available ? 'Available' : 'Out of Stock'}
                </span>
              </div>
              {selectedItem.description && (
                <p className="text-[#8D6E63] text-sm leading-relaxed mb-4">{selectedItem.description}</p>
              )}
              {selectedItem.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {selectedItem.tags.map((tag: string) => (
                    <span key={tag} className="text-[11px] text-[#E6CCB2] font-bold bg-[#2C1203]/40 px-2 py-0.5 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}
              <button
                onClick={() => addToCart(selectedItem)}
                disabled={!selectedItem.is_available}
                className="w-full py-3.5 bg-brown-700 hover:bg-[#D4A373] disabled:bg-brown-200 disabled:text-brown-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add to Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setCartOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-[#2C1203]/60 h-full shadow-2xl flex flex-col overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#5D3A1A]/30 sticky top-0 bg-[#2C1203]/60 z-10">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-[#D4A373]" />
                <h2 className="text-xl font-serif font-bold text-[#E6CCB2]">Your Order</h2>
              </div>
              <button onClick={() => setCartOpen(false)} className="text-[#5D3A1A] hover:text-[#E6CCB2] p-1"><X size={22} /></button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-[#5D3A1A]">
                  <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Your cart is empty</p>
                </div>
              ) : (
                <>
                  {cart.map(c => (
                    <div key={c.menuItem.id} className="flex items-center gap-3 bg-[#1A0A02] border border-[#5D3A1A]/30 rounded-xl p-3">
                      <div className="flex-1">
                        <p className="font-serif font-semibold text-[#E6CCB2] text-sm">{c.menuItem.name}</p>
                        <p className="text-[#D4A373] font-bold text-sm">₦{(Number(c.menuItem.price) * c.quantity).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => changeQty(c.menuItem.id, -1)} className="w-7 h-7 rounded-full border border-[#5D3A1A]/50 flex items-center justify-center text-[#D4A373] hover:bg-[#3E2723]/60">
                          <Minus size={14} />
                        </button>
                        <span className="font-bold w-5 text-center text-sm">{c.quantity}</span>
                        <button onClick={() => changeQty(c.menuItem.id, +1)} className="w-7 h-7 rounded-full border border-[#5D3A1A]/50 flex items-center justify-center text-[#D4A373] hover:bg-[#3E2723]/60">
                          <Plus size={14} />
                        </button>
                        <button onClick={() => removeFromCart(c.menuItem.id)} className="w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 ml-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Subtotal */}
                  <div className="flex justify-between items-center bg-[#1A0A02]/50 border border-[#5D3A1A]/30 rounded-xl p-4">
                    <span className="font-bold text-[#8D6E63]">Subtotal</span>
                    <span className="font-serif font-black text-xl text-[#D4A373]">₦{cartTotal.toLocaleString()}</span>
                  </div>

                  {/* Order Form */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-1">Your Name *</label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={e => setGuestName(e.target.value)}
                        placeholder="e.g. Adebayo Okonkwo"
                        className="w-full px-4 py-3 border-2 border-[#5D3A1A]/50 rounded-xl bg-[#1A0A02] text-[#E6CCB2] text-sm font-medium focus:outline-none focus:border-[#D4A373]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-1">WhatsApp / Phone *</label>
                      <input
                        type="text"
                        value={guestPhone}
                        onChange={e => setGuestPhone(e.target.value)}
                        placeholder="e.g. +234 800 000 0000"
                        className="w-full px-4 py-3 border-2 border-[#5D3A1A]/50 rounded-xl bg-[#1A0A02] text-[#E6CCB2] text-sm font-medium focus:outline-none focus:border-[#D4A373]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-1">Email (Optional)</label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={e => setGuestEmail(e.target.value)}
                        placeholder="For digital receipt"
                        className="w-full px-4 py-3 border-2 border-[#5D3A1A]/50 rounded-xl bg-[#1A0A02] text-[#E6CCB2] text-sm font-medium focus:outline-none focus:border-[#D4A373]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-1">Room / Table</label>
                      <input
                        type="text"
                        value={roomOrTable}
                        onChange={e => setRoomOrTable(e.target.value)}
                        placeholder="e.g. Table 5 / Room 12 / Lounge Sofa"
                        className="w-full px-4 py-3 border-2 border-[#5D3A1A]/50 rounded-xl bg-[#1A0A02] text-[#E6CCB2] text-sm font-medium focus:outline-none focus:border-[#D4A373]"
                      />
                      <p className="text-xs text-[#8D6E63] mt-1 ml-1">Leave blank for walk-in / takeaway</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-1">Order Stream</label>
                      <div className="flex bg-[#1A0A02] border-2 border-[#5D3A1A]/50 rounded-xl overflow-hidden p-1">
                        <button
                          type="button"
                          onClick={() => setOrderStream('restaurant')}
                          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                            orderStream === 'restaurant'
                              ? 'bg-[#D4A373] text-[#1A0A02] shadow-sm'
                              : 'text-[#8D6E63] hover:text-[#E6CCB2]'
                          }`}
                        >
                          Restaurant
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderStream('lounge')}
                          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                            orderStream === 'lounge'
                              ? 'bg-[#D4A373] text-[#1A0A02] shadow-sm'
                              : 'text-[#8D6E63] hover:text-[#E6CCB2]'
                          }`}
                        >
                          Lounge
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-1">Special Instructions</label>
                      <textarea
                        value={specialInstructions}
                        onChange={e => setSpecialInstructions(e.target.value)}
                        placeholder="Allergies, spice level, extra napkins..."
                        rows={2}
                        className="w-full px-4 py-3 border-2 border-[#5D3A1A]/50 rounded-xl bg-[#1A0A02] text-[#E6CCB2] text-sm font-medium focus:outline-none focus:border-[#D4A373] resize-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Drawer Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-[#5D3A1A]/30 sticky bottom-0 bg-[#2C1203]/60">
                <button
                  onClick={() => {
                    if (!guestName.trim()) { alert('Please enter your name to proceed.'); return; }
                    if (!guestPhone.trim()) { alert('Please enter your phone number to proceed.'); return; }
                    setCartOpen(false);
                    setPaymentOpen(true);
                  }}
                  className="w-full py-4 bg-brown-700 hover:bg-[#3E2723] text-white border-[#3E2723] font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-base shadow-lg shadow-brown-900/20"
                >
                  <CreditCard size={18} /> Proceed to Payment
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {paymentOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
          onClick={() => { if (!orderSuccess) setPaymentOpen(false); }}
        >
          <div
            className="bg-[#2C1203]/60 rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {orderSuccess ? (
              /* SUCCESS STATE */
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={36} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-[#E6CCB2] mb-2">Order Placed! 🎉</h2>
                <p className="text-[#8D6E63]/80 text-sm mb-4">Your order has been received. We're preparing it now.</p>
                <div className="bg-[#1A0A02]/50 border-2 border-[#5D3A1A]/50 rounded-xl px-6 py-4 mb-6 inline-block">
                  <p className="text-xs text-[#D4A373] font-bold uppercase tracking-wider mb-1">Order Number</p>
                  <p className="text-3xl font-serif font-black text-[#D4A373]">{orderSuccess.orderNumber}</p>
                </div>
                <div className="space-y-3">
                  <a
                    href={`/orders/${orderSuccess.orderNumber}`}
                    className="block w-full py-3.5 bg-brown-700 hover:bg-[#3E2723] text-white border-[#3E2723] font-bold rounded-xl transition-colors"
                  >
                    Track My Order →
                  </a>
                  <button
                    onClick={() => { setOrderSuccess(null); setPaymentOpen(false); }}
                    className="block w-full py-3 border border-[#5D3A1A]/50 text-[#D4A373] font-semibold rounded-xl hover:bg-[#1A0A02]/50 transition-colors"
                  >
                    Back to Menu
                  </button>
                </div>
              </div>
            ) : (
              /* PAYMENT FORM */
              <>
                <div className="flex items-center justify-between p-5 border-b border-[#5D3A1A]/30">
                  <h2 className="text-xl font-serif font-bold text-[#E6CCB2] flex items-center gap-2">
                    <CreditCard size={20} className="text-[#D4A373]" /> Payment
                  </h2>
                  <button onClick={() => setPaymentOpen(false)} className="text-[#5D3A1A] hover:text-[#E6CCB2] p-1"><X size={22} /></button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Order Summary */}
                  <div className="bg-[#1A0A02] border border-[#5D3A1A]/30 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-[#8D6E63] uppercase tracking-wider mb-3">Order Summary</h3>
                    <div className="space-y-2">
                      {cart.map(c => (
                        <div key={c.menuItem.id} className="flex justify-between text-sm">
                          <span className="text-[#8D6E63]">{c.menuItem.name} <span className="text-[#5D3A1A]">×{c.quantity}</span></span>
                          <span className="font-semibold text-[#E6CCB2]">₦{(Number(c.menuItem.price) * c.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-brown-100">
                      <span className="font-bold text-[#E6CCB2]">Total</span>
                      <span className="text-2xl font-serif font-black text-[#D4A373]">₦{cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Bank Transfer Section */}
                  <div className="bg-[#1A0A02]/50 border-2 border-brown-400 rounded-xl p-5">
                    <h3 className="font-serif font-bold text-[#E6CCB2] text-lg mb-4 flex items-center gap-2">
                      🏦 Pay via Bank Transfer
                    </h3>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center bg-[#1A0A02] rounded-lg px-4 py-2.5 border border-[#5D3A1A]/30">
                        <div>
                          <p className="text-[10px] text-[#D4A373] font-bold uppercase tracking-wider">Bank</p>
                          <p className="text-[#E6CCB2] font-semibold text-sm">{bankName}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-[#1A0A02] rounded-lg px-4 py-2.5 border border-[#5D3A1A]/30">
                        <div>
                          <p className="text-[10px] text-[#D4A373] font-bold uppercase tracking-wider">Account Number</p>
                          <p className="text-[#E6CCB2] font-black text-xl tracking-widest">{bankAccountNumber}</p>
                        </div>
                        <button
                          onClick={() => handleCopy(bankAccountNumber)}
                          className="text-brown-600 hover:text-[#D4A373] p-1.5 hover:bg-[#3E2723]/60 rounded-lg transition-colors"
                        >
                          {copied ? <CheckCircle size={18} className="text-emerald-600" /> : <Copy size={18} />}
                        </button>
                      </div>
                      <div className="flex justify-between items-center bg-[#1A0A02] rounded-lg px-4 py-2.5 border border-[#5D3A1A]/30">
                        <div>
                          <p className="text-[10px] text-[#D4A373] font-bold uppercase tracking-wider">Account Name</p>
                          <p className="text-[#E6CCB2] font-semibold text-sm">{bankAccountName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center bg-brown-700 text-white rounded-xl py-3 mb-4">
                      <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Amount to Transfer</p>
                      <p className="text-3xl font-serif font-black">₦{cartTotal.toLocaleString()}</p>
                    </div>

                    {/* Screenshot Upload */}
                    <div>
                      <label className="block text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-2">
                        Upload Payment Screenshot (Optional)
                      </label>
                      <label className="flex items-center gap-3 border-2 border-dashed border-[#5D3A1A]/50 rounded-xl p-4 cursor-pointer hover:bg-[#1A0A02]/50 transition-colors">
                        <Upload size={20} className="text-brown-600 flex-shrink-0" />
                        <div>
                          {uploadingScreenshot ? (
                            <span className="text-sm text-[#D4A373] font-semibold">Uploading...</span>
                          ) : screenshotUrl ? (
                            <span className="text-sm text-emerald-700 font-semibold flex items-center gap-1"><CheckCircle size={14} /> Screenshot uploaded!</span>
                          ) : (
                            <span className="text-sm text-[#8D6E63]/80 font-medium">Click to upload receipt photo</span>
                          )}
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotUpload} />
                      </label>
                    </div>
                  </div>

                  {/* Future Payment Gateways */}
                  <div>
                    <p className="text-xs text-[#8D6E63] font-medium mb-2 uppercase tracking-wider">Other Payment Methods</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button disabled className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-[#5D3A1A] rounded-xl font-semibold text-sm border border-slate-200 cursor-not-allowed">
                        💳 Paystack <span className="text-[10px] ml-1">(Soon)</span>
                      </button>
                      <button disabled className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-[#5D3A1A] rounded-xl font-semibold text-sm border border-slate-200 cursor-not-allowed">
                        💳 Bachs <span className="text-[10px] ml-1">(Soon)</span>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Order Button */}
                  <button
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-brown-700 hover:bg-[#D4A373] disabled:bg-brown-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-base shadow-lg shadow-brown-900/20"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} /> I've Transferred — Confirm Order
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Footer
        hotelName={hotel?.name || 'Joebrown Palace Hotel and Suites'}
        hotelAddress={hotel?.address || '4, Goodness Avenue, Ore Ofe Estate, off Akala Express, Lagos, Lagos State, Nigeria'}
        hotelPhone={hotel?.whatsapp_number || '+234 800 joebrown'}
      />
    </div>
  );
}
