
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSubscriptionService } from '@/hooks/useSubscriptionService';
import { SubscriptionStatusResult } from '@/types/subscription';
import Cookies from 'js-cookie';

/**
 * AuthContext Type Definition
 * 
 * Contains authentication state and methods, as well as subscription information
 */
interface AuthContextType {
  // Authentication state
  isAuthenticated: boolean;
  profileId: string | null;
  userEmail: string | null;
  
  // Authentication methods
  checkAuth: () => Promise<boolean>;
  logout: () => void;
  setRememberMe: (remember: boolean) => void;
  rememberMe: boolean;
  
  // Subscription state
  subscriptionStatus: SubscriptionStatusResult | null;
  isSubscriptionLoading: boolean;
  
  // Subscription methods
  refreshSubscription: () => Promise<void>;
  hasActiveSubscription: boolean;
  isPremium: boolean;
  hasBookCredits: boolean;
  bookCredits: number;
  
  // Usage tracking
  trackUsage: (featureType: 'call' | 'book' | 'minutes', amount: number, metadata?: Record<string, unknown>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  
  // Add subscription service hook
  const {
    status: subscriptionStatus,
    isStatusLoading: isSubscriptionLoading,
    refetchStatus: refreshSubscriptionData,
    trackUsage: trackUsageService
  } = useSubscriptionService(profileId);

  // Load remember me preference from cookies on initial load
  useEffect(() => {
    const cookieExpiry = Cookies.get('cookie_expiry');
    setRememberMe(cookieExpiry === 'long');
  }, []);

  const checkAuth = async () => {
    const storedProfileId = Cookies.get('profile_id');
    const isAuthorized = Cookies.get('profile_authorized');
    const storedEmail = Cookies.get('user_email');

    console.log('Checking auth with profile ID:', storedProfileId);
    console.log('Is authorized from cookie:', isAuthorized);
    console.log('User email from cookie:', storedEmail);

    if (!storedProfileId || !isAuthorized) {
      console.log('Missing cookies, user not authenticated');
      setIsAuthenticated(false);
      setProfileId(null);
      setUserEmail(null);
      return false;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
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
        Cookies.remove('user_email');
        Cookies.remove('cookie_expiry');
        setIsAuthenticated(false);
        setProfileId(null);
        setUserEmail(null);
        return false;
      }

      console.log('Auth successful for:', profile.first_name, profile.last_name, 'with email:', profile.email);
      setIsAuthenticated(true);
      setProfileId(profile.id);
      
      // Set email if found in profile, otherwise use stored email
      if (profile.email) {
        setUserEmail(profile.email);
        // Update the cookie if it's different
        if (profile.email !== storedEmail) {
          Cookies.set('user_email', profile.email, { 
            expires: rememberMe ? 365 : 7 
          });
        }
      } else if (storedEmail) {
        setUserEmail(storedEmail);
      }
      
      return true;
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setProfileId(null);
      setUserEmail(null);
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
      const email = Cookies.get('user_email');
      
      if (profileId) Cookies.set('profile_id', profileId, { expires: 7 });
      if (isAuthorized) Cookies.set('profile_authorized', isAuthorized, { expires: 7 });
      if (phoneNumber) Cookies.set('phone_number', phoneNumber, { expires: 7 });
      if (email) Cookies.set('user_email', email, { expires: 7 });
    }
  };

  const logout = () => {
    console.log('Logging out user');
    Cookies.remove('profile_id');
    Cookies.remove('profile_authorized');
    Cookies.remove('phone_number');
    Cookies.remove('user_email');
    // Don't remove cookie_expiry on logout to remember user preference
    setIsAuthenticated(false);
    setProfileId(null);
    setUserEmail(null);
    navigate('/sign-in', { replace: true });
  };
  
  /**
   * Refreshes subscription data
   */
  const refreshSubscription = async (): Promise<void> => {
    if (profileId) {
      await refreshSubscriptionData();
    }
  };
  
  /**
   * Tracks usage of premium features
   * 
   * @param featureType Type of feature being used
   * @param amount Amount of usage
   * @param metadata Additional metadata for tracking
   */
  const trackUsage = async (
    featureType: 'call' | 'book' | 'minutes', 
    amount: number, 
    metadata?: Record<string, unknown>
  ): Promise<void> => {
    if (!profileId) return;
    
    await trackUsageService({
      profileId,
      featureType,
      amount,
      metadata
    });
  };

  // Derived subscription states for easier access
  const hasActiveSubscription = 
    subscriptionStatus?.hasActiveSubscription || false;
    
  const isPremium = 
    subscriptionStatus?.isPremium || false;
    
  const hasBookCredits = 
    (subscriptionStatus?.bookCredits || 0) > 0;
    
  const bookCredits = 
    subscriptionStatus?.bookCredits || 0;

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
      // Authentication state and methods
      isAuthenticated, 
      profileId,
      userEmail,
      checkAuth, 
      logout,
      setRememberMe: updateRememberMe,
      rememberMe,
      
      // Subscription state and methods
      subscriptionStatus,
      isSubscriptionLoading,
      refreshSubscription,
      hasActiveSubscription,
      isPremium,
      hasBookCredits,
      bookCredits,
      
      // Usage tracking
      trackUsage
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access authentication and subscription context
 * 
 * @returns AuthContext with authentication state and subscription information
 * @throws Error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
