'use client';

import React, { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  defaultImage?: string;
  folder?: string;
}

export default function ImageUpload({ onUploadSuccess, defaultImage, folder = 'general' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('hotel-assets')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('hotel-assets')
        .getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      onUploadSuccess(publicUrl);
      toast.success('Image uploaded successfully');
      
    } catch (error: any) {
      console.error('Upload Error:', error.message);
      toast.error('Error uploading image');
    } finally {
      setUploading(false);
      // Reset input value so the same file could be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    onUploadSuccess('');
  };

  return (
    <div className="w-full">
      {previewUrl ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#2A2A2A] bg-[#0D0D0D] group">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              type="button"
              onClick={removeImage}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-[#2A2A2A] hover:border-[var(--color-gold)] hover:bg-[#1a1a1a] transition-all bg-[#0D0D0D] flex flex-col items-center justify-center cursor-pointer text-muted relative"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <UploadCloud className="animate-bounce" size={32} />
              <span className="text-sm">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon size={32} />
              <span className="text-sm">Click to upload image</span>
              <span className="text-xs opacity-50">PNG, JPG up to 5MB</span>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={uploading}
          />
        </div>
      )}
    </div>
  );
}
