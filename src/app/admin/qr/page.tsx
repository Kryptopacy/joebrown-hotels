'use client';

import React, { useState } from 'react';
import { QrCode, Printer, Plus, Trash2, Download, ToggleLeft, ToggleRight } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';

type QRItem = {
  id: string;
  num: string;
  section: string;
  url: string;
  type: 'table' | 'room' | 'page' | 'desk';
};

export default function AdminQRPage() {
  const [tables, setTables] = useState<QRItem[]>([]);
  const [newTableNum, setNewTableNum] = useState('');
  const [newSection, setNewSection] = useState('');
  const [qrType, setQrType] = useState<'table' | 'room' | 'page' | 'desk'>('table');
  
  // Simple mode: outputs raw QR only (no branded card)
  const [simpleMode, setSimpleMode] = useState(false);

  const BASE_URL = 'https://joebrown-hotel.vercel.app/menu';

  const generateQRCode = (num: string, type: 'table' | 'room' | 'page' | 'desk') => {
    let url = '';
    if (type === 'page') {
      const rootUrl = BASE_URL.replace('/menu', '');
      url = `${rootUrl}${num.startsWith('/') ? num : '/' + num}`;
    } else {
      url = `${BASE_URL}?${type}=${encodeURIComponent(num)}`;
    }
    return url;
  };

  const addTable = async () => {
    if (!newTableNum.trim()) return;
    
    if (tables.some(t => t.num === newTableNum && t.type === qrType)) {
      toast.error(`This ${qrType} identifier already exists in session.`);
      return;
    }

    const qrUrl = generateQRCode(newTableNum, qrType);
    
    setTables(prev => [...prev, { 
      id: Math.random().toString(36).substring(7), 
      num: newTableNum.trim(), 
      section: newSection.trim(), 
      url: qrUrl,
      type: qrType
    }]);
    
    setNewTableNum('');
    setNewSection('');
    toast.success('QR code generated.');
  };

  const removeTable = (id: string) => {
    setTables(tables.filter(t => t.id !== id));
  };

  const downloadQR = (item: QRItem) => {
    const canvas = document.getElementById(`qr-canvas-${item.id}`) as HTMLCanvasElement;
    if (!canvas) {
      toast.error('Could not generate image');
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `joebrown-qr-${item.type}-${item.num.replace(/\//g, '')}.png`;
    a.click();
  };

  const handlePrint = () => window.print();

  const labelFor = (item: QRItem) => {
    if (item.type === 'page') return 'Scan to Visit';
    if (item.type === 'desk') return 'Desk Payment';
    return `${item.type === 'table' ? 'Table' : 'Room'} ${item.num}`;
  };

  const subLabelFor = (item: QRItem) => {
    if (item.type === 'page') return `Visit ${item.num}`;
    if (item.type === 'desk') return 'Scan to pay at desk';
    return 'Scan to view menu & order';
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; display: grid !important; grid-template-columns: repeat(${simpleMode ? '4' : '2'}, 1fr) !important; gap: ${simpleMode ? '12px' : '20px'} !important; padding: 20px !important; }
          .no-print { display: none !important; }
          .print-break { break-inside: avoid; }
        }
      `}} />
      
      {/* Controls */}
      <div className="animate-fade-in-up md:max-w-4xl no-print">
        <div className="flex justify-between items-start md:items-center mb-6">
          <div className="flex items-center gap-3">
            <QrCode size={28} className="text-[#D4A373]" />
            <h1 className="text-3xl font-serif text-white font-bold">QR Code Generator</h1>
          </div>
          <button 
            onClick={handlePrint}
            disabled={tables.length === 0}
            className="flex items-center gap-2 text-sm bg-[#D4A373] text-[#1A0A02] hover:bg-[#b45309] font-bold px-6 py-2.5 rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer size={16} /> Print Sheet
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-4 mb-5 bg-white/5 border border-white/10 rounded-2xl p-4 shadow-sm">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-sm font-bold ${!simpleMode ? 'text-white' : 'text-white/40'}`}>Branded Mode</span>
              <span className="text-xs bg-white/10 text-white font-bold px-2 py-0.5 rounded-full">Default</span>
            </div>
            <p className="text-xs text-white/50">Full Joebrown branded card with logo, label, and print-ready styling</p>
          </div>

          <button
            onClick={() => setSimpleMode(s => !s)}
            className="flex items-center gap-2 transition-all"
            aria-label="Toggle simple mode"
          >
            {simpleMode
              ? <ToggleRight size={40} className="text-brown-600" />
              : <ToggleLeft size={40} className="text-slate-300" />
            }
          </button>

          <div className="flex-1 text-right">
            <div className="flex items-center gap-2 justify-end mb-0.5">
              <span className="text-xs bg-white/10 text-white/50 font-bold px-2 py-0.5 rounded-full">Plain</span>
              <span className={`text-sm font-bold ${simpleMode ? 'text-white' : 'text-white/40'}`}>Simple Mode</span>
            </div>
            <p className="text-xs text-white/50">Raw QR code only — use with your own graphic, signage, or template</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 shadow-sm rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-auto">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Type</label>
            <select 
              value={qrType} 
              onChange={(e) => setQrType(e.target.value as 'table' | 'room' | 'page' | 'desk')}
              className="w-full md:w-36 bg-black/60 border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all shadow-sm font-bold"
            >
              <option value="table">Table</option>
              <option value="room">Room</option>
              <option value="desk">Desk Pay</option>
              <option value="page">Page Slug</option>
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
              {qrType === 'room' ? 'Room Name / Num' : qrType === 'table' ? 'Table Name / Num' : qrType === 'desk' ? 'Desk Name' : 'Page Slug'}
            </label>
            <input 
              type="text" 
              list={qrType === 'page' ? "page-slug-presets" : undefined}
              className="w-full bg-black/60 border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all shadow-sm" 
              placeholder={qrType === 'room' ? "e.g. Presidential Suite or 304" : qrType === 'table' ? "e.g. 12 or VIP Lounge" : qrType === 'desk' ? "e.g. Front Desk" : "e.g. /spa"} 
              value={newTableNum}
              onChange={(e) => setNewTableNum(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTable()}
            />
            {qrType === 'page' && (
              <datalist id="page-slug-presets">
                <option value="/rooms">Rooms & Suites</option>
                <option value="/menu">Restaurant & Lounge Menu</option>
                <option value="/contact">Contact & Location</option>
                <option value="/privacy">Privacy Policy</option>
                <option value="/terms">Terms of Service</option>
              </datalist>
            )}
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Section (Optional)</label>
            <input 
              type="text" 
              className="w-full bg-black/60 border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all shadow-sm" 
              placeholder="e.g. Garden Lounge"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTable()}
            />
          </div>
          <button onClick={addTable} className="bg-white/10 hover:bg-white/20 text-white font-bold h-[46px] w-full md:w-auto px-8 rounded-xl shadow-sm transition-colors whitespace-nowrap flex items-center justify-center gap-2">
            <Plus size={18} /> Generate
          </button>
        </div>
      </div>

      {/* Output Grid */}
      <div id="print-area" className={`grid gap-6 animate-fade-in-up ${simpleMode ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {tables.length === 0 && (
          <div className="col-span-full py-12 text-center text-white/40 font-medium border border-dashed border-brown-200 rounded-xl no-print bg-white/50">
            Generate your first QR code to see it here.
          </div>
        )}
        
        {tables.map(item => (
          simpleMode ? (
            // ── SIMPLE MODE CARD ────────────────────────────────
            <div key={item.id} className="relative group bg-white border border-brown-100 rounded-xl p-3 flex flex-col items-center gap-2 print-break shadow-sm">
              {/* Actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                <button onClick={() => downloadQR(item)} className="p-1.5 bg-brown-50 text-[#D4A373] rounded-lg hover:bg-brown-100 transition-colors" title="Download PNG">
                  <Download size={13} />
                </button>
                <button onClick={() => removeTable(item.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Remove">
                  <Trash2 size={13} />
                </button>
              </div>
              {/* Raw QR */}
              <QRCodeCanvas
                id={`qr-canvas-${item.id}`}
                value={item.url}
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#b45309"}
                level={"H"}
                includeMargin={false}
                className="w-full aspect-square"
              />
              <p className="text-[10px] text-white/40 font-mono truncate w-full text-center">{item.type}/{item.num}</p>
            </div>
          ) : (
            // ── BRANDED MODE CARD ───────────────────────────────
            <div key={item.id} className="bg-white border-2 border-brown-200 shadow-md rounded-2xl p-8 flex flex-col items-center justify-center print-break relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brown-400 to-brown-600" />
              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                <button onClick={() => downloadQR(item)} className="p-2 bg-brown-50 text-[#D4A373] rounded-lg hover:bg-brown-100 transition-colors" title="Download PNG">
                  <Download size={14} />
                </button>
                <button onClick={() => removeTable(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Remove">
                  <Trash2 size={14} />
                </button>
              </div>
              {/* Branding */}
              <div className="h-12 mb-3">
                <img src="/jb_logo_transparent.PNG" alt="Joebrown Logo" className="w-full h-full object-contain" />
              </div>
              {item.section && (
                <p className="text-[10px] font-sans text-brown-600 uppercase tracking-widest mb-5 font-bold bg-brown-50 px-3 py-1 rounded-full">{item.section}</p>
              )}
              {/* QR */}
              <div className="bg-white p-3 border-[3px] border-brown-600 shadow-sm rounded-xl relative mt-4">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brown-600 text-white px-3 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-extrabold whitespace-nowrap shadow-md">
                  SCAN ME ↓
                </div>
                <QRCodeCanvas
                  id={`qr-canvas-${item.id}`}
                  value={item.url}
                  size={192}
                  bgColor={"#ffffff"}
                  fgColor={"#b45309"}
                  level={"H"}
                  includeMargin={false}
                  imageSettings={{
                    src: "/jb_logo_without_caption_transparent.PNG",
                    height: 44,
                    width: 44,
                    excavate: true,
                  }}
                />
              </div>
              {/* Label */}
              <div className="mt-5 bg-slate-900 text-brown-400 px-6 py-2.5 rounded-full font-serif font-bold text-xl shadow-md capitalize text-center w-full">
                {labelFor(item)}
              </div>
              <p className="text-[11px] text-slate-500 mt-4 uppercase tracking-wider text-center max-w-[200px] font-semibold">
                {subLabelFor(item)}
              </p>
            </div>
          )
        ))}
      </div>
    </>
  );
}
