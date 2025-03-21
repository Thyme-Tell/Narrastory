
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  profileId: string | null;
  checkAuth: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const navigate = useNavigate();

  const checkAuth = async () => {
    const storedProfileId = Cookies.get('profile_id');
    const isAuthorized = Cookies.get('profile_authorized');

    console.log('Checking auth with profile ID:', storedProfileId);
    console.log('Is authorized from cookie:', isAuthorized);

    if (!storedProfileId || !isAuthorized) {
      console.log('Missing cookies, user not authenticated');
      setIsAuthenticated(false);
      setProfileId(null);
      return false;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('id', storedProfileId)
        .maybeSingle();

      if (error) {
        console.error('Error validating auth:', error);
        return false;
      }

      if (!profile) {
        console.log('Profile not found for ID:', storedProfileId);
        // Clear cookies if profile not found
        Cookies.remove('profile_id');
        Cookies.remove('profile_authorized');
        Cookies.remove('phone_number');
        setIsAuthenticated(false);
        setProfileId(null);
        return false;
      }

      console.log('Auth successful for:', profile.first_name, profile.last_name);
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

  const logout = () => {
    console.log('Logging out user');
    Cookies.remove('profile_id');
    Cookies.remove('profile_authorized');
    Cookies.remove('phone_number');
    setIsAuthenticated(false);
    setProfileId(null);
    navigate('/sign-in', { replace: true });
  };

  useEffect(() => {
    console.log('AuthProvider mounted, checking auth');
    checkAuth();
    
    // Recheck auth when cookies change
    const handleCookieChange = () => {
      console.log('Cookie change detected, rechecking auth');
      checkAuth();
    };

    window.addEventListener('storage', handleCookieChange);
    return () => window.removeEventListener('storage', handleCookieChange);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, profileId, checkAuth, logout }}>
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
