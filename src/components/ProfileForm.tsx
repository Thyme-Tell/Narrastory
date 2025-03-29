
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ProfileFormData } from "@/types/profile";
import { normalizePhoneNumber } from "@/utils/phoneUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { encryptText } from "@/utils/encryptionUtils";

const ProfileForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};
    let isValid = true;

    if (!formData.firstName || formData.firstName.trim() === "") {
      newErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName || formData.lastName.trim() === "") {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!formData.phoneNumber || formData.phoneNumber.trim() === "") {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else {
      const normalizedPhone = normalizePhoneNumber(formData.phoneNumber);
      if (normalizedPhone.length < 8) {
        newErrors.phoneNumber = "Please enter a valid phone number";
        isValid = false;
      }
    }

    if (!formData.password || formData.password.trim() === "") {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!validateForm()) {
      setFormError("Please fix the errors in the form");
      return;
    }
    
    setLoading(true);

    const normalizedPhoneNumber = normalizePhoneNumber(formData.phoneNumber);

    try {
      const { data: existingProfile, error: searchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone_number", normalizedPhoneNumber)
        .maybeSingle();

      if (searchError) {
        console.error("Error searching for existing profile:", searchError);
        throw new Error("We couldn't verify if your phone number is already registered");
      }

      if (existingProfile) {
        toast({
          title: "Welcome back!",
          description: "You already have an account with us. Redirecting you to sign in.",
        });
        navigate(`/sign-in`);
        return;
      }

      // Ensure lastName is never empty
      if (!formData.lastName.trim()) {
        setErrors(prev => ({...prev, lastName: "Last name is required"}));
        setFormError("Last name is required");
        setLoading(false);
        return;
      }

      // Encrypt sensitive data before storing
      const encryptedPassword = await encryptText(formData.password);
      const encryptedEmail = formData.email ? await encryptText(formData.email) : null;
      
      const { data, error } = await supabase
        .from("profiles")
        .insert([
          {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            phone_number: normalizedPhoneNumber,
            email: encryptedEmail,
            password: encryptedPassword,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating profile:", error);
        if (error.code === "23505") { // Unique constraint violation
          throw new Error("This phone number is already registered. Please sign in instead.");
        }
        throw error;
      }

      toast({
        title: "Account created!",
        description: `Welcome to Narra, ${data.first_name}! Your profile has been created.`,
      });

      navigate(`/profile/${data.id}`);
    } catch (error: any) {
      console.error("Error:", error);
      setFormError(error.message || "There was a problem creating your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear form-level error when user types
    if (formError) setFormError(null);
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user types
    if (errors[name as keyof ProfileFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <Alert variant="destructive" className="border-red-300 bg-red-50 text-red-800 rounded-[7px]">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
    
      <div className="space-y-5">
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-[#242F3F]">
            Email
          </Label>
          <div className="mt-1.5">
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full rounded-[7px] border ${
                errors.email ? "border-red-500" : "border-[#E5E7EB]"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="firstName" className="text-sm font-medium text-[#242F3F]">
            First Name
          </Label>
          <div className="mt-1.5">
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Jane"
              className={`w-full rounded-[7px] border ${
                errors.firstName ? "border-red-500" : "border-[#E5E7EB]"
              }`}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="lastName" className="text-sm font-medium text-[#242F3F]">
            Last Name
          </Label>
          <div className="mt-1.5">
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Doe"
              className={`w-full rounded-[7px] border ${
                errors.lastName ? "border-red-500" : "border-[#E5E7EB]"
              }`}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="phoneNumber" className="text-sm font-medium text-[#242F3F]">
            Phone Number
          </Label>
          <div className="mt-1.5">
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              placeholder="(555) 000-0000"
              className={`w-full rounded-[7px] border ${
                errors.phoneNumber ? "border-red-500" : "border-[#E5E7EB]"
              }`}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="text-sm font-medium text-[#242F3F]">
            Password
          </Label>
          <div className="mt-1.5 relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter a secure password"
              className={`w-full rounded-[7px] border pr-10 ${
                errors.password ? "border-red-500" : "border-[#E5E7EB]"
              }`}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox 
              id="remember-me" 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="h-4 w-4 rounded-[7px] border-gray-300 text-[#A33D29]"
            />
            <Label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
              Remember me
            </Label>
          </div>
          <div className="text-sm">
            <a href="#" className="text-[#A33D29] hover:text-[#A33D29]/80">
              Forgot password?
            </a>
          </div>
        </div>
      </div>

      <div>
        <Button 
          type="submit" 
          className="w-full py-2.5 rounded-[7px] bg-gradient-to-r from-[#A33D29] to-[#B65644] hover:from-[#933629] hover:to-[#A34C3D] text-white"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Continue"}
        </Button>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/sign-in" className="text-[#A33D29] hover:text-[#A33D29]/80 font-medium">
            Sign in
          </a>
        </p>
      </div>
    </form>
  );
};

export default ProfileForm;
