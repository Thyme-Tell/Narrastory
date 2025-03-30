
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  profileId: string | null;
  checkAuth: () => Promise<boolean>;
  logout: () => void;
  setRememberMe: (remember: boolean) => void;
  rememberMe: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Load remember me preference from cookies on initial load
  useEffect(() => {
    const cookieExpiry = Cookies.get('cookie_expiry');
    setRememberMe(cookieExpiry === 'long');
  }, []);

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
        Cookies.remove('cookie_expiry');
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

  const updateRememberMe = (remember: boolean) => {
    setRememberMe(remember);
    
    // Store the preference in a cookie
    if (remember) {
      Cookies.set('cookie_expiry', 'long', { expires: 365 });
    } else {
      Cookies.set('cookie_expiry', 'short', { expires: 7 });
      
      // Also update existing auth cookies if they exist
      const profileId = Cookies.get('profile_id');
      const isAuthorized = Cookies.get('profile_authorized');
      const phoneNumber = Cookies.get('phone_number');
      
      if (profileId) Cookies.set('profile_id', profileId, { expires: 7 });
      if (isAuthorized) Cookies.set('profile_authorized', isAuthorized, { expires: 7 });
      if (phoneNumber) Cookies.set('phone_number', phoneNumber, { expires: 7 });
    }
  };

  const logout = () => {
    console.log('Logging out user');
    Cookies.remove('profile_id');
    Cookies.remove('profile_authorized');
    Cookies.remove('phone_number');
    // Don't remove cookie_expiry on logout to remember user preference
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
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      profileId, 
      checkAuth, 
      logout,
      setRememberMe: updateRememberMe,
      rememberMe
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
