import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import SignIn from "@/pages/SignIn";
import Storybooks from "@/pages/Storybooks";
import Storybook from "@/pages/Storybook";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Index />
            </Layout>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
        <Route path="/sign-in" element={<SignIn />} />
        <Route
          path="/storybooks"
          element={
            <Layout>
              <Storybooks />
            </Layout>
          }
        />
        <Route
          path="/storybooks/:id"
          element={
            <Layout>
              <Storybook />
            </Layout>
          }
        />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;