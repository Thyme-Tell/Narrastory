
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSubscriptionService } from '@/hooks/useSubscriptionService';
import { SubscriptionStatusResult, PaymentHistoryItem, UsageMetrics } from '@/types/subscription';
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
  paymentHistory: PaymentHistoryItem[];
  isPaymentHistoryLoading: boolean;
  usageMetrics: UsageMetrics | null;
  
  // Subscription methods
  refreshSubscription: () => Promise<void>;
  refreshPaymentHistory: () => Promise<void>;
  hasActiveSubscription: boolean;
  isPremium: boolean;
  hasBookCredits: boolean;
  bookCredits: number;
  
  // Usage tracking
  trackUsage: (featureType: 'call' | 'book' | 'minutes', amount: number, metadata?: Record<string, unknown>) => Promise<void>;
  refreshUsageMetrics: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [isPaymentHistoryLoading, setIsPaymentHistoryLoading] = useState(false);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
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
    try {
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
   * Fetches payment history from Stripe
   * 
   * @returns Promise that resolves when payment history is fetched
   */
  const refreshPaymentHistory = async (): Promise<void> => {
    if (!profileId) return;
    
    try {
      setIsPaymentHistoryLoading(true);
      
      const { data, error } = await supabase.functions.invoke('get-payment-history', {
        body: { profileId }
      });
      
      if (error) {
        console.error('Error fetching payment history:', error);
        return;
      }
      
      setPaymentHistory(data.payments || []);
    } catch (err) {
      console.error('Error in payment history fetch:', err);
    } finally {
      setIsPaymentHistoryLoading(false);
    }
  };
  
  /**
   * Refreshes usage metrics for the current user
   * 
   * @returns Promise that resolves when usage metrics are fetched
   */
  const refreshUsageMetrics = async (): Promise<void> => {
    if (!profileId) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('get-usage-metrics', {
        body: { profileId }
      });
      
      if (error) {
        console.error('Error fetching usage metrics:', error);
        return;
      }
      
      setUsageMetrics(data.metrics || null);
    } catch (err) {
      console.error('Error in usage metrics fetch:', err);
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
    
    // Refresh usage metrics after tracking usage
    await refreshUsageMetrics();
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

  // Load initial payment history and usage metrics when user is authenticated
  useEffect(() => {
    if (isAuthenticated && profileId) {
      refreshPaymentHistory();
      refreshUsageMetrics();
    }
  }, [isAuthenticated, profileId]);

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
      
      // Payment history
      paymentHistory,
      isPaymentHistoryLoading,
      refreshPaymentHistory,
      
      // Usage metrics and tracking
      usageMetrics,
      refreshUsageMetrics,
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
