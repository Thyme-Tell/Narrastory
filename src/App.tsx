
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import GetStarted from "./pages/GetStarted";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/get-started" element={<GetStarted />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
