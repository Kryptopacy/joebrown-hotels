'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const formatTime = (ts: string) => {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(ts));
};

export default function AdminConciergePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const supabase = createClient();

  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1); // C#6
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: hotelData } = await supabase.from('hotels').select('id').eq('slug', 'joebrown').maybeSingle();
    if (hotelData) {
      setHotelId(hotelData.id);
      fetchRequests(hotelData.id);
    }
  };

  const fetchRequests = async (hid: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('hotel_id', hid)
      .order('created_at', { ascending: false });

    if (data) setRequests(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!hotelId) return;
    const channel = supabase
      .channel('admin_concierge')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'service_requests', filter: `hotel_id=eq.${hotelId}` },
        (payload) => {
          playChime();
          toast.success(`New request from Room ${payload.new.room_number}`, { icon: '🛎️', duration: 8000 });
          fetchRequests(hotelId);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [hotelId, supabase]);

  const markFulfilled = async (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'fulfilled' } : r));
    const { error } = await supabase.from('service_requests').update({ status: 'fulfilled' }).eq('id', id);
    if (!error) toast.success('Marked as fulfilled');
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-8">
        <Bell size={28} className="text-[#D4A373]" />
        <h1 className="text-3xl font-serif text-white font-bold">Concierge Requests</h1>
      </div>

      <div className="bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm overflow-hidden min-h-[500px]">
        {isLoading ? (
          <div className="divide-y divide-white/5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 shrink-0"></div>
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="h-5 bg-white/10 rounded w-32"></div>
                    <div className="h-3 bg-white/5 rounded w-48"></div>
                  </div>
                </div>
                <div className="h-10 bg-white/10 rounded-xl w-40 hidden sm:block"></div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-white/50 font-medium">No service requests yet.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {requests.map((req) => (
              <div key={req.id} className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${req.status === 'fulfilled' ? 'bg-white/5 opacity-70' : 'hover:bg-white/5'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${req.status === 'fulfilled' ? 'bg--500/20 text-white/40' : 'bg-[#1A0A02] border border-[#D4A373]/30 text-[#D4A373]'}`}>
                    {req.room_number}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg capitalize">{req.request_type.replace('_', ' ')}</h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-white/50 mt-1">
                      <Clock size={12} /> {formatTime(req.created_at)}
                      <span className="mx-1">•</span>
                      <span className={`px-2 py-0.5 rounded-full ${req.status === 'fulfilled' ? 'bg--500/200/20 text-emerald-300' : 'bg-[#1A0A02] border border-[#D4A373]/30 text-[#D4A373]'} capitalize`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                {req.status === 'pending' && (
                  <button 
                    onClick={() => markFulfilled(req.id)}
                    className="self-start sm:self-center bg-[#D4A373] text-[#1A0A02] hover:bg-[#b45309] font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 text-sm border border-[#D4A373]/30"
                  >
                    <CheckCircle size={16} /> Mark Fulfilled
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
