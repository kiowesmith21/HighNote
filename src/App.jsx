
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Discover from "@/pages/Discover";
import CityArtists from "@/pages/CityArtists";
import Profile from "@/pages/Profile";
import Contests from "@/pages/Contests";
import Tutorials from "@/pages/Tutorials";
import TutorialView from "@/pages/TutorialView";

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="system" storageKey="app-theme">
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/city/:cityName" element={<CityArtists />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/contests" element={<Contests />} />
                <Route path="/tutorials" element={<Tutorials />} />
                <Route path="/tutorials/:id" element={<TutorialView />} />
              </Routes>
            </main>
            <Toaster />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
