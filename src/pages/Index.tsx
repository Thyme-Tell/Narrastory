import ProfileForm from "@/components/ProfileForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign Up</h1>
          <p className="text-muted-foreground mt-2">
            Please fill in your information below
          </p>
        </div>

        <ProfileForm />
      </div>
    </div>
  );
};

export default Index;