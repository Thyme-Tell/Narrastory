
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SharedStory from "./components/SharedStory";
import PasswordResetRequest from "./components/PasswordResetRequest";
import PasswordResetConfirm from "./components/PasswordResetConfirm";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/signin" element={<Navigate to="/sign-in" replace />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/stories/:shareToken" element={<SharedStory />} />
          <Route path="/reset-password" element={<PasswordResetRequest />} />
          <Route path="/reset-password/confirm" element={<PasswordResetConfirm />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
