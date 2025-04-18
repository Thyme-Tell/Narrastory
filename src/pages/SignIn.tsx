import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { normalizePhoneNumber } from "@/utils/phoneUtils";
import Cookies from "js-cookie";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const SignIn = () => {
  useEffect(() => {
    document.title = "Narra Story | Sign In";
  }, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });

  const redirectTo = searchParams.get('redirectTo') || 
                    (location.state as { redirectTo?: string })?.redirectTo || 
                    null;
  
  useEffect(() => {
    console.log("Redirect destination after login:", redirectTo);
  }, [redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.phoneNumber.trim()) {
      setError("Please enter your phone number");
      setLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError("Please enter your password");
      setLoading(false);
      return;
    }

    const normalizedPhoneNumber = normalizePhoneNumber(formData.phoneNumber);
    console.log("Attempting login with phone:", normalizedPhoneNumber);

    try {
      const { data: profiles, error: searchError } = await supabase
        .from("profiles")
        .select("id, password, first_name, last_name, phone_number, email")
        .eq("phone_number", normalizedPhoneNumber);

      if (searchError) {
        console.error("Profile search error:", searchError);
        setError("We couldn't verify your account. Please try again.");
        setLoading(false);
        return;
      }

      if (!profiles || profiles.length === 0) {
        setError("No account found with this phone number. Please check your number or sign up for a new account.");
        setLoading(false);
        return;
      }

      const profile = profiles[0];
      console.log("Found profile:", profile.id);
      
      if (profile.password !== formData.password) {
        console.log("Password mismatch for profile:", profile.id);
        setError("The password you entered is incorrect. Please try again or reset your password.");
        setLoading(false);
        return;
      }

      // Clear any existing auth cookies
      Cookies.remove('profile_authorized');
      Cookies.remove('phone_number');
      Cookies.remove('profile_id');
      Cookies.remove('user_email');
      
      // Set auth cookies with 365-day expiration
      Cookies.set('profile_authorized', 'true', { expires: 365 });
      Cookies.set('phone_number', normalizedPhoneNumber, { expires: 365 });
      Cookies.set('profile_id', profile.id, { expires: 365 });
      if (profile.email) {
        Cookies.set('user_email', profile.email, { expires: 365 });
      }

      // Redirect to the appropriate page
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate(`/profile/${profile.id}`);
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img
            src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/narra-logo.svg?t=2025-01-22T21%3A53%3A58.812Z"
            alt="Narra Logo"
            className="mx-auto h-16 w-auto mb-[50px]"
          />
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-muted-foreground mt-2">
            Please enter your credentials below
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-300 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Phone Number"
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="Enter your phone number"
            required
          />
          <FormField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter your password"
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            <Link to="/forgot-password" className="text-[#A33D29] hover:underline">
              Forgot your password?
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-[#A33D29] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
