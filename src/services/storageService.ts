/**
 * Supabase Storage Service
 * Handles uploading property and room images directly to the 'property-images' bucket.
 */

import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

const BUCKET_NAME = 'property-images';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadPropertyImage(
  file: File,
  prefix: string = 'property'
): Promise<UploadResult> {
  if (!supabase) {
    return { success: false, error: 'Supabase client is not initialized.' };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { success: false, error: 'File size exceeds 5MB limit. Please choose a smaller image.' };
  }

  // Validate MIME type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return { success: false, error: 'Invalid file format. Please upload JPG, PNG, or WebP images.' };
  }

  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanPrefix = prefix.replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `${cleanPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `listings/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      success: true,
      publicUrl: data.publicUrl
    };
  } catch (err: any) {
    console.error('Unexpected error during storage upload:', err);
    return { success: false, error: err?.message || 'Failed to upload photo.' };
  }
}
