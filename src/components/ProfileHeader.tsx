import { Link } from "react-router-dom";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
}

const ProfileHeader = ({ firstName, lastName }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold font-sans">
        Hi, {firstName}
      </h1>
    </div>
  );
};

export default ProfileHeader;