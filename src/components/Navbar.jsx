
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Music, Map, Trophy, Video, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/auth/auth-dialog";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Music className="h-6 w-6" />
            <span className="text-xl font-bold">HighNote</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/discover">
              <Button variant="ghost" className="flex items-center">
                <Map className="mr-2 h-4 w-4" />
                Discover
              </Button>
            </Link>
            <Link to="/contests">
              <Button variant="ghost" className="flex items-center">
                <Trophy className="mr-2 h-4 w-4" />
                Contests
              </Button>
            </Link>
            <Link to="/tutorials">
              <Button variant="ghost" className="flex items-center">
                <Video className="mr-2 h-4 w-4" />
                Tutorials
              </Button>
            </Link>
            {user ? (
              <>
                <Link to={`/profile/${user.id}`}>
                  <Button variant="outline" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </Link>
                <Button 
                  variant="destructive" 
                  className="flex items-center"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={() => setShowAuthDialog(true)}
              >
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
      />
    </nav>
  );
};

export default Navbar;
