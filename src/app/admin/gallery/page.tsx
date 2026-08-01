'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Image as ImageIcon, CheckCircle2, XCircle, Edit, Plus, X, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '@/components/admin/ImageUpload';

export default function AdminGalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [randomize, setRandomize] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    display_order: 0,
    is_active: true
  });

  const supabase = createClient();

  useEffect(() => {
    fetchHotelAndImages();
  }, []);

  const fetchHotelAndImages = async () => {
    // Assuming 'joebrown' is the default hotel for this prototype
    const { data: hotelData } = await supabase
      .from('hotels')
      .select('id, gallery_randomize')
      .eq('slug', 'joebrown')
      .maybeSingle();

    if (hotelData) {
      setHotelId(hotelData.id);
      setRandomize(hotelData.gallery_randomize ?? true);
      fetchImages(hotelData.id);
    }
  };

  const fetchImages = async (hid: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('hotel_id', hid)
      .order('display_order', { ascending: true });
      
    if (data) setImages(data);
    setIsLoading(false);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setImages(images.map(img => img.id === id ? { ...img, is_active: newStatus } : img));
    
    const { error } = await supabase
      .from('gallery_images')
      .update({ is_active: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status.');
      setImages(images.map(img => img.id === id ? { ...img, is_active: currentStatus } : img));
    } else {
      toast.success(newStatus ? 'Image marked Active' : 'Image marked Hidden');
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === images.length - 1)) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    const newImages = [...images];
    const currentItem = { ...newImages[index] };
    const swapItem = { ...newImages[swapIndex] };

    // Swap display orders
    const tempOrder = currentItem.display_order;
    currentItem.display_order = swapItem.display_order;
    swapItem.display_order = tempOrder;

    // Handle edge case where both have the SAME display order
    if (currentItem.display_order === swapItem.display_order) {
      currentItem.display_order = direction === 'up' ? swapItem.display_order - 1 : swapItem.display_order + 1;
    }

    newImages[index] = currentItem;
    newImages[swapIndex] = swapItem;

    // Sort visually immediately
    newImages.sort((a, b) => a.display_order - b.display_order);
    setImages(newImages);

    // Persist to DB
    await Promise.all([
      supabase.from('gallery_images').update({ display_order: currentItem.display_order }).eq('id', currentItem.id),
      supabase.from('gallery_images').update({ display_order: swapItem.display_order }).eq('id', swapItem.id)
    ]);
  };

  const toggleRandomize = async () => {
    if (!hotelId) return;
    const newRandomize = !randomize;
    setRandomize(newRandomize);
    const { error } = await supabase.from('hotels').update({ gallery_randomize: newRandomize }).eq('id', hotelId);
    if (error) {
      toast.error('Failed to update setting');
      setRandomize(!newRandomize);
    } else {
      toast.success(newRandomize ? 'Gallery set to Randomize' : 'Gallery set to Display Order');
    }
  };

  const handleOpenModal = (img?: any) => {
    if (img) {
      setEditingImage(img);
      setFormData({
        title: img.title || '',
        url: img.url || '',
        display_order: img.display_order,
        is_active: img.is_active
      });
    } else {
      setEditingImage(null);
      setFormData({
        title: '',
        url: '',
        display_order: images.length > 0 ? Math.max(...images.map(i => i.display_order)) + 1 : 1,
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelId) return;
    if (!formData.url) {
      toast.error("Please upload an image first");
      return;
    }

    const payload = {
      hotel_id: hotelId,
      title: formData.title,
      url: formData.url,
      display_order: formData.display_order,
      is_active: formData.is_active
    };

    if (editingImage) {
      const oldImage = editingImage.url;
      const newImage = formData.url;

      const { data, error } = await supabase
        .from('gallery_images')
        .update(payload)
        .eq('id', editingImage.id)
        .select()
        .maybeSingle();
        
      if (error) toast.error(error.message);
      else {
        // Delete old image from storage if changed
        if (oldImage && oldImage !== newImage) {
          const parts = oldImage.split('/hotel-assets/');
          if (parts.length > 1) {
            await supabase.storage.from('hotel-assets').remove([parts[1]]);
          }
        }
        
        toast.success('Gallery image updated');
        setImages(images.map(i => i.id === editingImage.id ? data : i).sort((a, b) => a.display_order - b.display_order));
        setIsModalOpen(false);
      }
    } else {
      const { data, error } = await supabase
        .from('gallery_images')
        .insert(payload)
        .select()
        .maybeSingle();

      if (error) toast.error(error.message);
      else {
        toast.success('Gallery image added');
        setImages([...images, data].sort((a, b) => a.display_order - b.display_order));
        setIsModalOpen(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    
    const imgToDelete = images.find(i => i.id === id);
    
    const { error } = await supabase.from('gallery_images').delete().eq('id', id);
    if (!error) {
      // Delete from storage (Zombie image fix!)
      if (imgToDelete?.url) {
        const parts = imgToDelete.url.split('/hotel-assets/');
        if (parts.length > 1) {
          await supabase.storage.from('hotel-assets').remove([parts[1]]);
        }
      }
      
      toast.success('Image deleted successfully');
      setImages(images.filter(i => i.id !== id));
    } else {
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <ImageIcon size={28} className="text-[#D4A373]" />
          <div>
            <h1 className="text-3xl font-serif text-white font-bold">Gallery Manager</h1>
            <p className="text-sm text-white/50 font-medium mt-0.5">Control the images shown in the public Premium Gallery.</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
          <label className="flex items-center gap-3 cursor-pointer bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
            <input 
              type="checkbox" 
              className="form-checkbox h-4 w-4 text-[#D4A373] border-white/20 rounded focus:ring-brown-500 bg-[#1A0A02]" 
              checked={randomize} 
              onChange={toggleRandomize} 
            />
            <span className="text-sm text-white font-bold tracking-wide">Shuffle Randomly</span>
          </label>
          <button onClick={() => handleOpenModal()} className="w-full md:w-auto flex items-center justify-center gap-2 text-sm bg-[#D4A373] text-[#1A0A02] hover:bg-[#b45309] font-bold h-10 px-6 rounded-xl shadow-sm transition-colors whitespace-nowrap">
            <Plus size={16} /> Add Photo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-[#0D0501] border border-white/10 rounded-2xl p-4">
              <div className="w-full aspect-video bg-white/10 rounded-xl mb-4"></div>
              <div className="h-5 bg-white/10 rounded w-3/4 mb-4"></div>
              <div className="flex justify-between">
                <div className="w-16 h-8 bg-white/10 rounded-lg"></div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
                  <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))
        ) : images.length === 0 ? (
          <div className="col-span-full bg-[#0D0501] border border-white/10 rounded-3xl p-12 text-center">
            <ImageIcon size={48} className="text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Gallery Images</h3>
            <p className="text-white/50 mb-6 max-w-md mx-auto">Upload beautiful, high-quality photos of your property to impress potential guests.</p>
            <button onClick={() => handleOpenModal()} className="inline-flex items-center justify-center gap-2 text-sm bg-[#D4A373] text-[#1A0A02] hover:bg-[#b45309] font-bold h-10 px-6 rounded-xl shadow-sm transition-colors">
              <Plus size={16} /> Upload First Photo
            </button>
          </div>
        ) : (
          images.map((img, index) => (
            <div key={img.id} className="bg-[#0D0501] border border-white/10 rounded-2xl overflow-hidden group hover:border-[#D4A373]/50 transition-all shadow-sm flex flex-col">
              <div className="relative aspect-video w-full bg-black">
                <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-3 right-3 flex gap-2">
                   <button 
                      onClick={() => toggleStatus(img.id, img.is_active)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full border shadow-lg backdrop-blur-md transition-all ${
                        img.is_active 
                          ? 'bg-emerald-500/80 text-white border-emerald-400 hover:bg-emerald-600/90' 
                          : 'bg-red-500/80 text-white border-red-400 hover:bg-red-600/90'
                      }`}
                    >
                      {img.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {img.is_active ? 'Visible' : 'Hidden'}
                    </button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white mb-1 font-serif text-lg">{img.title || 'Untitled'}</h3>
                  <p className="text-xs text-white/40 mb-4 tracking-wider">ORDER: {img.display_order}</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveOrder(index, 'up')} disabled={index === 0} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors">
                      <ArrowUp size={16} />
                    </button>
                    <button onClick={() => moveOrder(index, 'down')} disabled={index === images.length - 1} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors">
                      <ArrowDown size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenModal(img)} className="text-white/40 hover:text-[#D4A373] bg-white/5 hover:bg-[#1A0A02] transition-colors p-2 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(img.id)} className="text-white/40 hover:text-red-500 bg-white/5 hover:bg-red-500/10 transition-colors p-2 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-[#0D0501] border border-white/10 rounded-3xl shadow-2xl w-full max-w-xl animate-fade-in-up">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-2xl font-serif text-white font-bold">{editingImage ? 'Edit Photo' : 'Upload Photo'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white/60 bg-white/5 hover:bg-white/10 rounded-full p-2 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Photo</label>
                <ImageUpload 
                    folder="gallery" 
                    defaultImage={formData.url} 
                    onUploadSuccess={(url) => setFormData({...formData, url})} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Title / Caption</label>
                <input type="text" className="w-full bg-[#1A0A02] border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all shadow-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Grand Reception" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Display Order</label>
                  <input type="number" required className="w-full bg-[#1A0A02] border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-3 rounded-xl outline-none transition-all shadow-sm" value={formData.display_order} onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Status</label>
                  <label className="flex items-center gap-3 cursor-pointer mt-3">
                    <input type="checkbox" className="form-checkbox h-5 w-5 text-[#D4A373] border-white/10 rounded focus:ring-brown-500 bg-[#1A0A02]" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                    <span className="text-sm text-white/80 font-medium">Visible to Public</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-white/50 font-bold hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" className="bg-[#D4A373] text-[#1A0A02] hover:bg-[#b45309] font-bold px-8 py-2.5 rounded-xl shadow-sm transition-colors">{editingImage ? 'Save Changes' : 'Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
