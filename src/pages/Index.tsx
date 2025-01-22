import ProfileForm from "@/components/ProfileForm";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <img
            src="/lovable-uploads/e730ede5-8b2e-436e-a398-0c62ea70f30c.png"
            alt="Narra Logo"
            className="mx-auto h-16 w-auto"
          />
          <h1 className="text-3xl font-bold">Sign Up</h1>
          <p className="text-muted-foreground">
            Start your story today with Narra
          </p>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <ProfileForm />
      </div>
    </div>
  );
};

export default Index;