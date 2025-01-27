import { Link, useParams } from "react-router-dom";
import { Menu, BookOpen, Book } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Storybooks = () => {
  const { id } = useParams();

  const { data: storybooks, isLoading } = useQuery({
    queryKey: ["storybooks", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storybooks")
        .select("*")
        .eq("profile_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching storybooks:", error);
        return [];
      }

      return data;
    },
    enabled: !!id,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full flex justify-between items-center py-4 px-4 bg-white/80">
        <img 
          src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/narra-logo.svg?t=2025-01-22T21%3A53%3A58.812Z" 
          alt="Narra Logo"
          className="h-11"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-12 w-12" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/storybooks" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Storybooks</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/profile/${id}`} className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                <span>Stories</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="container mx-auto py-8">
        {isLoading ? (
          <p className="text-center">Loading storybooks...</p>
        ) : storybooks && storybooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storybooks.map((storybook) => (
              <Card key={storybook.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{storybook.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {storybook.description || "No description available"}
                  </p>
                  <div className="mt-4">
                    <Link 
                      to={`/storybooks/${storybook.id}`}
                      className="text-[#A33D29] hover:underline"
                    >
                      View Storybook
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p>No storybooks yet.</p>
            <p>Create your first storybook by selecting stories from your collection.</p>
          </div>
        )}
        <div className="text-center mt-8">
          <Link to={`/profile/${id}`} className="text-[#A33D29] hover:underline">
            Go back to stories
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Storybooks;