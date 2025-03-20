
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { ProfileFormData } from "@/types/profile";
import { normalizePhoneNumber } from "@/utils/phoneUtils";

const ProfileForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
    }

    if (!formData.password || formData.password.trim() === "") {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      });
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

      if (searchError) throw searchError;

      if (existingProfile) {
        toast({
          title: "Profile Found!",
          description: "Redirecting you to your existing profile.",
        });
        navigate(`/profile/${existingProfile.id}`);
        return;
      }

      // Ensure firstName and lastName are never empty
      const firstName = formData.firstName.trim() || "Guest";
      const lastName = formData.lastName.trim() || "User";

      const { data, error } = await supabase
        .from("profiles")
        .insert([
          {
            first_name: firstName,
            last_name: lastName,
            phone_number: normalizedPhoneNumber,
            email: formData.email || null,
            password: formData.password,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your profile has been created.",
      });

      navigate(`/profile/${data.id}`);
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem with your request.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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
        {loading ? "Processing..." : "Continue"}
      </Button>
    </form>
  );
};

export default ProfileForm;
