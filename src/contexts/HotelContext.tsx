'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type HotelData = {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  brand_color_primary: string;
  hero_image_url: string | null;
  logo_url: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  address?: string | null;
  whatsapp_number?: string | null;
  naira_per_loyalty_point?: number | null;
  loyalty_milestone_threshold?: number | null;
};

export type HotelSettings = {
  whatsapp_number: string | null;
  payment_enabled: boolean;
  contact_email: string | null;
};

interface HotelContextType {
  hotel: HotelData | null;
  settings: HotelSettings | null;
  isLoading: boolean;
}

const HotelContext = createContext<HotelContextType>({
  hotel: null,
  settings: null,
  isLoading: true,
});

export function HotelProvider({ children }: { children: React.ReactNode }) {
  const [hotel, setHotel] = useState<HotelData | null>(null);
  const [settings, setSettings] = useState<HotelSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // For this prototype, we're hardcoding 'joebrown' slug.
  // In a true multi-tenant SaaS, this comes from the subdomain.
  const HOTEL_SLUG = 'joebrown'; 

  useEffect(() => {
    async function loadHotelData() {
      try {
        const { data: hotelData, error: hotelError } = await supabase
          .from('hotels')
          .select('*')
          .eq('slug', HOTEL_SLUG)
          .maybeSingle();

        if (hotelError || !hotelData) {
          setHotel({
            id: 'joebrown-default-id',
            name: 'Joebrown Palace Hotels & Lounge',
            tagline: 'A Sanctuary of Refined Hospitality & Timeless Luxury',
            description: 'Experience curated comfort, gourmet dining, and bespoke concierge hospitality at Joebrown Palace Hotels & Lounge.',
            brand_color_primary: '#F59E0B',
            hero_image_url: null,
            logo_url: null,
            naira_per_loyalty_point: 1000,
            loyalty_milestone_threshold: 5000,
          });
          setSettings({
            whatsapp_number: '+2348000000000',
            payment_enabled: false,
            contact_email: 'concierge@joebrownhotels.com',
          });
          return;
        }
        
        setHotel(hotelData);

        // Load settings
        const { data: settingsData } = await supabase
          .from('site_settings')
          .select('*')
          .eq('hotel_id', hotelData.id);

        const parsedSettings: HotelSettings = {
          whatsapp_number: hotelData.whatsapp_number || '+2348000000000',
          payment_enabled: false,
          contact_email: null,
        };

        if (settingsData) {
          settingsData.forEach((s) => {
            if (s.setting_key === 'payment_enabled') {
              parsedSettings.payment_enabled = s.setting_value;
            }
            if (s.setting_key === 'contact_email') {
              parsedSettings.contact_email = s.setting_value.email;
            }
          });
        }
        setSettings(parsedSettings);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadHotelData();
  }, [supabase]);

  // Inject primary brand color immediately
  useEffect(() => {
    if (hotel?.brand_color_primary) {
      document.documentElement.style.setProperty('--color-gold', hotel.brand_color_primary);
    }
  }, [hotel?.brand_color_primary]);

  return (
    <HotelContext.Provider value={{ hotel, settings, isLoading }}>
      {children}
    </HotelContext.Provider>
  );
}

export const useHotel = () => useContext(HotelContext);
