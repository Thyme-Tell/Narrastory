import ProfileForm from "@/components/ProfileForm";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Narra Story | Sign Up";

    const checkAuthCookie = async () => {
      const authCookie = Cookies.get('profile_authorized');
      
      if (authCookie === 'true') {
        try {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', 'mia@narrastory.com')
            .single();

          if (profiles) {
            navigate(`/profile/${profiles.id}`);
          }
        } catch (error) {
          console.error('Error checking auth:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "There was a problem with automatic login.",
            duration: 2000,
          });
        }
      }
    };

    checkAuthCookie();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <Link to="/">
            <img
              src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/narra-logo.svg?t=2025-01-22T21%3A53%3A58.812Z"
              alt="Narra Logo"
              className="mx-auto h-16 w-auto mb-[50px] animate-fade-in"
              style={{ animationDelay: '0ms' }}
            />
          </Link>
          <h1 className="text-3xl font-bold animate-fade-in" style={{ animationDelay: '200ms' }}>
            Sign Up
          </h1>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms' }}>
            Start your story today with Narra
          </p>
          <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '600ms' }}>
            Already have an account?{" "}
            <Link to="/signin" className="hover:underline">
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