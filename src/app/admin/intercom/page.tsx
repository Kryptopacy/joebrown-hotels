'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Headset, Users, Send, MessageSquare, Check, Bell, AlertCircle, Shield, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { StaffRole, ROLE_PERMISSIONS } from '@/lib/auth/rbac';

const playChime = () => {
  try {
    if (typeof window === 'undefined') return;
    const win = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const AudioCtx = win.AudioContext || win.webkitAudioContext;
    if (!AudioCtx) return;
    const audioCtx = new AudioCtx();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch {
    // audio context muted or restricted by browser policy
  }
};

export default function AdminIntercomPage() {
  const [activeTab, setActiveTab] = useState<'guests' | 'staff'>('guests');
  
  // Guest Intercom State
  const [guestThreads, setGuestThreads] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [guestMessages, setGuestMessages] = useState<any[]>([]);
  const [guestReplyText, setGuestReplyText] = useState('');

  // Staff Internal Intercom State
  const [staffDeptFilter, setStaffDeptFilter] = useState<'all' | 'front_desk' | 'lounge' | 'kitchen' | 'housekeeping'>('all');
  const [staffMessages, setStaffMessages] = useState<any[]>([]);
  const [staffInputText, setStaffInputText] = useState('');
  const [currentStaffName, setCurrentStaffName] = useState('Front Desk Duty Officer');
  const [currentRole, setCurrentRole] = useState<StaffRole>('receptionist');

  const guestMsgEndRef = useRef<HTMLDivElement>(null);
  const staffMsgEndRef = useRef<HTMLDivElement>(null);
  
  // Typing Indicator State
  const [activeTypers, setActiveTypers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const presenceChannelRef = useRef<any>(null);
  
  const [hotelId, setHotelId] = useState<string>('joebrown-default-id');
  const supabase = createClient();

  useEffect(() => {
    async function initHotelId() {
      const { data } = await supabase.from('hotels').select('id').eq('slug', 'joebrown').maybeSingle();
      if (data) setHotelId(data.id);
    }
    initHotelId();
    fetchGuestThreads();
    fetchStaffMessages();

    // Realtime subscription for customer messages
    const customerChannel = supabase
      .channel('admin_customer_intercom')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'customer_intercom_messages' },
        (payload) => {
          fetchGuestThreads();
          if (activeSessionId && payload.new.session_id === activeSessionId) {
            setGuestMessages((prev) => [...prev, payload.new]);
            scrollGuestBottom();
          } else {
            playChime();
            toast.custom((t) => (
              <div className="bg-[#0D0501] border border-red-500/50 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3">
                <Bell size={20} className="text-red-500 animate-bounce" />
                <div>
                  <h4 className="font-serif font-bold text-sm">New Intercom Call</h4>
                  <p className="text-xs text-white/60">{payload.new.guest_name} ({payload.new.room_or_table || 'Web'}): {payload.new.message}</p>
                </div>
              </div>
            ));
          }
        }
      )
      .subscribe();

    // Realtime subscription for staff internal messages
    const staffChannel = supabase
      .channel('admin_staff_intercom')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'staff_intercom_messages' },
        (payload) => {
          setStaffMessages((prev) => [...prev, payload.new]);
          scrollStaffBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(customerChannel);
      supabase.removeChannel(staffChannel);
    };
  }, [supabase, activeSessionId]);

  // Setup Presence for Typing Indicators
  useEffect(() => {
    const channelName = `presence_staff_${staffDeptFilter}`;
    const presenceChannel = supabase.channel(channelName, {
      config: { presence: { key: currentStaffName } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const typers: string[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.isTyping && p.user !== currentStaffName) {
              if (!typers.includes(p.user)) {
                typers.push(p.user);
              }
            }
          });
        });
        
        setActiveTypers(typers);
      })
      .subscribe();

    presenceChannelRef.current = presenceChannel;

    return () => {
      supabase.removeChannel(presenceChannel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setActiveTypers([]);
    };
  }, [supabase, staffDeptFilter, currentStaffName]);

  const handleStaffInput = (val: string) => {
    setStaffInputText(val);
    
    if (presenceChannelRef.current) {
      presenceChannelRef.current.track({
        user: currentStaffName,
        isTyping: val.length > 0
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        presenceChannelRef.current?.track({
          user: currentStaffName,
          isTyping: false
        });
      }, 2000);
    }
  };

  const fetchGuestThreads = async () => {
    const { data } = await supabase
      .from('customer_intercom_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      // Group by session_id
      const sessionsMap: Record<string, any> = {};
      data.forEach((msg) => {
        if (!sessionsMap[msg.session_id]) {
          sessionsMap[msg.session_id] = {
            session_id: msg.session_id,
            guest_name: msg.guest_name,
            room_or_table: msg.room_or_table,
            last_message: msg.message,
            created_at: msg.created_at,
            unread: !msg.is_read && msg.sender_type === 'guest',
            requires_human: msg.requires_human || false,
          };
        } else if (msg.requires_human) {
          sessionsMap[msg.session_id].requires_human = true;
        }
      });
      const threadsArray = Object.values(sessionsMap).sort((a: any, b: any) => {
        if (a.requires_human && !b.requires_human) return -1;
        if (!a.requires_human && b.requires_human) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setGuestThreads(threadsArray);
      if (!activeSessionId && threadsArray.length > 0) {
        selectGuestThread(threadsArray[0].session_id);
      }
    }
  };

  const selectGuestThread = async (sid: string) => {
    setActiveSessionId(sid);
    const { data } = await supabase
      .from('customer_intercom_messages')
      .select('*')
      .eq('session_id', sid)
      .order('created_at', { ascending: true });

    if (data) {
      setGuestMessages(data);
      scrollGuestBottom();
    }
  };

  const sendGuestReply = async () => {
    if (!activeSessionId || !guestReplyText.trim()) return;

    const activeThread = guestThreads.find((t) => t.session_id === activeSessionId);

    const payload = {
      hotel_id: hotelId,
      session_id: activeSessionId,
      guest_name: activeThread?.guest_name || 'Guest',
      room_or_table: activeThread?.room_or_table || 'Lobby',
      sender_type: 'staff',
      message: guestReplyText,
      is_read: true,
    };

    const { error } = await supabase.from('customer_intercom_messages').insert(payload);

    if (!error) {
      setGuestReplyText('');
      scrollGuestBottom();
    } else {
      toast.error('Failed to dispatch reply');
    }
  };

  const resolveHandoff = async () => {
    if (!activeSessionId) return;
    const activeThread = guestThreads.find((t) => t.session_id === activeSessionId);
    
    await supabase.from('customer_intercom_messages').update({ requires_human: false }).eq('session_id', activeSessionId);
    
    const payload = {
      hotel_id: hotelId,
      session_id: activeSessionId,
      guest_name: 'System',
      room_or_table: activeThread?.room_or_table || 'Lobby',
      sender_type: 'system',
      message: 'The staff has marked this request as resolved. The AI Assistant is back to help you with anything else!',
      is_read: true,
      requires_human: false
    };
    await supabase.from('customer_intercom_messages').insert(payload);
    toast.success('Handoff resolved, AI is back in control.');
  };

  const fetchStaffMessages = async () => {
    const { data } = await supabase
      .from('staff_intercom_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (data) {
      setStaffMessages(data);
      scrollStaffBottom();
    }
  };

  const sendStaffMessage = async () => {
    if (!staffInputText.trim()) return;

    const payload = {
      hotel_id: hotelId,
      sender_name: currentStaffName,
      sender_role: ROLE_PERMISSIONS[currentRole].title,
      department: staffDeptFilter,
      message: staffInputText,
    };

    const { error } = await supabase.from('staff_intercom_messages').insert(payload);

    if (!error) {
      try {
        await fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Staff Intercom: #${payload.department}`,
            body: `${payload.sender_name}: ${payload.message}`,
            url: '/admin/intercom'
          })
        });
      } catch (err) {}
      
      if (presenceChannelRef.current) {
        presenceChannelRef.current.track({
          user: currentStaffName,
          isTyping: false
        });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      }
      
      setStaffInputText('');
      scrollStaffBottom();
    } else {
      toast.error('Failed to send staff dispatch');
    }
  };

  const scrollGuestBottom = () => {
    setTimeout(() => guestMsgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const scrollStaffBottom = () => {
    setTimeout(() => staffMsgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const subscribeToPush = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          toast.error('VAPID public key not found');
          return;
        }
        
        const urlBase64ToUint8Array = (base64String: string) => {
          const padding = '='.repeat((4 - base64String.length % 4) % 4);
          const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
          const rawData = window.atob(base64);
          const outputArray = new Uint8Array(rawData.length);
          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
          }
          return outputArray;
        };

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
        
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
        toast.success('System Push Notifications Enabled!');
      } catch (err) {
        console.error('Failed to subscribe to push notifications', err);
        toast.error('Failed to enable push notifications');
      }
    } else {
      toast.error('Push notifications are not supported in this browser.');
    }
  };

  const filteredStaffMessages = staffMessages.filter(
    (m) => staffDeptFilter === 'all' || m.department === 'all' || m.department === staffDeptFilter
  );

  return (
    <div className="animate-fade-in-up flex flex-col h-[calc(100vh-140px)]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-serif text-white font-bold flex items-center gap-3">
            <Headset className="text-[#D4A373]" size={32} /> Intercom Control Desk
          </h1>
          <p className="text-xs text-white/50 font-medium">
            Live Customer Concierge & Real-time Staff Departmental Intercom.
          </p>
        </div>

        {/* Tab Switcher and Push Button */}
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={subscribeToPush}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-white/10 text-white hover:bg-slate-900 transition-colors shadow-sm"
          >
            <Bell size={16} /> Enable Push Alerts
          </button>
          
          <div className="flex bg-[#0D0501] border border-white/10 shadow-sm rounded-xl p-1 w-full md:w-auto">

          <button
            onClick={() => setActiveTab('guests')}
            className={`flex-1 md:flex-initial flex items-center gap-2 px-5 py-2 rounded-lg text-xs uppercase tracking-wider font-bold transition-all ${
              activeTab === 'guests'
                ? 'bg-red-600 text-white shadow-md border border-red-500'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Headset size={16} /> Guest Live Desk
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex-1 md:flex-initial flex items-center gap-2 px-5 py-2 rounded-lg text-xs uppercase tracking-wider font-bold transition-all ${
              activeTab === 'staff'
                ? 'bg-[#D4A373] text-[#1A0A02] border border-white/10 shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Users size={16} /> Staff Internal Intercom
          </button>
        </div>
        </div>
      </div>

      {/* GUEST CONCIERGE INTERCOM TAB */}
      {activeTab === 'guests' && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm overflow-hidden min-h-0">
          {/* Thread List */}
          <div className="border-r border-white/10 flex flex-col h-full bg-[#1A0A02]">
            <div className="p-4 border-b border-white/10 bg-[#1A0A02]">
              <h3 className="font-serif text-white font-bold text-base">Active Calls & Messages</h3>
              <p className="text-xs text-white/50">Real-time guest inquiries</p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {guestThreads.length === 0 ? (
                <div className="p-8 text-center text-xs text-white/50 font-medium">
                  No guest calls in queue.
                </div>
              ) : (
                guestThreads.map((t) => (
                  <button
                    key={t.session_id}
                    onClick={() => selectGuestThread(t.session_id)}
                    className={`w-full text-left p-4 transition-colors flex items-start justify-between ${
                      activeSessionId === t.session_id
                        ? 'bg-[#0D0501] border-l-4 border-red-500 shadow-sm'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 font-bold text-white text-sm">
                        {t.guest_name}{' '}
                        {t.room_or_table && (
                          <span className="text-[10px] px-2 py-0.5 bg-brown-500/20 text-brown-300 border border-brown-500/30 rounded-full">
                            {t.room_or_table}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60 line-clamp-1 mt-1">{t.last_message}</p>
                      {t.requires_human && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse border border-red-400">
                          <AlertCircle size={10} /> Human Assistance Req
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-white/40 font-medium whitespace-nowrap">
                      {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Active Conversation Desk */}
          <div className="md:col-span-2 flex flex-col h-full bg-[#0D0501]">
            {activeSessionId ? (
              <>
                <div className="p-4 border-b border-white/10 bg-[#1A0A02] flex justify-between items-center">
                  <div>
                    <h3 className="font-serif text-white font-bold text-base">
                      {guestThreads.find((t) => t.session_id === activeSessionId)?.guest_name || 'Guest'}
                    </h3>
                    <p className="text-xs text-[#D4A373] font-semibold">
                      Location:{' '}
                      {guestThreads.find((t) => t.session_id === activeSessionId)?.room_or_table || 'Lobby/Web'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {guestThreads.find((t) => t.session_id === activeSessionId)?.requires_human && (
                      <button
                        onClick={resolveHandoff}
                        className="text-xs bg-[#D4A373] hover:bg-[#b45309] text-[#1A0A02] px-3 py-1 rounded-full font-bold shadow-sm transition-colors"
                      >
                        Resolve Handoff (Return to AI)
                      </button>
                    )}
                    <span className="text-xs text-emerald-300 bg-brown-500/200/20 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1 font-bold">
                      <span className="w-2 h-2 rounded-full bg-brown-500/200/200 animate-ping"></span> Live Channel
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {guestMessages.map((m, idx) => {
                    const isStaff = m.sender_type === 'staff';
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-3xl px-5 py-3 text-sm font-medium shadow-sm ${
                            isStaff
                              ? 'bg-red-600 text-white rounded-br-none'
                              : 'bg-white/10 text-white rounded-bl-none border border-white/10'
                          }`}
                        >
                          <p>{m.message}</p>
                        </div>
                        <span className="text-[10px] text-white/40 font-semibold mt-1 px-1">
                          {isStaff ? 'Duty Officer' : m.guest_name} •{' '}
                          {new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={guestMsgEndRef} />
                </div>

                <div className="p-4 bg-[#0D0501] border-t border-white/10 flex gap-3">
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-2.5 rounded-xl outline-none transition-all flex-1 shadow-sm"
                    placeholder="Type reply to guest..."
                    value={guestReplyText}
                    onChange={(e) => setGuestReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendGuestReply()}
                  />
                  <button
                    onClick={sendGuestReply}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Send size={16} /> Send Reply
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/40 font-medium text-sm">
                Select a guest call thread from the left list.
              </div>
            )}
          </div>
        </div>
      )}

      {/* STAFF INTERNAL INTERCOM TAB */}
      {activeTab === 'staff' && (
        <div className="flex-1 flex flex-col bg-[#0D0501] border border-white/10 rounded-3xl overflow-hidden min-h-0 shadow-sm">
          {/* Department Channel Bar */}
          <div className="p-4 bg-[#1A0A02] border-b border-white/10 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-white/50 font-bold">Channel:</span>
              {(['all', 'front_desk', 'lounge', 'kitchen', 'housekeeping'] as const).map((dept) => (
                <button
                  key={dept}
                  onClick={() => setStaffDeptFilter(dept)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-sm ${
                    staffDeptFilter === dept
                      ? 'bg-[#D4A373] text-[#1A0A02] border border-white/10'
                      : 'bg-[#0D0501] text-white/50 hover:text-white border border-white/10'
                  }`}
                >
                  #{dept.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-white/50 font-bold">Sender Role:</label>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as StaffRole)}
                className="bg-[#0D0501] text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 shadow-sm focus:border-brown-500 outline-none font-medium"
              >
                {Object.entries(ROLE_PERMISSIONS).map(([rKey, rVal]) => (
                  <option key={rKey} value={rKey}>
                    {rVal.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#1A0A02]">
            {filteredStaffMessages.length === 0 ? (
              <div className="text-center py-16 text-white/40 text-sm font-medium">
                No internal messages in #{staffDeptFilter.replace('_', ' ')} channel.
              </div>
            ) : (
              filteredStaffMessages.map((m, idx) => (
                <div key={idx} className="flex flex-col items-start bg-[#0D0501] p-4 rounded-xl border border-white/10 shadow-sm max-w-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-serif text-white font-bold">{m.sender_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A0A02] text-[#D4A373] border border-white/10 uppercase tracking-wider font-mono font-bold">
                      {m.sender_role}
                    </span>
                    <span className="text-[10px] text-white/40 font-semibold uppercase">
                      #{m.department.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-white/80 font-medium">{m.message}</p>
                  <span className="text-[10px] text-white/40 font-semibold mt-2 flex items-center gap-1">
                    {new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    <CheckCircle size={10} className="text-emerald-500 ml-1" />
                  </span>
                </div>
              ))
            )}
            <div ref={staffMsgEndRef} />
          </div>

          {/* Active Typers Indicator */}
          {activeTypers.length > 0 && (
            <div className="px-6 py-2 text-xs font-medium text-[#D4A373] italic flex items-center gap-2 bg-[#1A0A02]">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#D4A373] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[#D4A373] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[#D4A373] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              {activeTypers.join(', ')} {activeTypers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}

          {/* Broadcast Input */}
          <div className="p-4 bg-[#1A0A02] border-t border-white/10 flex gap-3">
            <input
              type="text"
              className="w-full bg-[#0D0501] border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-2.5 rounded-xl outline-none transition-all flex-1 shadow-sm"
              placeholder={`Type message to #${staffDeptFilter.replace('_', ' ')} channel...`}
              value={staffInputText}
              onChange={(e) => handleStaffInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendStaffMessage()}
            />
            <button
              onClick={sendStaffMessage}
              className="bg-[#D4A373] text-[#1A0A02] hover:bg-[#b45309] font-bold py-2.5 px-8 rounded-xl transition-colors shadow-sm flex items-center gap-2"
            >
              <Send size={16} /> Send Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
