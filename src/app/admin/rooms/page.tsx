'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BedDouble, CheckCircle2, XCircle, Search, Edit, Plus, X, Trash2, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '@/components/admin/ImageUpload';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price_per_night: '',
    max_guests: '2',
    size_sqm: '',
    amenities: '', // Will be stored as comma separated string in form, JSON in DB
    images: [] as string[],
    is_featured: false
  });

  const supabase = createClient();

  useEffect(() => {
    fetchHotelIdAndRooms();
  }, []);

  const fetchHotelIdAndRooms = async () => {
    // Assuming 'joebrown' is the default hotel for this prototype
    const { data: hotelData } = await supabase
      .from('hotels')
      .select('id')
      .eq('slug', 'joebrown')
      .maybeSingle();

    if (hotelData) {
      setHotelId(hotelData.id);
      fetchRooms(hotelData.id);
    }
  };

  const fetchRooms = async (hid: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hid)
      .order('display_order', { ascending: true });
      
    if (data) setRooms(data);
    setIsLoading(false);
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setRooms(rooms.map(r => r.id === id ? { ...r, is_available: newStatus } : r));
    
    const { error } = await supabase
      .from('rooms')
      .update({ is_available: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update room status.');
      setRooms(rooms.map(r => r.id === id ? { ...r, is_available: currentStatus } : r));
    } else {
      toast.success(newStatus ? 'Room marked Available' : 'Room marked Unavailable');
    }
  };

  const toggleCleaningStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'dirty' ? 'clean' : 'dirty';
    setRooms(rooms.map(r => r.id === id ? { ...r, cleaning_status: newStatus } : r));
    
    const { error } = await supabase
      .from('rooms')
      .update({ cleaning_status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update cleaning status.');
      setRooms(rooms.map(r => r.id === id ? { ...r, cleaning_status: currentStatus } : r));
    } else {
      toast.success(`Room marked as ${newStatus}`);
    }
  };

  const handleOpenModal = (room?: any) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        slug: room.slug,
        description: room.description || '',
        price_per_night: room.price_per_night.toString(),
        max_guests: room.max_guests?.toString() || '2',
        size_sqm: room.size_sqm?.toString() || '',
        amenities: room.amenities ? room.amenities.join(', ') : '',
        images: room.images || [],
        is_featured: room.is_featured || false
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        price_per_night: '',
        max_guests: '2',
        size_sqm: '',
        amenities: '',
        images: [],
        is_featured: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelId) return;

    // Process amenities
    const amenitiesList = formData.amenities.split(',').map(a => a.trim()).filter(a => a);

    const payload = {
      hotel_id: hotelId,
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description,
      price_per_night: parseFloat(formData.price_per_night),
      max_guests: parseInt(formData.max_guests),
      size_sqm: parseInt(formData.size_sqm) || null,
      amenities: amenitiesList,
      images: formData.images,
      is_featured: formData.is_featured
    };

    if (editingRoom) {
      // Find removed images
      const removedImages = editingRoom.images?.filter((img: string) => !formData.images.includes(img)) || [];

      // Update
      const { data, error } = await supabase
        .from('rooms')
        .update(payload)
        .eq('id', editingRoom.id)
        .select()
        .maybeSingle();
        
      if (error) toast.error(error.message);
      else {
        // Delete removed images from storage
        if (removedImages.length > 0) {
          const pathsToDelete = removedImages
            .map((url: string) => {
              const parts = url.split('/hotel-assets/');
              return parts.length > 1 ? parts[1] : null;
            })
            .filter(Boolean) as string[];
            
          if (pathsToDelete.length > 0) {
            await supabase.storage.from('hotel-assets').remove(pathsToDelete);
          }
        }
        
        toast.success('Room updated successfully');
        setRooms(rooms.map(r => r.id === editingRoom.id ? data : r));
        setIsModalOpen(false);
      }
    } else {
      // Insert
      const { data, error } = await supabase
        .from('rooms')
        .insert(payload)
        .select()
        .maybeSingle();

      if (error) toast.error(error.message);
      else {
        toast.success('Room added successfully');
        setRooms([...rooms, data]);
        setIsModalOpen(false);
      }
    }
  };

  const handleImageUpload = (url: string) => {
    if (url) {
      setFormData({ ...formData, images: [...formData.images, url] });
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...formData.images];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    setFormData({ ...formData, images: newImages });
  };

  const makeCoverImage = (index: number) => {
    if (index === 0) return;
    const newImages = [...formData.images];
    const selected = newImages.splice(index, 1)[0];
    newImages.unshift(selected);
    setFormData({ ...formData, images: newImages });
    toast.success('Set as primary cover photo');
  };

  const deleteRoom = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this room? This cannot be undone.');
    if (!confirmDelete) return;

    const roomToDelete = rooms.find(r => r.id === id);

    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete room');
    } else {
      // Delete images from storage
      if (roomToDelete?.images && roomToDelete.images.length > 0) {
        const pathsToDelete = roomToDelete.images
          .map((url: string) => {
            const parts = url.split('/hotel-assets/');
            return parts.length > 1 ? parts[1] : null;
          })
          .filter(Boolean) as string[];
          
        if (pathsToDelete.length > 0) {
          await supabase.storage.from('hotel-assets').remove(pathsToDelete);
        }
      }
      
      toast.success('Room deleted');
      setRooms(rooms.filter(r => r.id !== id));
    }
  };

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'available' && r.is_available) || 
                          (statusFilter === 'hidden' && !r.is_available);
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: rooms.length,
    available: rooms.filter(r => r.is_available).length,
    hidden: rooms.filter(r => !r.is_available).length,
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <BedDouble size={28} className="text-[#D4A373]" />
          <h1 className="text-3xl font-serif text-white font-bold">Rooms Manager</h1>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input 
              type="text" 
              placeholder="Search rooms..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 h-10 py-0 bg-[#0D0501] border border-white/10 focus:border-brown-500 text-white text-sm rounded-lg outline-none shadow-sm transition-all"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 text-sm bg-[#D4A373] text-[#1A0A02] hover:bg-[#b45309] font-bold h-10 px-6 rounded-xl shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus size={16} /> Add Room
          </button>
        </div>
      </div>

      {/* Status Chip Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none">
        {([
          { key: 'all', label: 'All Rooms', color: 'slate' },
          { key: 'available', label: '✅ Available', color: 'emerald' },
          { key: 'hidden', label: '🚫 Hidden', color: 'red' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              statusFilter === key
                ? 'bg-[#D4A373] text-[#1A0A02] border-[#D4A373]'
                : 'bg-[#0D0501] text-white/60 border-white/10 hover:border-brown-400 hover:text-[#D4A373]'
            }`}
          >
            {label}
            <span className={`ml-1.5 text-[10px] ${statusFilter === key ? 'text-white/30' : 'text-white/40'}`}>
              ({statusCounts[key]})
            </span>
          </button>
        ))}
      </div>

      <div className="bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm overflow-x-auto min-h-[400px]">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-[#1A0A02] border-b border-white/10">
            <tr>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold sticky left-0 bg-[#1A0A02] z-10 border-r border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap">Room Info</th>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold">Price / Night</th>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold">Capacity</th>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold text-center">Availability</th>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold text-center">Cleaning</th>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-white/10">
                  <td className="p-4"><div className="flex items-center gap-4"><div className="w-16 h-12 bg-white/10 rounded-lg shrink-0"></div><div><div className="h-4 bg-white/10 rounded w-32 mb-1.5"></div><div className="h-3 bg-white/5 rounded w-20"></div></div></div></td>
                  <td className="p-4"><div className="h-4 bg-white/10 rounded w-24"></div></td>
                  <td className="p-4"><div className="h-4 bg-white/10 rounded w-16"></div></td>
                  <td className="p-4"><div className="h-6 bg-white/10 rounded-full w-20 mx-auto"></div></td>
                  <td className="p-4"><div className="flex gap-2 justify-end"><div className="w-8 h-8 bg-white/10 rounded-lg"></div><div className="w-8 h-8 bg-white/10 rounded-lg"></div></div></td>
                </tr>
              ))
            ) : filteredRooms.length === 0 ? (
               <tr><td colSpan={6} className="p-8 text-center text-white/50 font-medium">No rooms found.</td></tr>
            ) : (
              filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-white/5 transition-colors group relative">
                  <td className="p-4 sticky left-0 bg-[#0D0501] group-hover:bg-white/5 z-10 border-r border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-lg bg-[#1A0A02] overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
                        {room.images && room.images.length > 0 ? 
                          <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" /> : 
                          <BedDouble size={16} className="text-white/30" />
                        }
                      </div>
                      <div>
                        <div className="font-bold text-white mb-0.5">{room.name}</div>
                        <div className="text-xs text-white/50 font-mono">{room.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-[#D4A373] font-serif font-bold">₦{room.price_per_night.toLocaleString()}</td>
                  <td className="p-4 text-white/60 text-sm font-medium">{room.max_guests} Guests</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => toggleAvailability(room.id, room.is_available)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                        room.is_available 
                          ? 'bg-brown-500/200/20 text-emerald-300 border-emerald-500/30 hover:bg-brown-500/200/30' 
                          : 'bg-brown-500/200/20 text-red-300 border-red-500/30 hover:bg-brown-500/200/30'
                      }`}
                    >
                      {room.is_available ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {room.is_available ? 'Available' : 'Hidden'}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => toggleCleaningStatus(room.id, room.cleaning_status || 'clean')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                        (!room.cleaning_status || room.cleaning_status === 'clean') 
                          ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' 
                          : 'bg-brown-500/200/20 text-orange-300 border-orange-500/30 hover:bg-brown-500/200/30'
                      }`}
                    >
                      {(!room.cleaning_status || room.cleaning_status === 'clean') ? 'Clean' : 'Dirty'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                        onClick={() => handleOpenModal(room)}
                        className="text-white/40 hover:text-[#D4A373] transition-colors p-2 rounded-lg hover:bg-[#1A0A02]" 
                        aria-label="Edit room"
                        >
                        <Edit size={16} />
                        </button>
                        <button 
                        onClick={() => deleteRoom(room.id)}
                        className="text-white/40 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-brown-500/20" 
                        aria-label="Delete room"
                        >
                        <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-[#0D0501] border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="sticky top-0 bg-[#0D0501] z-10 p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-2xl font-serif text-white font-bold">{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white/60 bg-white/5 hover:bg-brown-500/20 rounded-full p-2 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Room Name *</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all shadow-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Deluxe Ocean Suite" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">URL Slug *</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all shadow-sm" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="e.g. deluxe-ocean-suite" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Price per Night (₦) *</label>
                  <input required type="number" step="0.01" className="w-full bg-white/5 border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all shadow-sm" value={formData.price_per_night} onChange={e => setFormData({...formData, price_per_night: e.target.value})} placeholder="e.g. 50000" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Max Guests *</label>
                    <input required type="number" className="w-full bg-white/5 border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all shadow-sm" value={formData.max_guests} onChange={e => setFormData({...formData, max_guests: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Size (sqm)</label>
                    <input type="number" className="w-full bg-white/5 border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all shadow-sm" value={formData.size_sqm} onChange={e => setFormData({...formData, size_sqm: e.target.value})} placeholder="e.g. 45" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="is_featured" 
                  checked={formData.is_featured} 
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  className="w-5 h-5 accent-brown-500 rounded focus:ring-brown-500 bg-white/5 border-white/10"
                />
                <label htmlFor="is_featured" className="text-sm font-bold text-white">Feature on Landing Page</label>
                <span className="text-xs text-white/50 ml-2">(Check this to display this room on the main home page)</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Description</label>
                <textarea className="w-full bg-white/5 border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all shadow-sm min-h-[100px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="A highly descriptive text bringing the room to life..."></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Amenities (Comma separated)</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all shadow-sm" value={formData.amenities} onChange={e => setFormData({...formData, amenities: e.target.value})} placeholder="WiFi, King Bed, Ocean View, Mini Bar" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 border-b border-white/10 pb-2 mb-4">Room Photos</label>
                
                <div className="mb-4">
                  <ImageUpload folder="rooms" onUploadSuccess={handleImageUpload} />
                </div>

                {formData.images.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>The 1st photo is automatically the <strong>Primary Cover Image</strong> across the website.</span>
                      <span>{formData.images.length} photo{formData.images.length > 1 ? 's' : ''} uploaded</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className={`relative aspect-video rounded-xl overflow-hidden border ${idx === 0 ? 'border-[#D4A373] ring-2 ring-[#D4A373]/30' : 'border-white/10'} shadow-sm group bg-white/5`}>
                          <img src={img} alt={`Room preview ${idx + 1}`} className="w-full h-full object-cover" />
                          
                          {idx === 0 && (
                            <div className="absolute top-2 left-2 bg-[#D4A373] text-[#1A0A02] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md z-10 flex items-center gap-1">
                              <Star size={10} className="fill-current" /> Cover
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 z-20">
                            <div className="flex items-center gap-1.5">
                              {idx > 0 && (
                                <button 
                                  type="button" 
                                  onClick={() => moveImage(idx, 'left')} 
                                  title="Move Left" 
                                  className="bg-white/20 hover:bg-white/40 text-white p-1.5 rounded-lg transition-colors"
                                >
                                  <ChevronLeft size={14} />
                                </button>
                              )}
                              {idx !== 0 && (
                                <button 
                                  type="button" 
                                  onClick={() => makeCoverImage(idx)} 
                                  title="Set as Main Cover Photo" 
                                  className="bg-[#D4A373] hover:bg-[#b45309] text-[#1A0A02] p-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 text-[11px]"
                                >
                                  <Star size={12} />
                                </button>
                              )}
                              {idx < formData.images.length - 1 && (
                                <button 
                                  type="button" 
                                  onClick={() => moveImage(idx, 'right')} 
                                  title="Move Right" 
                                  className="bg-white/20 hover:bg-white/40 text-white p-1.5 rounded-lg transition-colors"
                                >
                                  <ChevronRight size={14} />
                                </button>
                              )}
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeImage(idx)} 
                              title="Delete Photo" 
                              className="bg-red-500/80 hover:bg-red-600 text-white px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl text-white/50 font-bold hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-[#D4A373] text-[#1A0A02] hover:bg-[#b45309] font-bold px-8 py-2.5 rounded-xl shadow-sm transition-colors">{editingRoom ? 'Save Changes' : 'Create Room'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
