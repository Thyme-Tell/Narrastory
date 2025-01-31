import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Cookies from 'js-cookie';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  profileId: string | null;
  checkAuth: () => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const checkAuth = async () => {
    const storedProfileId = Cookies.get('profile_id');
    const isAuthorized = Cookies.get('profile_authorized');

    if (!storedProfileId || !isAuthorized) {
      setIsAuthenticated(false);
      setProfileId(null);
      return false;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', storedProfileId)
        .maybeSingle();

      if (error || !profile) {
        Cookies.remove('profile_id');
        Cookies.remove('profile_authorized');
        setIsAuthenticated(false);
        setProfileId(null);
        return false;
      }

      setIsAuthenticated(true);
      setProfileId(profile.id);
      return true;
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setProfileId(null);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const isAuthed = await checkAuth();
      
      // Only redirect if not authenticated and not already on sign-in page
      if (!isAuthed && !location.pathname.includes('/sign-in')) {
        const currentPath = location.pathname;
        if (currentPath !== '/') {
          toast({
            title: "Authentication Required",
            description: "Please sign in to continue",
          });
          navigate(`/sign-in?redirectTo=${currentPath}`);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [location.pathname, navigate]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, profileId, checkAuth, loading }}>
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