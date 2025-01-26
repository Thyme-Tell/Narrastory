import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import TopNav from "@/components/TopNav";
import Index from "@/pages/Index";
import SignIn from "@/pages/SignIn";
import Profile from "@/pages/Profile";
import Storybook from "@/pages/Storybook";
import Storybooks from "@/pages/Storybooks";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <TopNav />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/storybooks" element={<Storybooks />} />
          <Route path="/storybooks/:id" element={<Storybook />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;