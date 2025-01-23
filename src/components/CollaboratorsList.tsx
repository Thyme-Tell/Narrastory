import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, UserMinus } from "lucide-react";

interface CollaboratorsListProps {
  storybookId: string;
  isOwner: boolean;
}

const CollaboratorsList = ({ storybookId, isOwner }: CollaboratorsListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState("");

  const { data: collaborators, isLoading } = useQuery({
    queryKey: ["collaborators", storybookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storybook_collaborators")
        .select(`
          profile_id,
          profiles:profiles (
            first_name,
            last_name,
            phone_number
          )
        `)
        .eq("storybook_id", storybookId);

      if (error) throw error;
      return data;
    },
  });

  const addCollaboratorMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      // First, find the profile by phone number
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone_number", phoneNumber)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error("Profile not found");

      // Then add them as a collaborator
      const { error } = await supabase
        .from("storybook_collaborators")
        .insert({
          storybook_id: storybookId,
          profile_id: profile.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborators", storybookId] });
      toast({
        title: "Success",
        description: "Collaborator added successfully",
      });
      setPhoneNumber("");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add collaborator",
      });
    },
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from("storybook_collaborators")
        .delete()
        .eq("storybook_id", storybookId)
        .eq("profile_id", profileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborators", storybookId] });
      toast({
        title: "Success",
        description: "Collaborator removed successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove collaborator",
      });
    },
  });

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber) {
      addCollaboratorMutation.mutate(phoneNumber);
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading collaborators...</p>;
  }

  return (
    <div className="space-y-4">
      {isOwner && (
        <form onSubmit={handleAddCollaborator} className="flex gap-2">
          <Input
            type="tel"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={addCollaboratorMutation.isPending}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </form>
      )}

      <div className="space-y-2">
        {collaborators?.map((collaborator) => (
          <div
            key={collaborator.profile_id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div>
              <p className="font-medium">
                {collaborator.profiles.first_name} {collaborator.profiles.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {collaborator.profiles.phone_number}
              </p>
            </div>
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCollaboratorMutation.mutate(collaborator.profile_id)}
                disabled={removeCollaboratorMutation.isPending}
              >
                <UserMinus className="h-4 w-4" />
                <span className="sr-only">Remove collaborator</span>
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollaboratorsList;