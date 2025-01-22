import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ProfileFormData } from "@/types/profile";

const ProfileForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: existingProfile, error: searchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone_number", formData.phoneNumber)
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

      const { data, error } = await supabase
        .from("profiles")
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: formData.phoneNumber,
            email: formData.email || null,
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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
          placeholder="John"
        />

        <FormField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          placeholder="Doe"
        />

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
          label="Email (Optional)"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Processing..." : "Continue"}
      </Button>
    </form>
  );
};

export default ProfileForm;