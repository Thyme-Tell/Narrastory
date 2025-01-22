import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

interface PasswordProtectionProps {
  onVerify: (password: string) => Promise<boolean>;
}

const PasswordProtection = ({ onVerify }: PasswordProtectionProps) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing authorization cookie
    const authCookie = Cookies.get('profile_authorized');
    if (authCookie === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isValid = await onVerify(password);
      
      if (isValid) {
        // Set cookie to expire in 30 days
        Cookies.set('profile_authorized', 'true', { expires: 30 });
        setIsAuthorized(true);
      } else {
        toast({
          variant: "destructive",
          title: "Incorrect Password",
          description: "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem verifying the password.",
      });
    } finally {
      setLoading(false);
    }
  };

  // If user is already authorized, don't show the password form
  if (isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Protected Content</h1>
          <p className="text-muted-foreground mt-2">
            Please enter the password to view this profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Continue"}
          </Button>

          <div className="text-center">
            <Link
              to="/reset-password"
              className="text-primary hover:underline text-sm"
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordProtection;