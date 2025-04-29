
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { ProfileEditDialog } from "@/components/profile/profile-edit-dialog";
import { TrackUploadDialog } from "@/components/track/track-upload-dialog";
import { Edit, Upload, Music } from "lucide-react";
import ReactPlayer from "react-player";

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    checkCurrentUser();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const { data: profileData, error } = await supabase
        .from('users')
        .select(`
          *,
          profile_trailers (
            video_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile",
      });
    }
  };

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    setIsCurrentUser(user?.id === id);
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  const handleTrackUploaded = () => {
    fetchProfile();
  };

  if (!profile) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Background Image */}
      <div 
        className="h-64 w-full rounded-lg bg-cover bg-center relative"
        style={{ 
          backgroundImage: profile.background_url 
            ? `url(${profile.background_url})` 
            : 'linear-gradient(to right, var(--primary), var(--primary-foreground))'
        }}
      >
        <div className="absolute inset-0 bg-black/20 rounded-lg" />
      </div>

      {/* Profile Info */}
      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 mb-6 relative z-10">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-background">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-4xl text-muted-foreground">
                  {profile.username?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Profile Actions */}
          <div className="flex mt-4 sm:mt-0 sm:ml-6 space-x-4">
            {isCurrentUser && (
              <>
                <Button onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button onClick={() => setIsUploadDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Track
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{profile.full_name || profile.username}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>

          {profile.bio && (
            <p className="text-foreground max-w-2xl">{profile.bio}</p>
          )}

          <div className="flex items-center space-x-2 text-muted-foreground">
            <Music className="h-4 w-4" />
            <span>{profile.city}, {profile.state}</span>
          </div>
        </div>

        {/* Profile Trailer */}
        {profile.profile_trailers?.[0]?.video_url && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Profile Trailer</h2>
            <div className="aspect-video rounded-lg overflow-hidden">
              <ReactPlayer
                url={profile.profile_trailers[0].video_url}
                width="100%"
                height="100%"
                controls
              />
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {isCurrentUser && (
        <>
          <ProfileEditDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            userId={currentUser?.id}
            currentProfile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
          <TrackUploadDialog
            isOpen={isUploadDialogOpen}
            onClose={() => setIsUploadDialogOpen(false)}
            userId={currentUser?.id}
            onTrackUploaded={handleTrackUploaded}
          />
        </>
      )}
    </div>
  );
};

export default Profile;
