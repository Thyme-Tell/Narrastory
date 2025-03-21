
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { ProfileFormData } from "@/types/profile";
import { normalizePhoneNumber } from "@/utils/phoneUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { encryptText } from "@/utils/encryptionUtils";

const ProfileForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <Alert variant="destructive" className="border-red-300 bg-red-50 text-red-800">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
    
      <div className="space-y-4">
        <FormField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          placeholder="Jane"
          error={errors.firstName}
        />

        <FormField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          placeholder="Brown"
          error={errors.lastName}
        />

        <FormField
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
          placeholder="(555) 000-0000"
          error={errors.phoneNumber}
        />

        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="jane@example.com"
          error={errors.email}
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Enter a secure password"
          error={errors.password}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating Account..." : "Continue"}
      </Button>
    </form>
  );
};

export default ProfileForm;
