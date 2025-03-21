
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import FormField from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { normalizePhoneNumber } from "@/utils/phoneUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const PasswordResetRequest = () => {
  useEffect(() => {
    document.title = "Narra Story | Reset Password";
  }, []);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!phoneNumber.trim()) {
      setError("Please enter your phone number");
      setLoading(false);
      return;
    }

    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      
      // First, get the user's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, phone_number")
        .eq("phone_number", normalizedPhone)
        .single();

      if (profileError) {
        // Don't expose whether a profile exists or not for security
        toast({
          title: "Check your phone",
          description: "If an account exists with this phone number, you will receive a reset code.",
        });
        navigate("/reset-password/confirm");
        return;
      }

      const { error: resetError } = await supabase.functions.invoke("password-reset", {
        body: { action: "request", phoneNumber: normalizedPhone },
      });

      if (resetError) {
        console.error("Reset error:", resetError);
        throw new Error("Could not send reset code. Please try again later.");
      }

      // Get last 4 digits of phone number
      const lastFourDigits = normalizedPhone.slice(-4);

      toast({
        title: "Reset code sent",
        description: `We've sent a reset code to ${profile.first_name}'s phone (ending in ${lastFourDigits}) via text message.`,
      });

      // Redirect to the password reset confirmation page
      navigate("/reset-password/confirm");
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "There was a problem with the password reset request. Please try again later.");
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
            className="mx-auto h-16 w-auto mb-[30px]"
          />
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground mt-2">
            Enter your phone number to receive a reset code
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
            name="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              setError(null);
              setPhoneNumber(e.target.value);
            }}
            required
            placeholder="+1 (555) 000-0000"
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Code"}
          </Button>

          <div className="text-center mt-4">
            <Link to="/sign-in" className="text-primary hover:underline text-sm">
              Return to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetRequest;
