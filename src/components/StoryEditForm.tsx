
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Wand2 } from "lucide-react";
import StoryEditAI from "./StoryEditAI";
import { useIsMobile } from "@/hooks/use-mobile";

interface StoryEditFormProps {
  initialTitle: string;
  initialContent: string;
  initialDate: Date;
  onSave: (title: string, content: string, date: Date) => void;
  onCancel: () => void;
}

const StoryEditForm = ({
  initialTitle,
  initialContent,
  initialDate,
  onSave,
  onCancel,
}: StoryEditFormProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [date, setDate] = useState<Date>(initialDate);
  const [showAIEditor, setShowAIEditor] = useState(false);
  const isMobile = useIsMobile();

  const handleAIEditorClose = () => {
    setShowAIEditor(false);
  };

  const handleAIEditorSave = (newContent: string) => {
    setContent(newContent);
    setShowAIEditor(false);
  };

  if (showAIEditor) {
    return (
      <div className="fixed inset-0 z-50 bg-white backdrop-blur-sm">
        <div className="fixed inset-x-0 top-0 z-50 bg-white p-6 shadow-lg h-screen overflow-y-auto">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">AI Story Editor</h2>
            <StoryEditAI
              content={content}
              onSave={handleAIEditorSave}
              onCancel={handleAIEditorClose}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="fixed inset-x-0 top-0 z-50 bg-white p-6 shadow-lg h-screen overflow-y-auto">
        <div className="flex flex-col h-full max-w-2xl mx-auto">
          <div className="flex-grow space-y-4">
            <div className="flex justify-between items-center">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Story title"
                className="w-full text-left"
              />
              <Button
                variant="outline"
                size="icon"
                className="ml-2"
                onClick={() => setShowAIEditor(true)}
                title="AI Edit Assistant"
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-grow text-left"
              style={{ height: isMobile ? "calc(100vh - 260px)" : "calc(100vh - 280px)" }}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Fixed footer for action buttons */}
          <div className="sticky bottom-0 left-0 right-0 py-4 bg-white border-t mt-4">
            <div className="flex space-x-2">
              <Button onClick={() => onSave(title, content, date)}>Save</Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryEditForm;
