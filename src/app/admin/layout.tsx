'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, BedDouble, UtensilsCrossed, Settings, QrCode, BookOpen, LogOut, Menu, X, Headset, Shield, ShoppingBag, BarChart3, Users, Bell, Image as ImageIcon } from 'lucide-react';
import AdminNotifications from '@/components/AdminNotifications';
import AdminAssistantWidget from '@/components/AdminAssistantWidget';

const ADMIN_LINKS = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'CRM', href: '/admin/crm', icon: Users },
  { name: 'Concierge', href: '/admin/concierge', icon: Bell },
  { name: 'Intercom Hub', href: '/admin/intercom', icon: Headset },
  { name: 'Staff Roles', href: '/admin/staff', icon: Shield },
  { name: 'Bookings', href: '/admin/bookings', icon: BookOpen },
  { name: 'Restaurant & Lounge', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Rooms', href: '/admin/rooms', icon: BedDouble },
  { name: 'Menu Items', href: '/admin/menu', icon: UtensilsCrossed },
  { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { name: 'QR Codes', href: '/admin/qr', icon: QrCode },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (pathname === '/admin/login' || pathname === '/admin/pending') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const SidebarContent = () => (
    <>
      <a href="/" target="_blank" rel="noopener noreferrer" className="block p-6 border-b border-white/10 flex items-center gap-3 relative hover:bg-[#38251a] bg-[#2c1b11] transition-colors group cursor-pointer" title="Open public site in new tab">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[60px] bg-[#D4A373]/10 blur-[30px] pointer-events-none rounded-full transition-all" />
        <div className="w-12 h-12 flex items-center justify-center shrink-0 rounded overflow-hidden">
          <Image src="/jb_logo_background.jpg" alt="Joebrown Logo" width={48} height={48} className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-serif text-white tracking-tight font-bold transition-colors">Joebrown</h2>
          <p className="text-[10px] text-[#D4A373] uppercase tracking-widest font-bold font-sans">Staff Portal</p>
        </div>
      </a>
      <nav className="flex-1 p-4 overflow-y-auto w-full">
        <ul className="space-y-1.5">
          {ADMIN_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all relative ${
                    isActive 
                      ? 'bg-[#D4A373]/10 text-[#D4A373] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.1)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-[#D4A373] before:rounded-r-full' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white font-medium'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#D4A373]' : ''} />
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-white/10 w-full relative">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold rounded-lg transition-colors text-sm"
        >
          <LogOut size={18} /> Logout Staff Session
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen text-white bg-[#0A0401]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed h-full z-40 transition-all bg-[#1A0A02] border-r border-white/10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full z-40 flex items-center justify-between p-4 shadow-md border-b border-white/10 bg-[#1A0A02]">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded overflow-hidden">
            <img src="/jb_logo_background.jpg" alt="Joebrown Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="font-serif text-white font-bold text-lg tracking-tight">Joebrown Portal</h2>
        </a>
        <div className="flex items-center gap-3">
          <AdminNotifications />
          <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-brown-100 hover:text-brown-400 p-1 focus:outline-none">
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="bg-slate-900/60 absolute inset-0 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}></div>
          <aside className="flex flex-col w-64 relative h-full shadow-2xl z-40 bg-[#1A0A02] border-r border-white/10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen bg-transparent min-w-0">
        {/* Desktop Top Nav (Floating) */}
        <div className="hidden md:flex justify-end p-6 absolute top-0 right-0 z-50">
          <AdminNotifications />
        </div>
        {/* Page Content */}
        <div className="pt-24 md:pt-4 p-6 md:p-10 flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Global Staff Assistant Widget */}
      <AdminAssistantWidget />
    </div>
  );
}
