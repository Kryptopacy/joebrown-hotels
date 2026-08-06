'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Headset, Sparkles, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useHotel } from '@/contexts/HotelContext';
import toast from 'react-hot-toast';

export default function CustomerIntercom() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [roomOrTable, setRoomOrTable] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { hotel } = useHotel();
  const supabase = createClient();

  useEffect(() => {
    let sid = localStorage.getItem('joebrown_guest_sid');
    if (!sid) {
      sid = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('joebrown_guest_sid', sid);
    }
    setSessionId(sid);

    const storedName = localStorage.getItem('joebrown_guest_name') || '';
    const storedRoom = localStorage.getItem('joebrown_guest_room') || '';
    if (storedName) setGuestName(storedName);
    if (storedRoom) setRoomOrTable(storedRoom);

    fetchMessages(sid);

    const channel = supabase
      .channel(`customer_intercom_${sid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customer_intercom_messages',
          filter: `session_id=eq.${sid}`,
        },
        (payload) => {
          // Prevent duplicating the optimistic AI messages if we already synced them,
          // but for simplicity we let realtime handle incoming staff/AI messages
          if (payload.new.sender_type !== 'guest') {
            setMessages((prev) => {
              // Ensure we don't add duplicates
              if (prev.find(m => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const fetchMessages = async (sid: string) => {
    const { data } = await supabase
      .from('customer_intercom_messages')
      .select('*')
      .eq('session_id', sid)
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      setMessages(data);
    } else {
      setMessages([{
        id: 'welcome_msg',
        sender_type: 'ai',
        message: 'Welcome to Joebrown Palace Hotel! How can we assist you today?',
        created_at: new Date().toISOString()
      }]);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    if (!customText) setInputText('');

    let targetHotelId = hotel?.id;
    if (!targetHotelId || targetHotelId === 'joebrown-default-id') {
      const { data } = await supabase.from('hotels').select('id').eq('slug', 'joebrown').maybeSingle();
      if (data) targetHotelId = data.id;
    }

    const newMsg = {
      hotel_id: targetHotelId || 'joebrown-default-id',
      session_id: sessionId,
      guest_name: guestName || 'Guest',
      room_or_table: roomOrTable || 'Lobby/Web',
      sender_type: 'guest',
      message: textToSend,
    };

    // Optimistic UI update
    const optimisticId = 'opt_' + Date.now();
    const optimisticMsg = { ...newMsg, id: optimisticId, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    const { error } = await supabase.from('customer_intercom_messages').insert(newMsg);

    if (error) {
      toast.error('Failed to send message.');
      // Rollback optimistic message
      setMessages((prev) => prev.filter(m => m.id !== optimisticId));
    } else {
      // Trigger Web Push Notification to Admin Dashboard
      try {
        await fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `New Intercom Message`,
            body: `${newMsg.guest_name} (${newMsg.room_or_table}): ${newMsg.message}`,
            url: '/admin/intercom'
          })
        });
      } catch (err) {
        console.error('Failed to dispatch push notification', err);
      }
      
      setIsAiTyping(true);
      scrollToBottom();
      try {
        const res = await fetch('/api/intercom/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionId })
        });
        const data = await res.json();
        
        if (data.updatedProfile) {
          if (data.updatedProfile.name) {
            setGuestName(data.updatedProfile.name);
            localStorage.setItem('joebrown_guest_name', data.updatedProfile.name);
          }
          if (data.updatedProfile.room) {
            setRoomOrTable(data.updatedProfile.room);
            localStorage.setItem('joebrown_guest_room', data.updatedProfile.room);
          }
        }
      } catch (err) {
        console.error('AI Auto-reply ping failed', err);
      } finally {
        setIsAiTyping(false);
        scrollToBottom();
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button Positioned Cleanly on Bottom Right */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            scrollToBottom();
          }}
          className="btn-accent flex items-center gap-2 shadow-2xl rounded-full p-3.5 sm:px-5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:scale-105 transition-all border border-red-500/30"
          aria-label="Open Guest Intercom"
        >
          <Headset size={20} className="animate-pulse" />
          <span className="text-sm font-sans tracking-wide hidden sm:inline-block">Live Chat</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[90vw] max-w-sm sm:w-96 bg-[#FFFDF5] border border-brown-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px] animate-fade-in-up">
          {/* Header */}
          <div className="bg-brown-700 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center font-bold">
                <Headset size={20} />
              </div>
              <div>
                <h3 className="font-serif text-white text-base leading-tight font-semibold">Joebrown Intercom</h3>
                <p className="text-xs text-brown-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-ping"></span> Live Chat Connected
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-brown-100 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body: Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FFFCEB]">
            {messages.map((msg, idx) => {
              const isGuest = msg.sender_type === 'guest';
              const isAi = msg.sender_type === 'ai';
              return (
                <div
                  key={msg.id || idx}
                  className={`flex flex-col ${isGuest ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                      isGuest
                        ? 'bg-brown-700 text-white font-medium rounded-br-none shadow-sm'
                        : 'bg-white text-slate-900 rounded-bl-none border border-brown-300 shadow-sm'
                    }`}
                  >
                    <p>{msg.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1 font-medium flex items-center gap-1">
                    {isGuest ? 'You' : (isAi ? <><Sparkles size={10} className="text-brown-500"/> AI Concierge</> : 'Staff Concierge')} • {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            {isAiTyping && (
              <div className="flex flex-col items-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-white text-slate-900 rounded-bl-none border border-brown-300 shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-brown-500" />
                  <span className="text-slate-500 font-medium">Concierge is typing...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#FFFDF5] border-t border-brown-300 flex gap-2 items-center">
            <input
              type="text"
              className="w-full bg-[#FFFCEB] border border-brown-300 text-slate-900 text-sm px-3.5 h-10 rounded-lg focus:outline-none focus:border-brown-600 font-medium"
              placeholder="Type message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isAiTyping}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!inputText.trim() || isAiTyping}
              className="w-10 h-10 shrink-0 rounded-lg bg-brown-700 text-white flex items-center justify-center hover:bg-brown-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
