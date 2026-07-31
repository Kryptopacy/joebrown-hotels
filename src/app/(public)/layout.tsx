import { HotelProvider } from '@/contexts/HotelContext';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <HotelProvider>
      {children}
    </HotelProvider>
  );
}
