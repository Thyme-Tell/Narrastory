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
      // Check for either a valid session OR a profile authorization cookie
      const { data: { session } } = await supabase.auth.getSession();
      const profileAuthorized = Cookies.get("profile_authorized");

      if (!profileId) {
        console.error("No profile ID provided");
        navigate("/sign-in");
        return;
      }

      // Allow access if either the user is logged in OR has a valid profile authorization
      if (!session && !profileAuthorized) {
        console.log("No valid session or profile authorization found");
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