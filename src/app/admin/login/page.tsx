'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from './actions';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, ArrowRight, X } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    const res = await loginAction(formData);
    if (res?.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success('Welcome back!');
      router.push('/admin');
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
      },
    });
    if (error) {
      toast.error('Google sign-in failed. Please try email login.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* LEFT — Hotel Hero Image Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-end">
        <img
          src="/JB/gallery/P1160458.JPG"
          alt="Joebrown Palace Hotel and Suites"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        {/* Bottom brand text */}
        <div className="relative z-10 p-12">
          <div className="w-12 h-1 bg-brown-400 mb-6" />
          <h1 className="text-5xl font-serif text-white font-bold leading-tight mb-3">
            Joebrown<br />Hotel & Lounge
          </h1>
          <p className="text-[#D4A373]/80 text-sm font-medium tracking-wide uppercase">
            Staff Management Portal
          </p>
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#1A0A02] relative px-6 py-12">

        {/* Subtle ambient glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#D4A373]/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#D4A373]/10 blur-[80px] pointer-events-none rounded-full" />

        {/* Close / Go back button */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-6 right-6 lg:top-8 lg:right-8 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-colors z-20"
          aria-label="Go back to home"
        >
          <X size={24} />
        </button>

        <div className="w-full max-w-sm relative z-10">

          {/* Mobile brand header */}
          <div className="lg:hidden mb-10 text-center flex flex-col items-center">
            <img src="/logo.png" alt="Joebrown Logo" className="h-20 w-auto mb-4 object-contain brightness-0 invert" />
            <h1 className="text-3xl font-serif text-white font-bold mb-1">Joebrown Palace Hotel and Suites</h1>
            <p className="text-[#D4A373] text-xs uppercase tracking-widest font-bold">Staff Portal</p>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-10">
            <div className="flex justify-center hidden">
              <img src="/jb_logo_transparent.PNG" alt="Joebrown Logo" className="h-20 w-auto mb-4 object-contain brightness-0 invert" />
            </div>
            <p className="text-[#D4A373] text-[11px] uppercase tracking-[0.25em] font-bold mb-3">Welcome Back</p>
            <h2 className="text-3xl font-serif text-white font-bold">Sign In</h2>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-[#0D0501] hover:bg-black border border-white/10 hover:border-[#D4A373]/50 text-white shadow-sm text-sm font-bold py-3.5 rounded-xl transition-all duration-200 mb-6 disabled:opacity-40"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/40 text-xs font-bold">or sign in with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#D4A373] transition-colors" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email address"
                className="w-full bg-[#0D0501] border border-white/10 hover:border-white/20 focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] text-white placeholder:text-white/30 text-sm pl-11 pr-4 py-3.5 rounded-xl outline-none transition-all duration-200 font-medium shadow-sm"
              />
            </div>

            <div className="relative group">
              <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#D4A373] transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="w-full bg-[#0D0501] border border-white/10 hover:border-white/20 focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] text-white placeholder:text-white/30 text-sm pl-11 pr-12 py-3.5 rounded-xl outline-none transition-all duration-200 font-medium shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2.5 bg-[#D4A373] hover:bg-[#E5B585] disabled:opacity-40 disabled:cursor-not-allowed text-[#1A0A02] shadow-[0_0_15px_rgba(212,163,115,0.3)] font-bold text-sm tracking-wide py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 mt-2 group"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#1A0A02]/20 border-t-[#1A0A02] rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-white/30 font-bold text-[11px] mt-8">
            Authorised Joebrown Palace Hotel and Suites staff only
          </p>
        </div>
      </div>
    </div>
  );
}
