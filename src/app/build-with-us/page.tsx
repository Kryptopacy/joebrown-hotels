import type { Metadata } from 'next';
import BuildWithUsClient from './BuildWithUsClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Build With Us | Pacy Labs',
  description: 'Partner with Pacy Labs to build high-performance digital platforms, AI automation, and modern web applications.',
};

export default function BuildWithUsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2C1E16] flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 pt-32 pb-16">
        <BuildWithUsClient />
      </main>
      <Footer />
    </div>
  );
}
