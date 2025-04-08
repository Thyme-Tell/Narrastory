
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
  const [rememberMe, setRememberMe] = useState(true); // Default to true for better UX
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
  };

  // Get redirect parameter from multiple possible sources
  const redirect = searchParams.get('redirect') || 
                   searchParams.get('redirectTo') || 
                   (location.state as { redirectTo?: string })?.redirectTo || 
                   sessionStorage.getItem('redirectAfterLogin') ||
                   null;
  
  useEffect(() => {
    console.log("Redirect destination after login:", redirect);
    
    // Check if we're already authenticated
    const existingAuth = Cookies.get('profile_authorized') === 'true';
    const existingProfileId = Cookies.get('profile_id');
    
    console.log("Initial auth check:", { existingAuth, existingProfileId, isAuthenticated });
    
    // If already authenticated, redirect to the target page or profile
    if (existingAuth && existingProfileId) {
      const destination = redirect 
        ? (redirect.startsWith('/') ? redirect : `/${redirect}`)
        : `/profile/${existingProfileId}`;
        
      console.log("Already authenticated, redirecting to:", destination);
      
      // Clear the session storage redirect
      sessionStorage.removeItem('redirectAfterLogin');
      
      navigate(destination, { replace: true });
    }
  }, [navigate, redirect, isAuthenticated]);

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

      const expirationDays = rememberMe ? 365 : 7;
      
      // Clear existing auth cookies first to ensure clean state
      Cookies.remove('profile_authorized');
      Cookies.remove('phone_number');
      Cookies.remove('profile_id');
      Cookies.remove('user_email');
      
      console.log("Setting auth cookies for profile:", profile.id, "with expiration:", expirationDays, "days");
      
      // Set new auth cookies with proper expiration and path to ensure they're available on all pages
      Cookies.set('profile_authorized', 'true', { expires: expirationDays, path: '/' });
      Cookies.set('phone_number', normalizedPhoneNumber, { expires: expirationDays, path: '/' });
      Cookies.set('profile_id', profile.id, { expires: expirationDays, path: '/' });
      
      if (profile.email) {
        console.log("Setting email cookie:", profile.email);
        Cookies.set('user_email', profile.email, { expires: expirationDays, path: '/' });
      }
      
      // Verify cookies were set properly
      const authCookieSet = Cookies.get('profile_authorized');
      const profileIdSet = Cookies.get('profile_id');
      console.log("Verifying cookies were set:", { authCookieSet, profileIdSet });
      
      // Get the redirect parameter and construct destination URL
      let destination = '';
      const redirectParam = searchParams.get('redirect') || 
                            searchParams.get('redirectTo') || 
                            (location.state as { redirectTo?: string })?.redirectTo ||
                            sessionStorage.getItem('redirectAfterLogin');
      
      sessionStorage.removeItem('redirectAfterLogin');
                            
      if (redirectParam) {
        // Handle different redirect formats
        destination = redirectParam.startsWith('/') ? redirectParam : `/${redirectParam}`;
        console.log("Redirecting to:", destination);
      } else {
        destination = `/profile/${profile.id}`;
      }
      
      console.log("Login successful, redirecting to:", destination);
      
      toast({
        title: "Welcome back!",
        description: `You've successfully signed in as ${profile.first_name}`,
      });
      
      // Trigger a storage event to notify other tabs/components of auth change
      window.dispatchEvent(new Event('storage'));
      
      // Use replace to avoid having the login page in the history
      navigate(destination, { replace: true });
      
    } catch (error) {
      console.error("Error during sign in:", error);
      setError("Something went wrong while signing in. Please try again later.");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            
            <div className="flex items-center">
              <Checkbox 
                id="remember-me" 
                checked={rememberMe}
                onCheckedChange={(checked) => handleRememberMeChange(checked as boolean)}
                className="h-4 w-4 rounded-[7px] border-gray-300 text-[#A33D29]"
              />
              <Label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
                Remember me
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              type="submit" 
              className="w-full py-2.5 rounded-[7px] bg-gradient-to-r from-[#A33D29] to-[#B65644] hover:from-[#933629] hover:to-[#A34C3D] text-white"
              disabled={loading}
            >
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
            
            <div className="text-xs text-gray-500 mt-2 text-center">
              <p>
                By signing in, you agree to our{" "}
                <Link to="/terms-and-conditions" className="text-[#A33D29] hover:underline">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-[#A33D29] hover:underline">
                  Privacy Policy
                </Link>
              </p>
              <p className="mt-1">
                We respect your privacy and will never share your information with third parties.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
