'use client';

import React, { useState } from 'react';
import { Mail, MessageSquare, Copy, Code, Sparkles, Shield, Rocket, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BuildWithUsClient() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'Custom Web App',
    budget: '₦3M - ₦10M Enterprise',
    reference: '',
    vision: '',
  });

  const categories = [
    'E-Commerce',
    'Custom Web App',
    'AI Automation',
    'Mobile App',
    'Enterprise CRM'
  ];

  const budgets = [
    '< ₦1M MVP',
    '₦1M - ₦3M Growth',
    '₦3M - ₦10M Enterprise',
    'Custom'
  ];

  const generateBrief = () => {
    return `*New Project Brief (Pacy Labs)*\n\n*Name:* ${formData.name}\n*Phone:* ${formData.phone}\n*Category:* ${formData.category}\n*Budget:* ${formData.budget}\n*Reference:* ${formData.reference || 'None'}\n\n*Vision:*\n${formData.vision}`;
  };

  const handleWhatsApp = () => {
    if (!formData.name || !formData.phone || !formData.vision) {
      toast.error('Please fill out your name, phone, and vision.');
      return;
    }
    const brief = generateBrief();
    const encoded = encodeURIComponent(brief);
    window.open(`https://wa.me/2348107036120?text=${encoded}`, '_blank');
  };

  const handleEmail = () => {
    if (!formData.name || !formData.vision) {
      toast.error('Please fill out your name and vision.');
      return;
    }
    const brief = generateBrief();
    const encoded = encodeURIComponent(brief);
    window.open(`mailto:pacy@ourmenuos.online?subject=New Project Brief: ${formData.name}&body=${encoded}`, '_blank');
  };

  const handleCopy = () => {
    if (!formData.name || !formData.vision) {
      toast.error('Please fill out your name and vision.');
      return;
    }
    navigator.clipboard.writeText(generateBrief());
    toast.success('Project brief copied to clipboard!');
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 md:px-8">
      
      {/* Hero Section */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brown-500/10 blur-[100px] pointer-events-none rounded-full" />
        <h1 className="text-4xl md:text-6xl font-serif font-extrabold tracking-tight mb-6">
          Build Your Next <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brown-600 to-brown-900">
            High-Impact Platform
          </span>
          <br/>With Us
        </h1>
        <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto font-medium">
          Partner with Pacy Labs engineering to build blazing-fast digital platforms, AI-driven automation, and premium web applications tailored for growth.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <div className="bg-[#1A0A02] border border-[#5D3A1A]/40 shadow-2xl rounded-3xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4A373] via-[#b45309] to-[#D4A373]" />
            <h2 className="text-2xl font-serif font-bold text-[#E6CCB2] mb-8 flex items-center gap-2">
              <Rocket className="text-[#D4A373]" /> Configure Your Project Brief
            </h2>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#D4A373] mb-2 uppercase tracking-wider">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#0D0501] border border-[#5D3A1A] rounded-xl px-4 py-3 text-white font-medium placeholder:text-[#8D6E63]/60 focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#D4A373] mb-2 uppercase tracking-wider">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-[#0D0501] border border-[#5D3A1A] rounded-xl px-4 py-3 text-white font-medium placeholder:text-[#8D6E63]/60 focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all"
                    placeholder="+234..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#D4A373] mb-2 uppercase tracking-wider">Project Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-[#0D0501] border border-[#5D3A1A] rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all appearance-none cursor-pointer"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#D4A373] mb-2 uppercase tracking-wider">Estimated Budget</label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="w-full bg-[#0D0501] border border-[#5D3A1A] rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all appearance-none cursor-pointer"
                  >
                    {budgets.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D4A373] mb-2 uppercase tracking-wider">Reference Link (Optional)</label>
                <input
                  type="url"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  className="w-full bg-[#0D0501] border border-[#5D3A1A] rounded-xl px-4 py-3 text-white font-medium placeholder:text-[#8D6E63]/60 focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D4A373] mb-2 uppercase tracking-wider">Project Vision & Key Requirements *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.vision}
                  onChange={(e) => setFormData({...formData, vision: e.target.value})}
                  className="w-full bg-[#0D0501] border border-[#5D3A1A] rounded-xl px-4 py-3 text-white font-medium placeholder:text-[#8D6E63]/60 focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all resize-none"
                  placeholder="Tell us what you want to build and why..."
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-600/20"
                >
                  <MessageSquare size={18} /> WhatsApp Brief
                </button>
                <button
                  type="button"
                  onClick={handleEmail}
                  className="flex-1 bg-brown-700 hover:bg-brown-800 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-brown-700/20"
                >
                  <Mail size={18} /> Email Brief
                </button>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="w-full bg-transparent border border-[#5D3A1A]/60 text-[#D4A373] hover:bg-[#2C1203] px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-4"
              >
                <Copy size={18} /> Copy Brief to Clipboard
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Features & Info */}
        <div className="lg:col-span-5 space-y-8">
          
          <div className="bg-[#FFFCEB]/50 backdrop-blur-md border border-brown-200 rounded-3xl p-8">
            <h3 className="text-xl font-serif font-bold text-slate-950 mb-6">Why Build With Us?</h3>
            
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="mt-1 w-10 h-10 rounded-full bg-brown-100 flex items-center justify-center shrink-0 text-brown-600">
                  <Code size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Modern Tech Stack</h4>
                  <p className="text-sm text-slate-600">Blazing-fast architectures using Next.js, React, Supabase, and Microservices.</p>
                </div>
              </li>
              
              <li className="flex gap-4">
                <div className="mt-1 w-10 h-10 rounded-full bg-brown-100 flex items-center justify-center shrink-0 text-brown-600">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Premium Aesthetics</h4>
                  <p className="text-sm text-slate-600">Conversion-obsessed design featuring glassmorphism, fluid animations, and bespoke UI.</p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="mt-1 w-10 h-10 rounded-full bg-brown-100 flex items-center justify-center shrink-0 text-brown-600">
                  <Rocket size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">AI & Automation</h4>
                  <p className="text-sm text-slate-600">Advanced agentic workflows and intelligent integrations that scale your operations.</p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="mt-1 w-10 h-10 rounded-full bg-brown-100 flex items-center justify-center shrink-0 text-brown-600">
                  <Shield size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Bank-Grade Security</h4>
                  <p className="text-sm text-slate-600">Enterprise data protection, Row-Level Security, and compliant deployments.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-brown-900 text-white rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brown-500/20 rounded-full blur-2xl pointer-events-none" />
            <h3 className="font-serif text-xl font-bold mb-3 relative z-10">Direct Contact</h3>
            <p className="text-brown-200/90 text-sm mb-6 relative z-10">
              Prefer to reach out directly? Email Pacy Labs leadership for a private consultation.
            </p>
            <div className="flex items-center gap-3 relative z-10">
              <Mail className="text-brown-400" size={20} />
              <a href="mailto:pacy@ourmenuos.online" className="font-bold hover:text-brown-300 transition-colors">
                pacy@ourmenuos.online
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
