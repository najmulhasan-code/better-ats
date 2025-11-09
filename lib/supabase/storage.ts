/**
 * Supabase Storage Utilities
 * Helper functions for file uploads to Supabase Storage
 */

import { createClient } from '@/lib/supabase/client';

/**
 * Upload a resume file to Supabase Storage
 * @param file - The file to upload
 * @param candidateId - The candidate ID to use in the filename
 * @returns The public URL of the uploaded file
 */
export async function uploadResume(
  file: File,
  candidateId: string
): Promise<string> {
  const supabase = createClient();

  // Create a unique filename: candidateId-timestamp-originalname
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${candidateId}-${timestamp}.${fileExt}`;
  const filePath = `resumes/${fileName}`;

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload resume: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('resumes')
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Delete a resume file from Supabase Storage
 * @param fileUrl - The public URL of the file to delete
 */
export async function deleteResume(fileUrl: string): Promise<void> {
  const supabase = createClient();

  // Extract file path from URL
  const urlParts = fileUrl.split('/resumes/');
  if (urlParts.length < 2) {
    throw new Error('Invalid file URL');
  }

  const filePath = `resumes/${urlParts[1]}`;

  const { error } = await supabase.storage
    .from('resumes')
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete resume: ${error.message}`);
  }
}
