
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import FormField from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const PasswordResetConfirm = () => {
  useEffect(() => {
    document.title = "Narra Story | Enter Reset Code";
  }, []);

  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    token: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.token) {
      setError("Please enter the reset code from your text message");
      return;
    }
    
    if (!formData.newPassword) {
      setError("Please enter a new password");
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords don't match. Please make sure both passwords are identical.");
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting to reset password with token:", formData.token);
      
      const { error, data } = await supabase.functions.invoke("password-reset", {
        body: {
          action: "reset",
          token: formData.token,
          newPassword: formData.newPassword,
        },
      });

      if (error) {
        console.error("Reset error:", error);
        throw new Error(error.message || "Invalid or expired reset code. Please try again.");
      }

      console.log("Password reset successful:", data);
      
      setSuccess(true);
      
      toast({
        title: "Password reset successful",
        description: "Your password has been changed. You can now sign in with your new password.",
      });

      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        navigate("/sign-in");
      }, 2000);
    } catch (error: any) {
      console.error("Error in password reset:", error);
      setError(error.message || "There was a problem resetting your password. Please try again.");
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
            className="mx-auto h-16 w-auto mb-[30px]"
          />
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground mt-2">
            Enter your reset code and new password
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-300 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <Alert className="border-green-300 bg-green-50 text-green-800">
            <AlertDescription>
              Password reset successful! Redirecting to sign in page...
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Reset Code"
              name="token"
              value={formData.token}
              onChange={handleChange}
              required
              placeholder="Enter the 6-digit code"
            />

            <FormField
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              placeholder="Enter your new password"
            />

            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your new password"
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
            
            <div className="text-center mt-4">
              <Link to="/sign-in" className="text-primary hover:underline text-sm">
                Return to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordResetConfirm;
