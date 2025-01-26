import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "@/components/ui/sidebar";
import Index from "@/pages/Index";
import SignIn from "@/pages/SignIn";
import Profile from "@/pages/Profile";
import Storybooks from "@/pages/Storybooks";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/storybooks" element={<Storybooks />} />
          </Routes>
        </div>
      </div>
      <Toaster />
    </Router>
  );
}

export default App;