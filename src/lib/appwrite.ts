import { Client, Account, Databases, Storage, ID, AppwriteException } from 'appwrite';

// Environment variable validation
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';

// Database and collection IDs
export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';
export const APPWRITE_LISTINGS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_LISTINGS_COLLECTION_ID || '';
export const APPWRITE_STORAGE_BUCKET_ID = import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || '';
export const APPWRITE_ACTIVITY_COLLECTION_ID = import.meta.env.VITE_APPWRITE_ACTIVITY_COLLECTION_ID || '';

// Validation helper to check if Appwrite is properly configured
export const isAppwriteConfigured = (): boolean => {
  return Boolean(APPWRITE_PROJECT_ID);
};

// Validation helper to check if database is configured
export const isDatabaseConfigured = (): boolean => {
  return Boolean(APPWRITE_DATABASE_ID && APPWRITE_LISTINGS_COLLECTION_ID);
};

// Get missing configuration for debugging
export const getMissingConfig = (): string[] => {
  const missing: string[] = [];
  if (!APPWRITE_PROJECT_ID) missing.push('VITE_APPWRITE_PROJECT_ID');
  if (!APPWRITE_DATABASE_ID) missing.push('VITE_APPWRITE_DATABASE_ID');
  if (!APPWRITE_LISTINGS_COLLECTION_ID) missing.push('VITE_APPWRITE_LISTINGS_COLLECTION_ID');
  if (!APPWRITE_STORAGE_BUCKET_ID) missing.push('VITE_APPWRITE_STORAGE_BUCKET_ID');
  return missing;
};

// Initialize Appwrite client
const client = new Client();

if (APPWRITE_PROJECT_ID) {
  client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
} else {
  console.warn(
    '⚠️ Appwrite is not configured. Please set the following environment variables:\n' +
    '- VITE_APPWRITE_PROJECT_ID\n' +
    '- VITE_APPWRITE_DATABASE_ID\n' +
    '- VITE_APPWRITE_LISTINGS_COLLECTION_ID\n' +
    '- VITE_APPWRITE_STORAGE_BUCKET_ID\n' +
    '- VITE_APPWRITE_ACTIVITY_COLLECTION_ID (optional)'
  );
}

// Export Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { client, ID };

// Error handling helper
export const handleAppwriteError = (error: unknown): string => {
  if (error instanceof AppwriteException) {
    switch (error.code) {
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred. The resource may already exist.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
};

// Type-safe query builder helpers
export const QueryHelpers = {
  limitDefault: 25,
  limitMax: 100,
} as const;
