import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import FormField from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { normalizePhoneNumber } from "@/utils/phoneUtils";

const PasswordResetRequest = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      
      // First, get the user's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, phone_number")
        .eq("phone_number", normalizedPhone)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase.functions.invoke("password-reset", {
        body: { action: "request", phoneNumber: normalizedPhone },
      });

      if (error) throw error;

      // Get last 4 digits of phone number
      const lastFourDigits = normalizedPhone.slice(-4);

      toast({
        title: "Success",
        description: `A reset code has been sent to ${profile.first_name}'s phone (ending in ${lastFourDigits}) via text message.`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem requesting the password reset.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground mt-2">
            Enter your phone number to receive a reset code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            placeholder="+1 (555) 000-0000"
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Code"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetRequest;