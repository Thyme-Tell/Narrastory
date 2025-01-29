import StoryMediaUpload from "./StoryMediaUpload";
import StoryMedia from "./StoryMedia";

interface StoryContentProps {
  title: string | null;
  content: string;
  storyId: string;
  onUpdate: () => void;
}

const StoryContent = ({ title, content, storyId, onUpdate }: StoryContentProps) => {
  return (
    <>
      {title && (
        <h3 className="font-semibold text-lg text-left">{title}</h3>
      )}
      <p className="whitespace-pre-wrap text-atlantic text-left space-y-[10px]">{content}</p>
      <div className="mt-[30px] mb-[20px]">
        <StoryMediaUpload storyId={storyId} onUploadComplete={onUpdate} />
      </div>
      <StoryMedia storyId={storyId} />
    </>
  );
};

export default StoryContent;