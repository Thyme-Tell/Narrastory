
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profileId: string | null; // Added property
  userEmail: string | null; // Added property
  checkAuth: () => Promise<boolean>; // Added method
  setRememberMe: (remember: boolean) => void; // Added method
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  signUp: (email: string, password: string, data?: any) => Promise<{ success: boolean; error?: any }>;
  signOut: () => Promise<void>;
  refreshSubscription?: () => Promise<void>; // Added optional method
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setProfileId(session?.user?.id ?? null);
        setUserEmail(session?.user?.email ?? null);
        setIsLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setProfileId(session?.user?.id ?? null);
      setUserEmail(session?.user?.email ?? null);
      setIsLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    } catch (error) {
      console.error("Auth check error:", error);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error("Unexpected sign in error:", error);
      return { success: false, error };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error("Unexpected sign up error:", error);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
    }
  };

  // Placeholder for refreshSubscription method
  const refreshSubscription = async () => {
    console.log("refreshSubscription method called - placeholder");
    // Implementation removed as part of stripping Stripe integration
  };

  const value = {
    session,
    user,
    isAuthenticated: !!user,
    isLoading,
    profileId,
    userEmail,
    checkAuth,
    setRememberMe: (remember: boolean) => setRememberMe(remember),
    signIn,
    signUp,
    signOut,
    refreshSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
