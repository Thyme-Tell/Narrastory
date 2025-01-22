import { Link } from "react-router-dom";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
}

const ProfileHeader = ({ firstName, lastName }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="font-rosemartin text-atlantic text-2xl leading-[108.7%] tracking-[0.08em]">
        {firstName} {lastName}
      </h1>
      <Link 
        to="/" 
        className="text-primary hover:underline"
      >
        Not {firstName}? Sign up
      </Link>
    </div>
  );
};

export default ProfileHeader;