
import { Pencil, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StoryHeaderProps {
  date: string;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
}

const StoryHeader = ({ date, onEdit, onDelete, onShare }: StoryHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-2 space-y-2 sm:space-y-0">
      <p className="text-sm text-muted-foreground text-left">
        {new Date(date).toLocaleDateString()}
      </p>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEdit}
          className="flex items-center gap-2"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onShare}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will move this story to the archive. You can't undo this action.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default StoryHeader;
