import { Link, useParams } from "react-router-dom";
import { Menu, BookOpen, Book } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Storybooks = () => {
  const { id } = useParams();

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
        <p className="text-center">Storybooks are coming soon.</p>
        <div className="text-center mt-8">
          <Link to={`/profile/${id}`}>
            Go back to stories
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Storybooks;