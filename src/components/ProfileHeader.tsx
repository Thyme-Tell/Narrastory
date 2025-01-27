import { Link } from "react-router-dom";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
}

const ProfileHeader = ({ firstName, lastName }: ProfileHeaderProps) => {
  console.log("ProfileHeader rendering with firstName:", firstName);
  
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold font-sans text-gray-900">
        Hi, {firstName || "there"}!
      </h1>
    </div>
  );
};

export default ProfileHeader;