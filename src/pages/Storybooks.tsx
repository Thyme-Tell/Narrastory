import { useEffect } from "react";
import StorybooksList from "@/components/StorybooksList";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Storybooks = () => {
  useEffect(() => {
    document.title = "Narra Story | My Storybooks";
  }, []);

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
      <div className="w-full flex justify-between items-center py-4 px-4 bg-white/80">
        <img 
          src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/narra-logo.svg?t=2025-01-22T21%3A53%3A58.812Z" 
          alt="Narra Logo"
          className="h-11"
        />
        <Button asChild>
          <Link to="/">
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">My Storybooks</h1>
          <Button asChild>
            <Link to="/storybooks/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Storybook
            </Link>
          </Button>
        </div>

        <StorybooksList />
      </div>
    </div>
  );
};

export default Storybooks;