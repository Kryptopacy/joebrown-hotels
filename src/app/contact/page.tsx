import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import CustomerIntercom from '@/components/CustomerIntercom';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const hotelName = 'Joebrown Palace Hotel and Suites';
  const hotelAddress = '4, Goodness Avenue, Ore Ofe Estate, off Akala Express, Lagos, Lagos State, Nigeria';
  const hotelPhone = '+234 800 joebrown';

  return (
    <main className="min-h-screen relative text-white flex flex-col justify-between overflow-x-hidden bg-[#0A0401]">
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: "url('/images/wellness_texture.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
      <div className="fixed inset-0 z-0 bg-black/60 pointer-events-none" />
      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        <Navbar />

        {/* ELEGANT HERO HEADER CARD OVER WELLNESS TEXTURE (NO BADGE PILLS) */}
        <section className="pt-36 pb-8 px-4 md:px-8 relative overflow-hidden">
          <div className="container mx-auto max-w-5xl relative z-10 p-8 md:p-12 rounded-3xl bg-[#1A0A02] border border-[#5D3A1A]/40 shadow-2xl text-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D4A373] via-[#b45309] to-[#D4A373]" />
            <h1 className="text-4xl sm:text-6xl font-serif text-[#E6CCB2] mb-4 font-extrabold tracking-tight">Connect with Joebrown</h1>
            <p className="text-[#8D6E63] max-w-2xl mx-auto text-base sm:text-lg font-semibold leading-relaxed">
              Reach out to our front desk team for room reservations, restaurant & lounge table bookings, private event hosting, or general guest inquiries in Lagos.
            </p>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl my-8 px-4 md:px-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Details & Form */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a href="https://maps.google.com/?q=4,+Goodness+Avenue,+Ore+Ofe+Estate,+off+Akala+Express,+Lagos,+Nigeria" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-5 rounded-2xl bg-[#1A0A02] border border-[#5D3A1A]/40 shadow-md min-w-0 hover:border-[#D4A373]/60 hover:shadow-lg transition-all group">
                  <div className="p-3 bg-[#D4A373]/20 text-[#D4A373] rounded-xl shrink-0 group-hover:bg-[#D4A373]/30 transition-colors">
                    <MapPin size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[#E6CCB2] font-serif text-base mb-1 font-bold group-hover:text-[#D4A373] transition-colors">Hotel Location</h3>
                    <p className="text-[#8D6E63] text-xs leading-relaxed font-semibold break-words">4, Goodness Avenue, Ore Ofe Estate<br/>off Akala Express, Lagos, Nigeria</p>
                  </div>
                </a>
                
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#1A0A02] border border-[#5D3A1A]/40 shadow-md min-w-0">
                  <div className="p-3 bg-[#D4A373]/20 text-[#D4A373] rounded-xl shrink-0">
                    <Phone size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[#E6CCB2] font-serif text-base mb-1 font-bold">Direct Lines</h3>
                    <div className="text-[#8D6E63] text-xs leading-relaxed font-semibold break-words">
                      <a href="tel:+2348003732634353" className="block hover:text-[#D4A373] transition-colors pb-0.5">+234 800 joebrown</a>
                      <a href="tel:+2348012345678" className="block hover:text-[#D4A373] transition-colors">+234 801 234 5678</a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#1A0A02] border border-[#5D3A1A]/40 shadow-md min-w-0">
                  <div className="p-3 bg-[#D4A373]/20 text-[#D4A373] rounded-xl shrink-0">
                    <Mail size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[#E6CCB2] font-serif text-base mb-1 font-bold">Email Desk</h3>
                    <div className="text-[#8D6E63] text-xs leading-relaxed font-semibold break-all">
                      <a href="mailto:info@joebrownhotels.com" className="block hover:text-[#D4A373] transition-colors pb-0.5">info@joebrownhotels.com</a>
                      <a href="mailto:reservations@joebrownhotels.com" className="block hover:text-[#D4A373] transition-colors">reservations@joebrownhotels.com</a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#1A0A02] border border-[#5D3A1A]/40 shadow-md min-w-0">
                  <div className="p-3 bg-[#D4A373]/20 text-[#D4A373] rounded-xl shrink-0">
                    <Clock size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[#E6CCB2] font-serif text-base mb-1 font-bold">Front Desk Hours</h3>
                    <p className="text-[#8D6E63] text-xs leading-relaxed font-semibold break-words">24 Hours / 7 Days<br/>Live Intercom & Duty Officer Support</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A0A02] border border-[#5D3A1A]/40 rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4A373] via-[#b45309] to-[#D4A373]" />
                <h3 className="text-2xl font-serif text-[#E6CCB2] mb-2 font-bold">Send an Inquiry or Reserve Table</h3>
                <p className="text-[#8D6E63] text-xs font-semibold mb-6">Our front desk team responds promptly via live intercom or email.</p>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#D4A373] font-bold mb-1">Your Name</label>
                      <input type="text" className="w-full bg-white/5 border border-[#5D3A1A] text-white placeholder:text-[#8D6E63] text-sm px-3.5 py-3 rounded-lg focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] font-semibold transition-all" placeholder="e.g. Chief Adeleke" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#D4A373] font-bold mb-1">Phone / WhatsApp</label>
                      <input type="text" className="w-full bg-white/5 border border-[#5D3A1A] text-white placeholder:text-[#8D6E63] text-sm px-3.5 py-3 rounded-lg focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] font-semibold transition-all" placeholder="+234..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#D4A373] font-bold mb-1">Inquiry Type</label>
                    <select className="w-full bg-[#1A0A02] border border-[#5D3A1A] text-white text-sm px-3.5 py-3 rounded-lg focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] font-semibold transition-all appearance-none cursor-pointer">
                      <option className="bg-[#1A0A02]">Room Reservation</option>
                      <option className="bg-[#1A0A02]">Restaurant & Lounge Table</option>
                      <option className="bg-[#1A0A02]">Private Event / Hosting</option>
                      <option className="bg-[#1A0A02]">General Inquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#D4A373] font-bold mb-1">Message</label>
                    <textarea rows={4} className="w-full bg-white/5 border border-[#5D3A1A] text-white placeholder:text-[#8D6E63] text-sm px-3.5 py-3 rounded-lg focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] font-semibold transition-all resize-none" placeholder="How can we assist you today?"></textarea>
                  </div>
                  <button type="submit" className="bg-[#3E2723] hover:bg-[#1A110B] text-white w-full py-3.5 text-xs font-extrabold uppercase tracking-[0.25em] flex items-center justify-center gap-2 shadow-md rounded-xl transition-all duration-300">
                    <Send size={14} /> Submit Inquiry
                  </button>
                </form>
              </div>
            </div>

            {/* Interactive Map Embed */}
            <div className="h-full min-h-[450px]">
              <div className="glass-card w-full h-full overflow-hidden border-2 border-brown-300/80 rounded-2xl relative shadow-xl">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.883712958434!2d3.845833!3d7.369722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMjInMTEuMCJOIDPCsDUwJzQ1LjAiRQ!5e0!3m2!1sen!2sng!4v1714400000000!5m2!1sen!2sng" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, minHeight: '100%', position: 'absolute', top: 0, left: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Joebrown Palace Hotel Location - Akala Express Lagos"
                ></iframe>
              </div>
            </div>

          </div>
        </section>

        {/* UNIFIED REUSABLE FOOTER */}
        <Footer hotelName={hotelName} hotelAddress={hotelAddress} hotelPhone={hotelPhone} />
      </div>

      <CustomerIntercom />
      <WhatsAppButton />
    </main>
  );
}
