import ProfileForm from "@/components/ProfileForm";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Cookies from "js-cookie";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    document.title = "Narra Story | Sign Up";
    
    // Check for existing auth cookie
    const isAuthorized = Cookies.get('profile_authorized') === 'true';
    const profileId = Cookies.get('profile_id');
    
    // Redirect to profile page if user is authenticated or has valid auth cookie
    if ((isAuthenticated && user?.id) || (isAuthorized && profileId)) {
      navigate(`/profile/${user?.id || profileId}`, { replace: true });
    }
  }, [isAuthenticated, user?.id, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <img
            src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/narra-logo.svg?t=2025-01-22T21%3A53%3A58.812Z"
            alt="Narra Logo"
            className="mx-auto h-16 w-auto mb-[50px] animate-fade-in"
            style={{ animationDelay: '0ms' }}
          />
          <h1 className="text-3xl font-bold animate-fade-in" style={{ animationDelay: '200ms' }}>
            Sign Up
          </h1>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms' }}>
            Start your story today with Narra
          </p>
          <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '600ms' }}>
            Already have an account?{" "}
            <Link to="/sign-in" className="hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '800ms' }}>
          <ProfileForm />
        </div>
      </div>
    </div>
  );
};

export default Index;