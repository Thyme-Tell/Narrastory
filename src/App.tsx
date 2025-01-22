import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import PasswordResetRequest from "@/components/PasswordResetRequest";
import PasswordResetConfirm from "@/components/PasswordResetConfirm";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/reset-password" element={<PasswordResetRequest />} />
        <Route path="/reset-password/confirm" element={<PasswordResetConfirm />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;