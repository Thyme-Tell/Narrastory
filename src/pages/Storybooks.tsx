import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Cookies from "js-cookie";

const Storybooks = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const profileId = searchParams.get('profile');

  useEffect(() => {
    const checkAuth = async () => {
      const profileAuthorized = Cookies.get("profile_authorized");
      const { data: { session } } = await supabase.auth.getSession();

      if (!session && !profileAuthorized) {
        navigate("/sign-in");
        return;
      }

      if (!profileId) {
        console.error("No profile ID provided");
        navigate("/sign-in");
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [navigate, profileId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-2xl font-bold mb-4">Storybooks</h1>
      {/* Storybooks content will go here */}
    </div>
  );
};

export default Storybooks;