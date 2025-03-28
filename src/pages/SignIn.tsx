
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

const SignIn = () => {
  useEffect(() => {
    document.title = "Narra Story | Sign In";
  }, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });

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
      // Directly query the profiles table
      const { data: profiles, error: searchError } = await supabase
        .from("profiles")
        .select("id, password, first_name, last_name, phone_number")
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

      // Use the first profile if multiple are found
      const profile = profiles[0];
      console.log("Found profile:", profile.id);
      
      if (profile.password !== formData.password) {
        console.log("Password mismatch for profile:", profile.id);
        setError("The password you entered is incorrect. Please try again or reset your password.");
        setLoading(false);
        return;
      }

      // Set cookies to expire in 365 days
      console.log("Setting auth cookies for profile:", profile.id);
      Cookies.set('profile_authorized', 'true', { expires: 365 });
      Cookies.set('phone_number', normalizedPhoneNumber, { expires: 365 });
      Cookies.set('profile_id', profile.id, { expires: 365 });

      // Get the redirect path from URL params or location state
      const redirectTo = searchParams.get('redirectTo') || 
                        (location.state as { redirectTo?: string })?.redirectTo || 
                        `/profile/${profile.id}`;
      
      console.log("Login successful, redirecting to:", redirectTo);
      
      toast({
        title: "Welcome back!",
        description: `You've successfully signed in as ${profile.first_name}`,
      });
      
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("Error during sign in:", error);
      setError("Something went wrong while signing in. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear error when user starts typing
    if (error) setError(null);
    
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <FormField
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              placeholder="+1 (555) 000-0000"
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center space-y-2">
              <Link to="/reset-password" className="text-primary hover:underline text-sm">
                Forgot your password?
              </Link>
              
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/" className="text-primary hover:underline">
                  Sign up for Narra
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
