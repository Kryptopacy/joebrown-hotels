'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Clock, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function PendingApprovalPage() {
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-[#FFFCEB] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border-2 border-brown-200">
        <div className="w-20 h-20 bg-brown-100 text-brown-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Clock size={40} />
        </div>
        
        <h1 className="text-3xl font-serif text-slate-900 font-bold mb-4">Pending Approval</h1>
        
        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
          Your account has been successfully created, but you need administrator approval to access the staff portal. 
          Please contact your manager to approve your account.
        </p>

        <div className="bg-brown-50 rounded-xl p-4 mb-8 border border-brown-100 flex items-start text-left gap-3">
          <ShieldAlert size={20} className="text-brown-600 mt-0.5 shrink-0" />
          <p className="text-sm text-brown-900 font-medium">
            If you just received an invite link, your account might still be provisioning. Try refreshing the page in a few moments.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => window.location.href = '/admin'}
            className="px-6 py-3 bg-brown-600 text-white font-bold rounded-xl hover:bg-brown-700 transition-colors shadow-md"
          >
            Refresh Status
          </button>
          
          <button 
            onClick={handleLogout}
            className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
