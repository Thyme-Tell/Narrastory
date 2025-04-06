import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminUtils from '@/components/AdminUtils';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

/**
 * Protected admin page
 * Only accessible to user with email: mia@narrastory.com
 */
const AdminPage: React.FC = () => {
  const { isAuthenticated, checkAuth } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      // Check if user is authenticated
      const isAuthValid = await checkAuth();
      if (!isAuthValid) {
        // Redirect to sign-in if not authenticated, with current path as redirectTo
        console.log("User not authenticated, redirecting to sign-in with return path:", location.pathname);
        navigate('/sign-in', { 
          replace: true,
          state: { redirectTo: location.pathname }
        });
        return;
      }
      
      // Get the current user's email
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email;
      
      console.log("Checking authorization for email:", userEmail);
      
      // Only allow access if the email matches mia@narrastory.com
      if (userEmail === 'mia@narrastory.com') {
        setIsAuthorized(true);
        console.log("Access granted: Admin authorization confirmed");
      } else {
        setIsAuthorized(false);
        console.log('Access denied: Only mia@narrastory.com can access the admin page');
      }
      
      setIsLoading(false);
    };

    verifyAuth();
  }, [checkAuth, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              This page is only accessible to authorized administrators.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-3">
          <AdminUtils />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
