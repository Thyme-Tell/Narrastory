import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
}

const ProfileHeader = ({ firstName, lastName }: ProfileHeaderProps) => {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold font-sans text-left">
        {firstName} {lastName}'s Stories
      </h1>
      <Button 
        className="w-full bg-[#A33D29] hover:bg-[#A33D29]/90 text-white"
        onClick={() => window.location.href = `tel:+15072003303`}
      >
        Create a New Story
      </Button>
    </div>
  );
};

export default ProfileHeader;