'use client';

import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/api';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'founder' | 'freelancer';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        setToken(session.access_token);
        try {
          const data = await api.get<{ user: User }>('/auth/me', session.access_token);
          setUser(data.user);
        } catch {
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.access_token) {
          setToken(session.access_token);
          try {
            const data = await api.get<{ user: User }>('/auth/me', session.access_token);
            setUser(data.user);
          } catch {
            setUser(null);
            setToken(null);
          }
        } else {
          setUser(null);
          setToken(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
    window.location.href = '/en';
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
