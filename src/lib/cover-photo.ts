import { supabase } from '@/integrations/supabase/client';

export interface CoverPhoto {
  id: string;
  profile_id: string;
  high_res_url: string;
  preview_url: string;
  width: number;
  height: number;
  created_at: string;
}

export async function optimizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Target width for preview (maintain aspect ratio)
      const MAX_WIDTH = 800;
      const scaleFactor = Math.min(1, MAX_WIDTH / img.width);
      
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;
      
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/jpeg', 0.8); // Use JPEG with 80% quality for smaller file size
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadCoverPhoto(file: File, profileId: string): Promise<CoverPhoto> {
  // Generate unique filename using profile ID and timestamp
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const baseFilename = `${profileId}_${timestamp}`;
  
  // Upload original high-res image
  const highResPath = `cover-photos/${baseFilename}_high.${fileExt}`;
  const { data: highResData, error: highResError } = await supabase.storage
    .from('cover-photos')
    .upload(highResPath, file);
    
  if (highResError) throw highResError;
  
  // Create and upload preview version
  const previewBlob = await optimizeImage(file);
  const previewPath = `cover-photos/${baseFilename}_preview.jpg`;
  const { data: previewData, error: previewError } = await supabase.storage
    .from('cover-photos')
    .upload(previewPath, previewBlob);
    
  if (previewError) throw previewError;
  
  // Get image dimensions
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
  
  // Get public URLs
  const { data: { publicUrl: highResUrl } } = supabase.storage
    .from('cover-photos')
    .getPublicUrl(highResPath);
    
  const { data: { publicUrl: previewUrl } } = supabase.storage
    .from('cover-photos')
    .getPublicUrl(previewPath);
  
  // Save to database
  const { data: coverPhoto, error: dbError } = await supabase
    .from('cover_photos')
    .insert({
      profile_id: profileId,
      high_res_url: highResUrl,
      preview_url: previewUrl,
      width: img.width,
      height: img.height
    })
    .select()
    .single();
    
  if (dbError) throw dbError;
  
  return coverPhoto;
}

export async function getProfileCoverPhoto(profileId: string): Promise<CoverPhoto | null> {
  const { data, error } = await supabase
    .from('cover_photos')
    .select()
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }
  
  return data;
} 