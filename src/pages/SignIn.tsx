import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { normalizePhoneNumber } from "@/utils/phoneUtils";
import Cookies from "js-cookie";

const SignIn = () => {
  useEffect(() => {
    document.title = "Narra Story | Sign In";
    
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/storybooks");
      }
    };
    
    checkAuth();
  }, []);

  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password length
    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }

    setLoading(true);

    try {
      const normalizedPhoneNumber = normalizePhoneNumber(formData.phoneNumber);
      const email = `${normalizedPhoneNumber}@narrastory.com`;

      // First check if user exists in profiles
      const { data: profile, error: searchError } = await supabase
        .from("profiles")
        .select("id, password")
        .eq("phone_number", normalizedPhoneNumber)
        .maybeSingle();

      if (searchError) throw searchError;

      if (!profile) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No account found with this phone number.",
        });
        setLoading(false);
        return;
      }

      if (profile.password !== formData.password) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid password.",
        });
        setLoading(false);
        return;
      }

      // Try to sign in with Supabase Auth
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });

      // If sign in fails, we need to create the auth user first
      if (signInError) {
        // Handle rate limit error specifically
        if (signInError.message.includes("rate limit") || signInError.status === 429) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Please wait a minute before trying again.",
          });
          setLoading(false);
          return;
        }

        // Create auth user with retry mechanism
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            const { error: signUpError } = await supabase.auth.signUp({
              email,
              password: formData.password,
              options: {
                data: {
                  phone_number: normalizedPhoneNumber,
                },
              },
            });

            if (!signUpError) break;

            if (signUpError.status === 429) {
              await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 60 seconds
              retryCount++;
              continue;
            }

            throw signUpError;
          } catch (error) {
            console.error("Retry error:", error);
            retryCount++;
          }
        }

        if (retryCount === maxRetries) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Unable to complete sign in. Please try again later.",
          });
          setLoading(false);
          return;
        }

        // Try signing in again
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password: formData.password,
        });

        if (retryError) throw retryError;
      }

      // Set cookies to expire in 365 days
      Cookies.set('profile_authorized', 'true', { expires: 365 });
      Cookies.set('phone_number', normalizedPhoneNumber, { expires: 365 });
      Cookies.set('profile_id', profile.id, { expires: 365 });

      navigate("/storybooks");
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem signing in.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Sign In"}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/" className="text-primary hover:underline">
                Sign up for Narra
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              <Link to="/reset-password" className="text-primary hover:underline">
                Forgot your password?
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;