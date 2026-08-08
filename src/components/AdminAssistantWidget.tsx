'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Mic, MicOff, BookOpen, MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { useHotel } from '@/contexts/HotelContext';

export default function AdminAssistantWidget() {
  const { hotel } = useHotel();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'voice' | 'handbook'>('voice');
  
  // Voice & Chat State
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [textInput, setTextInput] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of chat
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // If we have a transcript when they stop talking, auto-send it
        if (transcript.trim().length > 0) {
          handleSendMessage(transcript);
          setTranscript('');
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, [transcript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const playNativeAudio = (base64Audio: string) => {
    try {
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      audio.play();
    } catch (error) {
      console.error('Failed to play native Gemini audio:', error);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !hotel) return;
    
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setTextInput('');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/admin/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: hotel.id,
          messages: newMessages
        })
      });

      const data = await response.json();
      
      if (data.text) {
        setMessages([...newMessages, { role: 'assistant', content: data.text }]);
        
        // Play the Gemini TTS Audio if available
        if (data.audio) {
          playNativeAudio(data.audio);
        }
      }
    } catch (error) {
      console.error('Assistant Error:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered a network error connecting to my brain.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-brown-600 to-brown-500 text-white rounded-full shadow-2xl hover:shadow-brown-500/50 hover:scale-105 transition-all focus:outline-none ${isOpen ? 'hidden' : 'flex items-center gap-2'}`}
      >
        <Sparkles size={24} />
        <span className="font-bold hidden md:inline">JoeBrown AI</span>
      </button>

      {/* Assistant Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[400px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-brown-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brown-900 to-[#3B1904] text-white">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-brown-400" />
              <h3 className="font-serif font-bold text-lg">JoeBrown AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-brown-200 hover:text-white transition-colors focus:outline-none">
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-brown-100 bg-brown-50/50">
            <button 
              onClick={() => setActiveTab('voice')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${activeTab === 'voice' ? 'text-brown-700 border-b-2 border-brown-600 bg-white' : 'text-slate-500 hover:bg-brown-100/50'}`}
            >
              <Mic size={16} /> Voice & Chat
            </button>
            <button 
              onClick={() => setActiveTab('handbook')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${activeTab === 'handbook' ? 'text-brown-700 border-b-2 border-brown-600 bg-white' : 'text-slate-500 hover:bg-brown-100/50'}`}
            >
              <BookOpen size={16} /> Manual
            </button>
          </div>

          {/* Tab Content: Voice & Chat */}
          {activeTab === 'voice' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-4 px-6">
                    <div className="w-16 h-16 bg-brown-100 text-brown-600 rounded-full flex items-center justify-center mb-2">
                      <Sparkles size={32} />
                    </div>
                    <p className="font-medium text-slate-700">Hi! I am your AI Staff Assistant.</p>
                    <p className="text-sm">You can ask me to "turn Heineken out of stock", "approve the new receptionist", or "check today's revenue".</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-brown-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2 text-brown-600">
                      <Loader2 size={16} className="animate-spin" /> <span className="text-sm text-slate-500 font-medium">Thinking...</span>
                    </div>
                  </div>
                )}
                {transcript && (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] p-3 rounded-2xl text-sm bg-brown-600/50 text-white rounded-tr-sm italic">
                      {transcript}...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Voice Control & Input */}
              <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex items-center justify-center mb-4">
                  <button
                    onClick={toggleListening}
                    disabled={isProcessing}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all focus:outline-none ${isListening ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/40 animate-pulse' : 'bg-brown-100 text-brown-600 hover:bg-brown-200 hover:scale-105'}`}
                  >
                    {isListening ? <Mic size={28} /> : <Mic size={28} />}
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(textInput)}
                    placeholder="Or type your command..."
                    className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 focus:outline-none"
                    disabled={isProcessing || isListening}
                  />
                  <button 
                    onClick={() => handleSendMessage(textInput)}
                    disabled={!textInput.trim() || isProcessing || isListening}
                    className="p-2.5 bg-slate-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors focus:outline-none"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Handbook */}
          {activeTab === 'handbook' && (
            <div className="flex-1 overflow-y-auto p-6 bg-white prose prose-sm prose-amber max-w-none">
              <h1 className="text-xl font-serif text-slate-900 font-bold mb-4">Admin Handbook</h1>
              
              <h2 className="text-lg font-bold text-brown-800 mt-6 mb-2">Getting Set Up</h2>
              <p className="text-slate-600 leading-relaxed mb-4">Ensure your Front Desk and Kitchen staff enable <strong>Push Notifications</strong> on their browser when logging in so they hear the "Ding" for incoming orders.</p>

              <h2 className="text-lg font-bold text-brown-800 mt-6 mb-2">Common Tasks</h2>
              
              <h3 className="font-bold text-slate-800 mt-4">1. Turn a Menu Item "Out of Stock"</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1 mb-4">
                <li>Go to <strong>Menu Items</strong> in the sidebar.</li>
                <li>Find the item you ran out of.</li>
                <li>Click the green toggle switch under "Stock". It will turn red, meaning guests can no longer order it.</li>
              </ul>

              <h3 className="font-bold text-slate-800 mt-4">2. Approve a New Staff Member</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1 mb-4">
                <li>Go to <strong>Staff Roles</strong>.</li>
                <li>Under "Pending Approvals", find their email.</li>
                <li>Select their Role (e.g., Receptionist) to instantly approve their access.</li>
              </ul>

              <h3 className="font-bold text-slate-800 mt-4">3. Handle Bank Transfer Orders</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1 mb-4">
                <li>Go to <strong>Restaurant & Lounge Orders</strong>.</li>
                <li>If payment is "Bank Transfer", click "View Receipt".</li>
                <li>If the receipt is valid, click "Confirm Payment" and prepare the food!</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}
