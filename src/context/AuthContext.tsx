import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabase as externalSupabase } from '../superBaseClient';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const AUTO_CREATE = (import.meta.env.VITE_AUTO_CREATE_MANAGER as string) === 'true';
const DEFAULT_MANAGER_EMAIL = (import.meta.env.VITE_MANAGER_EMAIL as string) || '';
const DEFAULT_MANAGER_PASSWORD = (import.meta.env.VITE_MANAGER_PASSWORD as string) || '';
let supabase: SupabaseClient | null = externalSupabase ?? null;
if (!supabase && supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('xeetrack_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    let { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Dev-only: auto-create manager if enabled and credentials match env
      if (
        AUTO_CREATE &&
        DEFAULT_MANAGER_EMAIL &&
        DEFAULT_MANAGER_PASSWORD &&
        email === DEFAULT_MANAGER_EMAIL
      ) {
        const signup = await supabase.auth.signUp({ email: DEFAULT_MANAGER_EMAIL, password: DEFAULT_MANAGER_PASSWORD });
        if (signup.error) {
          throw new Error(signup.error.message || 'Sign up failed');
        }
        // Insert/Upsert profile with manager role
        await supabase.from('profiles').upsert({
          id: signup.data.user?.id,
          full_name: 'Manager',
          role: 'manager',
          email: DEFAULT_MANAGER_EMAIL
        });
        // Try login again
        const retry = await supabase.auth.signInWithPassword({ email: DEFAULT_MANAGER_EMAIL, password: DEFAULT_MANAGER_PASSWORD });
        if (retry.error) {
          throw new Error(retry.error.message || 'Login failed after signup');
        }
        data = retry.data;
      } else {
        throw new Error(error.message || 'Invalid credentials');
      }
    }
    // Fetch profile/role from 'profiles' table
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, role, email')
      .eq('id', data.user.id)
      .maybeSingle();
    const mappedUser: User = {
      id: data.user.id,
      name: profile?.full_name || (data.user.email || 'User'),
      email: profile?.email || data.user.email || '',
      role: (profile?.role as User['role']) || 'manager'
    };
    setUser(mappedUser);
    localStorage.setItem('xeetrack_user', JSON.stringify(mappedUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('xeetrack_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}