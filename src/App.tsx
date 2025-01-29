import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SharedStory from "./components/SharedStory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/stories/:shareToken" element={<SharedStory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;