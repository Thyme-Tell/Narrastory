import { useParams } from "react-router-dom";
import StorybooksList from "@/components/StorybooksList";
import CreateStorybook from "@/components/CreateStorybook";
import { useQueryClient } from "@tanstack/react-query";

const Storybooks = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  if (!id) {
    return <div>Profile ID is required</div>;
  }

  const handleStorybookCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["storybooks", id] });
  };

  return (
    <div 
      className="min-h-screen bg-background"
      style={{
        backgroundImage: `url('/lovable-uploads/e730ede5-8b2e-436e-a398-0c62ea70f30c.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-xl font-semibold">Storybooks</h1>
          <CreateStorybook profileId={id} onStorybookCreated={handleStorybookCreated} />
          <div className="mt-4">
            <StorybooksList profileId={id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Storybooks;