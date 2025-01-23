import { useState } from "react";
import { useStorybooks } from "@/hooks/useStorybooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Book } from "lucide-react";

interface StorybooksProps {
  profileId: string;
}

const Storybooks = ({ profileId }: StorybooksProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const { storybooks, isLoading, createStorybook } = useStorybooks(profileId);

  const handleCreate = async () => {
    if (!title.trim()) return;
    
    await createStorybook.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
    });
    
    setTitle("");
    setDescription("");
    setIsCreating(false);
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading storybooks...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Book className="h-6 w-6" />
          Storybooks
        </h2>
        <Button onClick={() => setIsCreating(true)} variant="outline">
          Create Storybook
        </Button>
      </div>

      {isCreating && (
        <div className="space-y-4 p-4 border rounded-lg">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Storybook title"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
          />
          <div className="flex gap-2">
            <Button onClick={handleCreate}>Create</Button>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {storybooks?.map((storybook) => (
          <div
            key={storybook.id}
            className="p-4 border rounded-lg space-y-2 hover:border-primary transition-colors"
          >
            <h3 className="font-semibold">{storybook.title}</h3>
            {storybook.description && (
              <p className="text-sm text-muted-foreground">{storybook.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Storybooks;