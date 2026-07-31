'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Settings, Save, Phone, MapPin, CreditCard, Sparkles,
  Bot, Wifi, ParkingCircle, Ban, HelpCircle, ChevronDown,
  CheckCircle2, Hotel, Bell, Users, Wrench
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── tiny helpers ─────────────────────────────────────────── */
const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-[#0D0501] border border-white/10 rounded-3xl p-6 md:p-8 shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionHeading = ({ icon: Icon, label, color = 'text-[#D4A373]' }: { icon: any; label: string; color?: string }) => (
  <h2 className="text-lg font-bold text-white mb-5 border-b border-white/10 pb-3 flex items-center gap-2">
    <Icon size={18} className={color} /> {label}
  </h2>
);

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-white/40 font-medium mt-1.5">{hint}</p>}
  </div>
);

const inputCls = 'w-full bg-black/60 border border-white/10 focus:border-[#D4A373] text-white text-sm px-4 py-3 rounded-xl outline-none transition-all shadow-sm';
const textareaCls = inputCls + ' resize-none';

/* ─── AI Knowledge accordion item ──────────────────────────── */
const KbField = ({
  icon: Icon,
  label,
  placeholder,
  hint,
  value,
  onChange,
}: {
  icon: any; label: string; placeholder: string; hint: string;
  value: string; onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(!!value);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <Icon size={15} className="text-[#D4A373]" /> {label}
          {value && <CheckCircle2 size={14} className="text-emerald-400 ml-1" />}
        </span>
        <ChevronDown size={16} className={`text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="p-4 border-t border-white/10">
          <textarea
            rows={3}
            className={textareaCls}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
          />
          <p className="text-xs text-white/40 mt-1.5">{hint}</p>
        </div>
      )}
    </div>
  );
};

/* ─── Main Page ─────────────────────────────────────────────── */
export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const supabase = createClient();

  /* ── Hotel core info ── */
  const [core, setCore] = useState({
    name: '',
    tagline: '',
    description: '',
    address: '',
    whatsapp_number: '',
  });

  /* ── Payment / bank ── */
  const [payment, setPayment] = useState({
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
  });

  /* ── Loyalty program ── */
  const [loyalty, setLoyalty] = useState({
    naira_per_loyalty_point: 1000,
    loyalty_milestone_threshold: 5000,
  });

  /* ── AI Knowledge Base ── */
  const [kb, setKb] = useState({
    ai_checkin_policy: '',
    ai_wifi_info: '',
    ai_parking_info: '',
    ai_pet_smoking_policy: '',
    ai_amenities: '',
    ai_custom_faq: '',
  });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('hotels').select('*').eq('slug', 'joebrown').maybeSingle();
    if (data) {
      setHotelId(data.id);
      setCore({
        name: data.name || '',
        tagline: data.tagline || '',
        description: data.description || '',
        address: data.address || '',
        whatsapp_number: data.whatsapp_number || '',
      });
      setPayment({
        bank_name: data.bank_name || '',
        bank_account_number: data.bank_account_number || '',
        bank_account_name: data.bank_account_name || '',
      });
      setLoyalty({
        naira_per_loyalty_point: data.naira_per_loyalty_point ?? 1000,
        loyalty_milestone_threshold: data.loyalty_milestone_threshold ?? 5000,
      });
      setKb({
        ai_checkin_policy: data.ai_checkin_policy || '',
        ai_wifi_info: data.ai_wifi_info || '',
        ai_parking_info: data.ai_parking_info || '',
        ai_pet_smoking_policy: data.ai_pet_smoking_policy || '',
        ai_amenities: data.ai_amenities || '',
        ai_custom_faq: data.ai_custom_faq || '',
      });
    }
    setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelId) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('hotels')
      .update({ ...core, ...payment, ...loyalty, ...kb })
      .eq('id', hotelId);

    if (error) {
      console.error(error);
      toast.error('Failed to save settings.');
    } else {
      toast.success('Settings saved successfully!');
    }
    setIsSaving(false);
  };

  /* ── Danger zone ── */
  const DEMO_ROOMS = [
    { slug: 'california-executive-suite', name: 'California Executive Suite', price_per_night: 45000 },
    { slug: 'texas-deluxe-room', name: 'Texas Deluxe Room', price_per_night: 35000 },
    { slug: 'florida-lounge-suite', name: 'Florida Lounge Suite', price_per_night: 40000 },
  ];
  const DEMO_MENU_NAMES = [
    'Special Beef Suya Platter', 'Grilled Croaker Fish & Chips', 'Special Fried Rice & Chicken',
    'Heineken Ice Cold (330ml)', 'Guinness Stout (Big Bottle)', 'Trophy Lager Beer',
    'Hennessy VSOP (Full Bottle)', 'Martell VS Cognac (Shot)', 'Joebrown Special Cocktail',
    'Long Island Iced Tea', 'Coca-Cola / Fanta / Sprite', 'Eva Mineral Water (75cl)',
  ];
  const DEMO_MENU_CATS = ['Starters & Grills', 'Main Dishes & Swallows', 'Beers & Ciders', 'Liquors & Cognac', 'Wines & Champagnes', 'Cocktails & Mocktails', 'Soft Drinks & Water'];

  const clearDemoRooms = async () => {
    if (!hotelId || !confirm('Clear default demo rooms? Only untouched seeded rooms will be deleted.')) return;
    const { data: rooms } = await supabase.from('rooms').select('id,slug,name,price_per_night').eq('hotel_id', hotelId).in('slug', DEMO_ROOMS.map(r => r.slug));
    const ids = (rooms || []).filter(r => { const o = DEMO_ROOMS.find(d => d.slug === r.slug); return o && r.name === o.name && Number(r.price_per_night) === o.price_per_night; }).map(r => r.id);
    if (!ids.length) { toast.success('No untouched demo rooms to clear.'); return; }
    await supabase.from('rooms').delete().in('id', ids);
    toast.success(`${ids.length} demo room(s) cleared.`);
  };

  const clearDemoMenu = async () => {
    if (!hotelId || !confirm('Clear default demo menu items? Only untouched seeded items will be deleted.')) return;
    await supabase.from('menu_categories').delete().eq('hotel_id', hotelId).in('name', DEMO_MENU_CATS);
    const { data: items } = await supabase.from('menu_items').select('id,name').eq('hotel_id', hotelId).in('name', DEMO_MENU_NAMES);
    if (items?.length) await supabase.from('menu_items').delete().in('id', items.map(i => i.id));
    toast.success('Demo menu data cleared.');
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in-up md:max-w-4xl space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded bg-white/10 animate-pulse"></div>
          <div>
            <div className="h-8 w-64 bg-white/10 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-white/5 rounded animate-pulse"></div>
          </div>
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-6 h-6 rounded bg-white/10"></div>
              <div className="h-5 w-48 bg-white/10 rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="h-12 bg-white/5 rounded-xl"></div>
              <div className="h-12 bg-white/5 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up md:max-w-4xl space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3 mb-2">
        <Settings size={28} className="text-[#D4A373]" />
        <div>
          <h1 className="text-3xl font-serif text-white font-bold">Hotel Settings</h1>
          <p className="text-sm text-white/50 font-medium mt-0.5">Configure all operational settings for your property.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── 1. Property Info ── */}
        <SectionCard>
          <SectionHeading icon={Hotel} label="Property Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Hotel Name" hint="Shown across the entire platform.">
              <input className={inputCls} value={core.name} onChange={e => setCore({ ...core, name: e.target.value })} placeholder="Joebrown Palace Hotels & Lounge" required />
            </Field>
            <Field label="Tagline" hint="Short descriptor shown on the home page.">
              <input className={inputCls} value={core.tagline} onChange={e => setCore({ ...core, tagline: e.target.value })} placeholder="A Sanctuary of Refined Hospitality" />
            </Field>
            <Field label="Full Description" hint="Shown on the public landing page." >
              <textarea rows={3} className={textareaCls} value={core.description} onChange={e => setCore({ ...core, description: e.target.value })} placeholder="Tell guests about the experience at your property…" />
            </Field>
            <div className="space-y-5">
              <Field label="Physical Address" hint="Shown in the footer and booking confirmation emails.">
                <textarea rows={3} className={textareaCls} value={core.address} onChange={e => setCore({ ...core, address: e.target.value })} placeholder="123 Ocean Drive, Victoria Island, Lagos" />
              </Field>
              <Field label="WhatsApp Number" hint="Powers the floating WhatsApp widget and booking redirect.">
                <input className={inputCls} value={core.whatsapp_number} onChange={e => setCore({ ...core, whatsapp_number: e.target.value })} placeholder="+2348012345678" />
              </Field>
            </div>
          </div>
        </SectionCard>

        {/* ── 2. Payment & Bank ── */}
        <SectionCard>
          <SectionHeading icon={CreditCard} label="Payment & Bank Details" color="text-blue-400" />
          <p className="text-xs text-white/50 mb-4">These details appear on the food & beverage ordering flow for guests paying by bank transfer.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Bank Name">
              <input className={inputCls} value={payment.bank_name} onChange={e => setPayment({ ...payment, bank_name: e.target.value })} placeholder="First Bank Nigeria" />
            </Field>
            <Field label="Account Number">
              <input className={inputCls} value={payment.bank_account_number} onChange={e => setPayment({ ...payment, bank_account_number: e.target.value })} placeholder="0123456789" />
            </Field>
            <Field label="Account Name" >
              <input className={`${inputCls} md:col-span-2`} value={payment.bank_account_name} onChange={e => setPayment({ ...payment, bank_account_name: e.target.value })} placeholder="Joebrown Palace Hotel and Suites" />
            </Field>
          </div>
        </SectionCard>

        {/* ── 3. Loyalty Program ── */}
        <SectionCard>
          <SectionHeading icon={Sparkles} label="Loyalty Program Rules" color="text-[#D4A373]" />
          <p className="text-xs text-white/50 mb-4">Define how guests earn and redeem loyalty points across bookings and F&B spend.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Spend per Point (₦)" hint="Amount a guest must spend to earn 1 loyalty point.">
              <input type="number" min="1" className={inputCls} value={loyalty.naira_per_loyalty_point} onChange={e => setLoyalty({ ...loyalty, naira_per_loyalty_point: Number(e.target.value) })} placeholder="1000" required />
            </Field>
            <Field label="Milestone Reward Threshold (Points)" hint="Points required to trigger a reward notification email to the guest.">
              <input type="number" min="1" className={inputCls} value={loyalty.loyalty_milestone_threshold} onChange={e => setLoyalty({ ...loyalty, loyalty_milestone_threshold: Number(e.target.value) })} placeholder="5000" required />
            </Field>
          </div>
        </SectionCard>

        {/* ── 4. AI Concierge Knowledge Base ── */}
        <SectionCard>
          <SectionHeading icon={Bot} label="AI Concierge Knowledge Base" color="text-violet-400" />
          <div className="mb-5 bg-violet-900/20 border border-violet-900/30 rounded-xl p-4 text-sm text-violet-300">
            <p className="font-semibold mb-1">How this works</p>
            <p className="text-xs leading-relaxed">
              The AI Concierge on your live chat widget automatically reads this knowledge base before answering any guest question. It also has real-time access to your <strong>rooms</strong> and <strong>menu items</strong> directly from the database. Fill in only the sections that apply — any field left blank is simply skipped. When the AI encounters a question outside this knowledge base, it will alert a human staff member to take over.
            </p>
          </div>

          <div className="space-y-3">
            <KbField
              icon={Hotel}
              label="Check-in / Check-out Policy"
              placeholder="e.g. Check-in is from 2:00 PM. Check-out is by 12:00 PM (noon). Early check-in is available on request subject to availability. Late checkout (up to 4 PM) may be arranged for an additional ₦5,000."
              hint="Tell the AI your standard check-in times, grace periods, and any fees."
              value={kb.ai_checkin_policy}
              onChange={v => setKb({ ...kb, ai_checkin_policy: v })}
            />
            <KbField
              icon={Wifi}
              label="WiFi Information"
              placeholder="e.g. WiFi Network: Joebrown_Guest. Password: Welcome2024. The network is available in all rooms and the lounge. For persistent issues, call the front desk."
              hint="Network name, password, and coverage areas."
              value={kb.ai_wifi_info}
              onChange={v => setKb({ ...kb, ai_wifi_info: v })}
            />
            <KbField
              icon={ParkingCircle}
              label="Parking Information"
              placeholder="e.g. Complimentary parking is available for all hotel guests in the basement car park. Valet parking is available at the main entrance for ₦2,000 per day."
              hint="Parking availability, charges, and location."
              value={kb.ai_parking_info}
              onChange={v => setKb({ ...kb, ai_parking_info: v })}
            />
            <KbField
              icon={Ban}
              label="Pet & Smoking Policy"
              placeholder="e.g. Joebrown is a strictly non-smoking property. Smoking is only permitted in designated outdoor areas. We do not accommodate pets at this time."
              hint="Any restrictions guests commonly ask about."
              value={kb.ai_pet_smoking_policy}
              onChange={v => setKb({ ...kb, ai_pet_smoking_policy: v })}
            />
            <KbField
              icon={Sparkles}
              label="Amenities & Facilities"
              placeholder="e.g. We offer a rooftop pool (open 7 AM – 9 PM), a fully equipped gym, a business centre, a spa with appointment-based services, and 24-hour room service."
              hint="Describe your facilities so the AI can confidently answer amenity questions."
              value={kb.ai_amenities}
              onChange={v => setKb({ ...kb, ai_amenities: v })}
            />
            <KbField
              icon={HelpCircle}
              label="Custom FAQs & Additional Instructions"
              placeholder="e.g.\nQ: Is there a dress code for the lounge? A: Smart casual is required after 7 PM.\nQ: Do you offer airport transfers? A: Yes, transfers are available for ₦15,000. Contact the front desk to arrange.\n\nAlways greet guests warmly and address them by name if known."
              hint="Add any other FAQs, custom instructions, or special rules for the AI here. Use a Q&A format for best results."
              value={kb.ai_custom_faq}
              onChange={v => setKb({ ...kb, ai_custom_faq: v })}
            />
          </div>
        </SectionCard>

        {/* ── Save Button ── */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-[#D4A373] text-[#1A0A02] hover:bg-[#b45309] disabled:opacity-60 font-bold px-10 py-3 rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <Save size={18} /> {isSaving ? 'Saving…' : 'Save All Settings'}
          </button>
        </div>
      </form>

      {/* ── Danger Zone ── */}
      <div className="bg-red-950/20 border border-red-900/30 rounded-3xl p-6 md:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-red-300 mb-2 border-b border-red-200 pb-3 flex items-center gap-2">
          <Wrench size={18} className="text-red-400" /> Danger Zone
        </h2>
        <p className="text-sm text-red-400 font-medium mb-5">
          These actions permanently delete <strong>only the original demo/seeded data</strong>. Any rooms or menu items you have added or edited yourself will remain completely safe.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={clearDemoRooms} className="bg-red-900/50 hover:bg-red-800/50 text-red-100 font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm flex items-center gap-2">
            <Hotel size={16} /> Clear Demo Rooms
          </button>
          <button type="button" onClick={clearDemoMenu} className="bg-red-900/50 hover:bg-red-800/50 text-red-100 font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm flex items-center gap-2">
            <Bell size={16} /> Clear Demo Menu
          </button>
        </div>
      </div>
    </div>
  );
}
