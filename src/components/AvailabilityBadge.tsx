'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useHotel } from '@/contexts/HotelContext';

interface Props {
  roomId: string;
  initialAvailability: boolean;
}

export default function AvailabilityBadge({ roomId, initialAvailability }: Props) {
  const [isAvailable, setIsAvailable] = useState(initialAvailability);
  const { hotel } = useHotel();
  const supabase = createClient();

  useEffect(() => {
    if (!hotel) return;

    // Listen to changes on this specific room
    const channel = supabase
      .channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setIsAvailable(payload.new.is_available);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, hotel, supabase]);

  if (isAvailable) {
    return (
      <div className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 text-xs uppercase tracking-wider rounded-full backdrop-blur-md inline-block">
        Available
      </div>
    );
  }

  return (
    <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 text-xs uppercase tracking-wider rounded-full backdrop-blur-md inline-block">
      Unavailable
    </div>
  );
}
