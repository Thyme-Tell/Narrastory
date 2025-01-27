import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to profile page since we don't have a dedicated home page yet
    navigate("/profile/2f803af2-710f-46af-8e6f-91516375ee3c");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-lg">Redirecting...</p>
    </div>
  );
};

export default Home;