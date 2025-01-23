import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import SignIn from "@/pages/SignIn";
import PasswordResetRequest from "@/components/PasswordResetRequest";
import PasswordResetConfirm from "@/components/PasswordResetConfirm";
import Storybooks from "@/pages/Storybooks";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/profile/:id/storybooks" element={<Storybooks />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/reset-password" element={<PasswordResetRequest />} />
        <Route path="/reset-password/confirm" element={<PasswordResetConfirm />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;