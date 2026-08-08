'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UtensilsCrossed, CheckCircle2, XCircle, Search, Edit, Plus, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '@/components/admin/ImageUpload';
import AdminPageHeader from '@/components/AdminPageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminMenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hotelId, setHotelId] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'food' | 'drink'>('food');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'food' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true
  });

  const supabase = createClient();

  useEffect(() => {
    fetchHotelAndData();
  }, []);

  const fetchHotelAndData = async () => {
    // Fetch Joebrown Palace Hotels & Lounge property ID
    const { data: hotelData } = await supabase.from('hotels').select('id').eq('slug', 'joebrown').maybeSingle();
    if (hotelData) {
      setHotelId(hotelData.id);
      fetchCategories(hotelData.id);
      fetchItems(hotelData.id);
    }
  };

  const fetchCategories = async (hid: string) => {
    const { data } = await supabase.from('menu_categories').select('*').eq('hotel_id', hid).order('display_order');
    if (data) setCategories(data);
  };

  const fetchItems = async (hid: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('hotel_id', hid)
      .order('display_order');
      
    if (data) setItems(data);
    setIsLoading(false);
  };

  const toggleStock = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setItems(items.map(i => i.id === id ? { ...i, is_available: newStatus } : i));
    
    const { error } = await supabase.from('menu_items').update({ is_available: newStatus }).eq('id', id);

    if (error) {
      toast.error('Failed to update stock status.');
      setItems(items.map(i => i.id === id ? { ...i, is_available: currentStatus } : i));
    } else {
      toast.success(newStatus ? 'Item marked In Stock' : 'Item marked Out of Stock');
    }
  };

  const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setCategories(categories.map(c => c.id === id ? { ...c, is_active: newStatus } : c));
    
    const { error } = await supabase.from('menu_categories').update({ is_active: newStatus }).eq('id', id);

    if (error) {
      toast.error('Failed to update category status.');
      setCategories(categories.map(c => c.id === id ? { ...c, is_active: currentStatus } : c));
    } else {
      toast.success(newStatus ? 'Category marked Active' : 'Category marked Inactive');
    }
  };

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        category_id: item.category_id,
        image_url: item.image_url || '',
        is_available: item.is_available
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        image_url: '',
        is_available: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelId) return;
    if (!formData.category_id) {
      toast.error("Please select a category (create one first if empty)");
      return;
    }

    const payload = {
      hotel_id: hotelId,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      image_url: formData.image_url,
      is_available: formData.is_available
    };

    if (editingItem) {
      // Check if image changed
      const oldImage = editingItem.image_url;
      const newImage = formData.image_url;

      // Update
      const { data, error } = await supabase
        .from('menu_items')
        .update(payload)
        .eq('id', editingItem.id)
        .select('*')
        .maybeSingle();
        
      if (error) toast.error(error.message);
      else {
        // Delete old image if changed
        if (oldImage && oldImage !== newImage) {
          const parts = oldImage.split('/hotel-assets/');
          if (parts.length > 1) {
            await supabase.storage.from('hotel-assets').remove([parts[1]]);
          }
        }
        
        toast.success('Item updated');
        setItems(items.map(i => i.id === editingItem.id ? data : i));
        setIsModalOpen(false);
      }
    } else {
      // Insert
      const { data, error } = await supabase
        .from('menu_items')
        .insert(payload)
        .select('*')
        .maybeSingle();

      if (error) toast.error(error.message);
      else {
        toast.success('Item added');
        setItems([...items, data]);
        setIsModalOpen(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this menu item?')) return;
    
    const itemToDelete = items.find(i => i.id === id);
    
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (!error) {
      // Delete image from storage
      if (itemToDelete?.image_url) {
        const parts = itemToDelete.image_url.split('/hotel-assets/');
        if (parts.length > 1) {
          await supabase.storage.from('hotel-assets').remove([parts[1]]);
        }
      }
      
      toast.success('Deleted item');
      setItems(items.filter(i => i.id !== id));
    } else {
      toast.error('Failed to delete item');
    }
  };

  const filteredItems = items.filter(i => {
    const cat = categories.find(c => c.id === i.category_id);
    return i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (cat?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelId || !newCategory.name.trim()) return;

    const { data, error } = await supabase
      .from('menu_categories')
      .insert({ hotel_id: hotelId, name: newCategory.name.trim(), type: newCategory.type })
      .select()
      .maybeSingle();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Category added');
      setCategories([...categories, data]);
      setNewCategory({ name: '', type: 'food' });
      setIsCategoryModalOpen(false);
      if (isModalOpen) {
        setFormData({ ...formData, category_id: data.id });
      }
    }
  };

  // Grouping items by type and category
  const groupedItems = filteredItems.reduce((acc: any, item) => {
    const cat = categories.find(c => c.id === item.category_id);
    const type = cat?.type || 'food';
    const catName = cat?.name || 'Uncategorized';
    
    if (!acc[type]) acc[type] = {};
    if (!acc[type][catName]) acc[type][catName] = [];
    
    acc[type][catName].push(item);
    return acc;
  }, {});

  // Categories available in active tab, for chip filter
  const tabCategories = categories
    .filter(c => c.type === activeTab)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="animate-fade-in-up">
      <AdminPageHeader
        title="Menu Manager"
        icon={UtensilsCrossed}
        breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Menu' }]}
        action={
          <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 h-10 py-0 bg-white/5 border border-white/10 focus:border-brown-500 text-white text-sm rounded-lg outline-none shadow-sm transition-all"
              />
            </div>
            <button onClick={() => setIsCategoryModalOpen(true)} className="flex items-center justify-center gap-2 text-sm bg-[#0D0501] border border-white/10 text-white/80 hover:bg-[#1A0A02] shadow-sm font-medium h-10 px-4 rounded-xl transition-colors whitespace-nowrap">
              <Plus size={16} /> Category
            </button>
            <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 text-sm bg-[#D4A373] text-[#1A0A02] hover:bg-[#b45309] shadow-sm font-bold h-10 px-6 rounded-xl transition-colors whitespace-nowrap">
              <Plus size={16} /> Add 
            </button>
          </div>
        }
      />

      {/* Food / Drink Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-px">
        <button
          onClick={() => { setActiveTab('food'); setActiveCategory('all'); }}
          className={`px-6 py-3 font-bold text-sm tracking-wide transition-all border-b-2 ${
            activeTab === 'food' 
              ? 'border-brown-600 text-[#D4A373] bg-white/5' 
              : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          🍽️ Kitchen Menu
        </button>
        <button
          onClick={() => { setActiveTab('drink'); setActiveCategory('all'); }}
          className={`px-6 py-3 font-bold text-sm tracking-wide transition-all border-b-2 ${
            activeTab === 'drink' 
              ? 'border-brown-600 text-[#D4A373] bg-white/5' 
              : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          🥂 Bar Menu
        </button>
      </div>

      {/* Category Chip Filter */}
      <div className="flex items-center gap-2 py-3 mb-4 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
            activeCategory === 'all'
              ? 'bg-[#D4A373] text-[#1A0A02] border-[#D4A373]'
              : 'bg-[#0D0501] text-white/60 border-white/10 hover:border-brown-400 hover:text-[#D4A373]'
          }`}
        >
          All Categories
          <span className={`ml-1.5 text-[10px] ${ activeCategory === 'all' ? 'text-white/30' : 'text-white/40'}`}>
            ({(groupedItems[activeTab] ? Object.values(groupedItems[activeTab]).flat().length : 0)})
          </span>
        </button>
        {tabCategories.map(cat => {
          const count = groupedItems[activeTab]?.[cat.name]?.length || 0;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                activeCategory === cat.name
                  ? 'bg-[#D4A373] text-[#1A0A02] border-[#D4A373]'
                  : 'bg-[#0D0501] text-white/60 border-white/10 hover:border-brown-400 hover:text-[#D4A373]'
              }`}
            >
              {cat.name}
              <span className={`ml-1.5 text-[10px] ${ activeCategory === cat.name ? 'text-white/20' : 'text-white/40'}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-[#0D0501] border border-white/10 rounded-3xl shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-[#1A0A02] border-b border-white/10">
            <tr>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold sticky left-0 bg-[#1A0A02] z-10 border-r border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap">Item Info</th>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold">Price</th>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold text-center">Stock Status</th>
              <th className="p-4 text-xs tracking-wider uppercase text-white/50 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-white/10">
                  <td className="p-4"><div className="flex items-center gap-4"><Skeleton className="w-12 h-12 rounded-xl shrink-0" /><div><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-3 w-24" /></div></div></td>
                  <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="p-4"><Skeleton className="h-6 w-20 rounded-full mx-auto" /></td>
                  <td className="p-4"><div className="flex gap-2 justify-end"><Skeleton className="w-8 h-8 rounded-lg" /><Skeleton className="w-8 h-8 rounded-lg" /></div></td>
                </tr>
              ))
            ) : filteredItems.length === 0 ? (
               <tr><td colSpan={5}><EmptyState icon={UtensilsCrossed} title="No Items Found" description={`No menu items match "${searchTerm}".`} /></td></tr>
            ) : (
              (() => {
                const typeGroups = groupedItems[activeTab];
                if (!typeGroups || Object.keys(typeGroups).length === 0) {
                  return <tr><td colSpan={5}><EmptyState icon={UtensilsCrossed} title={`No ${activeTab === 'food' ? 'Kitchen' : 'Bar'} Items`} description="There are no items in this section yet." /></td></tr>;
                }
                
                const allCatNames = Object.keys(typeGroups).sort((a, b) => {
                  if (a === 'Uncategorized') return 1;
                  if (b === 'Uncategorized') return -1;
                  return a.localeCompare(b);
                });

                const catNames = activeCategory === 'all' 
                  ? allCatNames 
                  : allCatNames.filter(n => n === activeCategory);

                if (catNames.length === 0) {
                  return <tr><td colSpan={5} className="p-8 text-center text-white/50 font-medium">No items in this category yet.</td></tr>;
                }

                return catNames.map(catName => {
                  const categoryObj = categories.find(c => c.name === catName && c.type === activeTab);
                  return (
                  <React.Fragment key={catName}>
                    <tr className="bg-white/10">
                      <td colSpan={4} className="p-3 text-xs font-bold text-white border-y border-white/10 uppercase tracking-wider pl-6">
                        <div className="flex items-center justify-between">
                          <div>
                            {catName} <span className="text-white/50 font-normal normal-case ml-2">({typeGroups[catName].length} items)</span>
                          </div>
                          {categoryObj && (
                            <button 
                              onClick={() => toggleCategoryStatus(categoryObj.id, categoryObj.is_active)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full border transition-all ${
                                categoryObj.is_active 
                                  ? 'bg-brown-500/200/20 text-emerald-300 border-emerald-500/30 hover:bg-brown-500/200/30' 
                                  : 'bg-slate-900/50 text-white/50 border-white/10 hover:bg-slate-800'
                              }`}
                              title={categoryObj.is_active ? "Click to hide from public menu" : "Click to show on public menu"}
                            >
                              {categoryObj.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                              {categoryObj.is_active ? 'Active' : 'Hidden'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {typeGroups[catName].map((item: any) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors group relative">
                        <td className="p-4 sticky left-0 bg-[#0D0501] group-hover:bg-white/5 z-10 border-r border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap transition-colors pl-8">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
                              {item.image_url ? 
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : 
                                <UtensilsCrossed size={16} className="text-white/80" />
                              }
                            </div>
                            <div>
                              <div className="font-bold text-white mb-0.5">{item.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-white font-serif font-bold">₦{item.price.toLocaleString()}</td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => toggleStock(item.id, item.is_available)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                              item.is_available 
                                ? 'bg-brown-500/200/20 text-emerald-300 border-emerald-500/30 hover:bg-brown-500/200/30' 
                                : 'bg-brown-500/200/20 text-red-300 border-red-500/30 hover:bg-brown-500/200/30'
                            }`}
                          >
                            {item.is_available ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                            {item.is_available ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleOpenModal(item)} className="text-white/40 hover:text-[#D4A373] transition-colors p-2 rounded hover:bg-[#1A0A02]" aria-label="Edit item">
                              <Edit size={16} />
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="text-white/40 hover:text-red-600 transition-colors p-2 rounded hover:bg-brown-500/20" aria-label="Delete item">
                              <Trash2 size={16} />
                              </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                )});
              })()
            )}
          </tbody>
        </table>
      </div>

      {/* Auth/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-[#0D0501] border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="sticky top-0 bg-[#0D0501] z-10 p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-2xl font-serif text-white font-bold">{editingItem ? 'Edit Item' : 'Add Menu Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white/60">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Item Name *</label>
                  <input required type="text" className="w-full bg-[#0D0501] border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-2.5 rounded-xl outline-none transition-all shadow-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Joebrown Burger" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Category *</label>
                  <select required className="w-full bg-[#0D0501] border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-2.5 rounded-xl outline-none transition-all shadow-sm" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                    {categories.length === 0 && <option value="" disabled>No categories found</option>}
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name} {cat.type ? `(${cat.type})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Price (₦) *</label>
                  <input required type="number" step="0.01" className="w-full bg-[#0D0501] border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-2.5 rounded-xl outline-none transition-all shadow-sm" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="e.g. 5000" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Availability</label>
                  <label className="flex items-center gap-3 cursor-pointer mt-3">
                    <input type="checkbox" className="form-checkbox h-5 w-5 text-[#D4A373] border-white/10 rounded focus:ring-brown-500" checked={formData.is_available} onChange={e => setFormData({...formData, is_available: e.target.checked})} />
                    <span className="text-sm text-white/80 font-medium">Item is currently in stock</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Description</label>
                <textarea className="w-full bg-[#0D0501] border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-2.5 rounded-xl outline-none transition-all shadow-sm min-h-[80px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Delicious details..."></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2 border-b border-white/10 pb-2 mb-4">Item Image</label>
                <div className="max-w-xs">
                    <ImageUpload 
                        folder="menu" 
                        defaultImage={formData.image_url} 
                        onUploadSuccess={(url) => setFormData({...formData, image_url: url})} 
                    />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 font-bold rounded-xl text-white/50 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-[#D4A373] text-[#1A0A02] hover:bg-[#b45309] font-bold py-2.5 px-8 rounded-xl transition-colors shadow-sm">{editingItem ? 'Save Changes' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)}></div>
          <div className="relative bg-[#0D0501] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md animate-fade-in-up">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-2xl font-serif text-white font-bold">Add Category</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-white/40 hover:text-white/60">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Category Name *</label>
                <input required type="text" className="w-full bg-[#0D0501] border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-2.5 rounded-xl outline-none transition-all shadow-sm" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} placeholder="e.g. Desserts" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Type *</label>
                <select required className="w-full bg-[#0D0501] border border-white/10 focus:border-brown-500 text-white text-sm px-4 py-2.5 rounded-xl outline-none transition-all shadow-sm" value={newCategory.type} onChange={e => setNewCategory({...newCategory, type: e.target.value})}>
                  <option value="food">Kitchen</option>
                  <option value="drink">Bar</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-6 py-2.5 font-bold rounded-xl text-white/50 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-[#D4A373] text-[#1A0A02] hover:bg-[#b45309] font-bold py-2.5 px-8 rounded-xl transition-colors shadow-sm">Add Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
