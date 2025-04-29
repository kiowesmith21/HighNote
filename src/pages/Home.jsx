
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to discover page
  React.useEffect(() => {
    if (user) {
      navigate('/discover');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto px-4"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
          Share Your Music With The World
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Join our community of musicians, producers, and music lovers. Create, share, and discover amazing music.
        </p>
        <Button 
          size="lg" 
          onClick={() => setShowAuthDialog(true)}
          className="text-lg px-8"
        >
          Get Started
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto px-4"
      >
        <div className="flex flex-col items-center p-6 rounded-lg border bg-card">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <img  alt="Music creation icon" className="h-6 w-6" src="https://images.unsplash.com/photo-1634942536990-44b9aba4c712" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Create Music</h3>
          <p className="text-muted-foreground text-center">Upload your tracks and share them with the world</p>
        </div>

        <div className="flex flex-col items-center p-6 rounded-lg border bg-card">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <img  alt="Community icon" className="h-6 w-6" src="https://images.unsplash.com/photo-1606765962213-6fb8ef0a10e3" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Join Community</h3>
          <p className="text-muted-foreground text-center">Connect with other musicians and grow together</p>
        </div>

        <div className="flex flex-col items-center p-6 rounded-lg border bg-card">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <img  alt="Learn icon" className="h-6 w-6" src="https://images.unsplash.com/photo-1460025192174-e298958d7bb5" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Learn & Grow</h3>
          <p className="text-muted-foreground text-center">Access tutorials and improve your skills</p>
        </div>
      </motion.div>

      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
      />
    </div>
  );
};

export default Home;
