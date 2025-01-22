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
    phoneNumber: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          description: "This phone number is already registered. Please sign in instead.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .insert([
          {
            phone_number: normalizedPhoneNumber,
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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
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
          placeholder="Enter a secure password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Processing..." : "Sign Up"}
      </Button>
    </form>
  );
};

export default ProfileForm;