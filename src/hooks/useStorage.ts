import { useState } from 'react';
import { storage, ID, APPWRITE_STORAGE_BUCKET_ID, client } from '@/lib/appwrite';

export const useStorage = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string> => {
    if (!APPWRITE_STORAGE_BUCKET_ID) {
      throw new Error('Appwrite storage bucket ID is not configured');
    }

    setUploading(true);
    setError(null);

    try {
      const response = await storage.createFile(
        APPWRITE_STORAGE_BUCKET_ID,
        ID.unique(),
        file
      );

      // Get the file URL
      const fileUrl = storage.getFileView(APPWRITE_STORAGE_BUCKET_ID, response.$id);
      return fileUrl.toString();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload file';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId: string): Promise<void> => {
    if (!APPWRITE_STORAGE_BUCKET_ID) {
      throw new Error('Appwrite storage bucket ID is not configured');
    }

    try {
      await storage.deleteFile(APPWRITE_STORAGE_BUCKET_ID, fileId);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete file');
    }
  };

  // Extract file ID from Appwrite URL
  const getFileIdFromUrl = (url: string): string | null => {
    const match = url.match(/files\/([^/]+)\/view/);
    return match ? match[1] : null;
  };

  return {
    uploadFile,
    deleteFile,
    getFileIdFromUrl,
    uploading,
    error,
  };
};
