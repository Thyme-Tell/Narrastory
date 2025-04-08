
import React from 'react';
import { Headphones, Pencil, Share2, Trash2 } from "lucide-react";
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

interface StoryActionsProps {
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
}

const StoryActions = ({ 
  onEdit, 
  onShare, 
  onDelete 
}: StoryActionsProps) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Pencil className="h-4 w-4 mr-2" />
        Edit
      </Button>
      
      <Button variant="outline" size="sm" onClick={onShare}>
        <Share2 className="h-4 w-4" />
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4" />
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
  );
};

export default StoryActions;
