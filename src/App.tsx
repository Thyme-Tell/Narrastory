
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SharedStory from "./components/SharedStory";
import StoryBooks from "./pages/storybooks";
import StoryBook from "./pages/storybooks/[id]";
import StoryBookSettings from "./pages/storybooks/[id]/settings";
import PasswordResetRequest from "./components/PasswordResetRequest";
import PasswordResetConfirm from "./components/PasswordResetConfirm";
import { AuthProvider } from "./contexts/AuthContext";
import BookPreviewPage from "./pages/BookPreviewPage";
import GetStarted from "./pages/GetStarted";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SubscribePage from "./pages/SubscribePage";
import LifetimeCheckoutPage from "./pages/LifetimeCheckoutPage";
import { Toaster } from "@/components/ui/toaster";

const StoryBookSettingsWrapper = () => {
  const params = useParams();
  return <StoryBookSettings storyBookId={params.id!} />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/signin" element={<Navigate to="/sign-in" replace />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/stories/:shareToken" element={<SharedStory />} />
          <Route path="/storybooks" element={<StoryBooks />} />
          <Route path="/storybooks/:id" element={<StoryBook />} />
          <Route path="/storybooks/:id/settings" element={<StoryBookSettingsWrapper />} />
          <Route path="/reset-password" element={<PasswordResetRequest />} />
          <Route path="/reset-password/confirm" element={<PasswordResetConfirm />} />
          <Route path="/book-preview/:profileId" element={<BookPreviewPage />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/subscribe" element={<SubscribePage />} />
          <Route path="/subscribe/:id" element={<SubscribePage />} />
          <Route path="/lifetime-checkout/:id" element={<LifetimeCheckoutPage />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
