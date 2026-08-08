'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShoppingBag, Search, User, Clock, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPageHeader from '@/components/AdminPageHeader';

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['unpaid', 'transfer_submitted', 'paid', 'refunded'];

const STATUS_TABS = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered'];
const DEPT_TABS = ['all', 'kitchen', 'bar'];

const getOrderStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':  return 'bg-brown-500/200/10 text-blue-400 border-blue-500/30';
    case 'preparing':  return 'bg-brown-500/200/10 text-purple-400 border-purple-500/30';
    case 'ready':      return 'bg-brown-500/200/10 text-emerald-400 border-emerald-500/30';
    case 'delivered':  return 'bg-brown-500/200/10 text-green-400 border-green-500/30';
    case 'cancelled':  return 'bg-brown-500/200/10 text-red-400 border-red-500/30';
    default:           return 'bg-brown-500/200/10 text-orange-400 border-orange-500/30';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid':               return 'bg-brown-500/200/10 text-emerald-400 border-emerald-500/30';
    case 'transfer_submitted': return 'bg-[#D4A373]/10 text-[#D4A373] border-[#D4A373]/30';
    case 'refunded':           return 'bg-brown-500/200/10 text-white/40 border-white/10';
    default:                   return 'bg-brown-500/200/10 text-red-400 border-red-500/30';
  }
};

const formatTime = (ts: string) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  }).format(new Date(ts));
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // Status tab
  const [staffId, setStaffId] = useState<string | null>(null);
  const [deptTab, setDeptTab] = useState('all'); // Department tab
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [menuItemsMap, setMenuItemsMap] = useState<Record<string, string>>({});

  const supabase = createClient();

  useEffect(() => {
    fetchHotelAndOrders();
  }, []);

  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.4); // C6
      
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!hotelId) return;
    const channel = supabase
      .channel('admin_orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `hotel_id=eq.${hotelId}` },
        (payload) => {
          playChime();
          toast.success(`New order received: ${payload.new.order_number}`, { icon: '🛎️', duration: 8000 });
          fetchOrders(hotelId);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [hotelId, supabase]);

  const fetchHotelAndOrders = async () => {
    // Fetch menu items to map item IDs to types for department filtering
    const { data: menuData } = await supabase.from('menu_items').select('id, menu_categories(type)');
    if (menuData) {
      const map: Record<string, string> = {};
      menuData.forEach((m: any) => { map[m.id] = m.menu_categories?.type || 'food'; });
      setMenuItemsMap(map);
    }

    const { data: hotelData } = await supabase.from('hotels').select('id').eq('slug', 'joebrown').maybeSingle();
    if (hotelData) {
      setHotelId(hotelData.id);
      fetchOrders(hotelData.id);
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const { data: staffData } = await supabase.from('staff_users').select('id').eq('email', user.email).maybeSingle();
      if (staffData) setStaffId(staffData.id);
    }
  };

  const fetchOrders = async (hid: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('hotel_id', hid)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    if (error) toast.error('Failed to load orders');
    setIsLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
      toast.error('Failed to update order status');
    } else {
      toast.success(`Order marked as ${newStatus}`);
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newStatus } : o));
    const { error } = await supabase.from('orders').update({ payment_status: newStatus }).eq('id', orderId);
    if (error) {
      toast.error('Failed to update payment status');
    } else {
      toast.success(`Payment marked as ${newStatus.replace('_', ' ')}`);
    }
  };

  const claimOrder = async (orderId: string) => {
    if (!staffId) return;
    const { error } = await supabase.from('orders').update({ handled_by: staffId }).eq('id', orderId);
    if (error) {
      toast.error('Failed to claim order');
    } else {
      toast.success('Order claimed');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, handled_by: staffId } : o));
    }
  };

  const filtered = orders.filter(o => {
    const matchesStatus = activeTab === 'all' || o.status === activeTab;
    const matchesSearch =
      !searchTerm.trim() ||
      o.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
    let matchesDept = true;
    if (deptTab !== 'all') {
      const hasKitchen = (o.order_items || []).some((item: any) => {
        const type = menuItemsMap[item.menu_item_id];
        return type === 'food';
      });
      const hasBar = (o.order_items || []).some((item: any) => {
        const type = menuItemsMap[item.menu_item_id];
        return type === 'drink';
      });

      if (deptTab === 'kitchen') matchesDept = hasKitchen;
      if (deptTab === 'bar') matchesDept = hasBar;
    }

    return matchesStatus && matchesSearch && matchesDept;
  });

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <AdminPageHeader
        title="Restaurant & Lounge Orders"
        icon={ShoppingBag}
        breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Orders' }]}
        action={
          <div className="relative w-full md:w-72 mt-4 md:mt-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input
              type="text"
              placeholder="Search by guest or order #..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 h-10 py-0 bg-white/5 border border-white/10 focus:border-brown-500 text-white text-sm rounded-xl outline-none shadow-sm transition-all"
            />
          </div>
        }
      />

      {/* Department & Status Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 sm:pb-0">
          {DEPT_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setDeptTab(tab)}
              className={`whitespace-nowrap px-5 py-2 text-sm font-bold rounded-full transition-colors capitalize ${
                deptTab === tab
                  ? 'bg-[#D4A373] text-[#1A0A02] shadow-sm'
                  : 'bg-[#0D0501] text-white/50 hover:text-white hover:bg-[#1A0A02] border border-white/10'
              }`}
            >
              {tab === 'all' ? 'All Depts' : tab}
            </button>
          ))}
        </div>

        <div className="hidden sm:block w-px bg-brown-200 h-8 self-center"></div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 sm:pb-0">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 text-xs font-bold rounded-full transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-[#D4A373] text-[#1A0A02] shadow-sm border border-[#D4A373]'
                  : 'bg-[#0D0501] text-white/50 hover:text-white hover:bg-[#1A0A02] border border-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm overflow-x-auto min-h-[500px]">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-[#1A0A02] border-b border-white/10">
            <tr>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold sticky left-0 bg-[#1A0A02] z-10 border-r border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap">Order #</th>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold">Guest</th>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold">Room / Table</th>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold text-center">Items</th>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold">Total</th>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold">Payment</th>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold">Status</th>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold">Time</th>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold text-center">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-white/10">
                  <td className="p-4"><div className="h-4 bg-white/10 rounded w-16"></div></td>
                  <td className="p-4"><div className="h-4 bg-white/10 rounded w-32 mb-1"></div><div className="h-3 bg-white/5 rounded w-24"></div></td>
                  <td className="p-4"><div className="h-4 bg-white/10 rounded w-20"></div></td>
                  <td className="p-4"><div className="h-6 w-6 bg-white/10 rounded-full mx-auto"></div></td>
                  <td className="p-4"><div className="h-4 bg-white/10 rounded w-16"></div></td>
                  <td className="p-4"><div className="h-6 bg-white/10 rounded-full w-24 mx-auto"></div></td>
                  <td className="p-4"><div className="h-6 bg-white/10 rounded-full w-24 mx-auto"></div></td>
                  <td className="p-4"><div className="h-4 bg-white/10 rounded w-24"></div></td>
                  <td className="p-4"><div className="h-4 w-4 bg-white/10 rounded mx-auto"></div></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="p-8 text-center text-white/50 font-medium">No orders found.</td></tr>
            ) : (
              filtered.map(order => (
                <React.Fragment key={order.id}>
                  {/* Main Row */}
                  <tr className="hover:bg-white/5 transition-colors group relative">
                    <td className="p-4 sticky left-0 bg-[#0D0501] group-hover:bg-white/5 z-10 border-r border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap transition-colors">
                      <span className="text-[#D4A373] font-mono font-bold text-xs">{order.order_number}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <User size={14} className="text-white/40" /> {order.guest_name}
                      </div>
                    </td>
                    <td className="p-4 text-white/60 font-medium text-sm">{order.room_or_table || '—'}</td>
                    <td className="p-4 text-center">
                      <span className="bg-brown-500/20 text-brown-300 border border-white/10 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold mx-auto">
                        {order.order_items?.length || 0}
                      </span>
                    </td>
                    <td className="p-4 text-white font-serif font-bold">₦{Number(order.total_amount).toLocaleString()}</td>
                    <td className="p-4 text-center">
                      {order.handled_by ? (
                        <div className="flex gap-2">
                          <select
                            value={order.payment_status}
                            onChange={e => updatePaymentStatus(order.id, e.target.value)}
                            className={`text-[10px] font-bold appearance-none cursor-pointer w-full text-center py-1 px-1 rounded border transition-all hover:brightness-95 focus:outline-none ${getPaymentStatusColor(order.payment_status)}`}
                          >
                            {PAYMENT_STATUSES.map(s => (
                              <option key={s} value={s} className="bg-[#0D0501] text-white capitalize">{s.replace('_', ' ')}</option>
                            ))}
                          </select>
                          <select
                            value={order.status}
                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                            className={`text-[10px] font-bold appearance-none cursor-pointer w-full text-center py-1 px-1 rounded border transition-all hover:brightness-95 focus:outline-none ${getOrderStatusColor(order.status)}`}
                          >
                            {ORDER_STATUSES.map(s => (
                              <option key={s} value={s} className="bg-[#0D0501] text-white capitalize">{s}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); claimOrder(order.id); }}
                          className="bg-[#D4A373] hover:bg-[#b45309] text-[#1A0A02] text-[10px] font-bold py-1 px-3 rounded-full flex items-center justify-center gap-1 mx-auto transition-colors"
                        >
                          Claim
                        </button>
                      )}
                    </td>
                    {/* Empty cells since we merged status and payment */}
                    <td className="p-4"></td>
                    <td className="p-4 text-white/50 font-medium text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1"><Clock size={12} /> {formatTime(order.created_at)}</div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        className="text-white/40 hover:text-[#D4A373] transition-colors p-1"
                      >
                        {expandedId === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedId === order.id && (
                    <tr className="bg-[#0D0501]">
                      <td colSpan={9} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Items */}
                          <div>
                            <h4 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-3">Order Items</h4>
                            <div className="space-y-2">
                              {(order.order_items || []).map((item: any) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                  <span className="text-white font-medium">{item.item_name} <span className="text-white/50 font-semibold">×{item.quantity}</span></span>
                                  <span className="text-[#D4A373] font-bold">₦{(Number(item.item_price) * item.quantity).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between mt-3 pt-3 border-t border-white/10">
                              <span className="text-white font-bold text-sm">Total</span>
                              <span className="text-[#D4A373] font-serif font-bold">₦{Number(order.total_amount).toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-2">Guest Details</h4>
                              <p className="text-white text-sm font-bold">{order.guest_name}</p>
                              {order.room_or_table && <p className="text-white/60 font-medium text-xs mt-1">{order.room_or_table}</p>}
                            </div>

                            {order.special_instructions && (
                              <div>
                                <h4 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-2">Special Instructions</h4>
                                <p className="text-white/80 text-sm bg-[#0D0501] border border-white/10 rounded-lg p-3 shadow-sm">{order.special_instructions}</p>
                              </div>
                            )}

                            {order.payment_screenshot_url && (
                              <div>
                                <h4 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-2">Payment Screenshot</h4>
                                <a
                                  href={order.payment_screenshot_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-[#D4A373] hover:text-[#D4A373] font-bold text-sm underline"
                                >
                                  <ExternalLink size={14} /> View Screenshot
                                </a>
                                <img
                                  src={order.payment_screenshot_url}
                                  alt="Payment Screenshot"
                                  className="mt-2 max-h-40 rounded-lg border border-white/10 object-cover shadow-sm"
                                />
                                {order.payment_status === 'transfer_submitted' && (
                                  <button
                                    onClick={() => updatePaymentStatus(order.id, 'paid')}
                                    className="mt-3 px-4 py-2 bg-[#D4A373] hover:bg-[#b45309] text-[#1A0A02] font-bold rounded-lg transition-colors flex items-center gap-2 text-sm"
                                  >
                                    Verify Payment & Mark as Paid
                                  </button>
                                )}
                              </div>
                            )}

                            <div>
                              <h4 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-2">Tracking Link</h4>
                              <a
                                href={`/orders/${order.order_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:text-brown-300 font-bold text-sm underline"
                              >
                                <ExternalLink size={14} /> /orders/{order.order_number}
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
