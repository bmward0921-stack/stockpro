import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { account, isAppwriteConfigured, handleAppwriteError } from '@/lib/appwrite';
import { Models } from 'appwrite';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isConfigured = isAppwriteConfigured();

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      setError('Appwrite is not configured. Please set up environment variables.');
      return;
    }

    const checkUser = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        setError(null);
      } catch (err) {
        // User is not logged in - this is expected, not an error
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [isConfigured]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isConfigured) {
      return { success: false, error: 'Appwrite is not configured' };
    }

    try {
      setError(null);
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);
      return { success: true };
    } catch (err) {
      const errorMessage = handleAppwriteError(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [isConfigured]);

  const signup = useCallback(async (
    email: string, 
    password: string, 
    name?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isConfigured) {
      return { success: false, error: 'Appwrite is not configured' };
    }

    try {
      setError(null);
      await account.create('unique()', email, password, name);
      // Auto-login after signup
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);
      return { success: true };
    } catch (err) {
      const errorMessage = handleAppwriteError(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [isConfigured]);

  const logout = useCallback(async () => {
    try {
      await account.deleteSession('current');
    } catch (err) {
      console.error('Logout error:', handleAppwriteError(err));
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        isConfigured,
        login, 
        signup,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
