
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import ReactPlayer from "react-player";

const CityArtists = () => {
  const { cityName } = useParams();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchArtists();
  }, [cityName]);

  const fetchArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          profile_trailers (
            video_url,
            thumbnail_url
          )
        `)
        .eq('city', cityName) // Changed from ilike to eq for exact match
        .eq('role', 'artist');

      if (error) throw error;
      console.log('Found artists:', data); // Debug log
      setArtists(data || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load artists",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Artists in {cityName}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <div key={artist.id} className="group relative rounded-lg border overflow-hidden hover:shadow-xl transition-all duration-300 bg-card">
            <div className="aspect-video relative">
              {artist.profile_trailers?.[0]?.video_url ? (
                <ReactPlayer
                  url={artist.profile_trailers[0].video_url}
                  width="100%"
                  height="100%"
                  controls
                  light={artist.profile_trailers[0].thumbnail_url}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">No profile video</p>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2 text-foreground">{artist.full_name || artist.username}</h3>
              <p className="text-sm text-muted-foreground mb-4">{artist.bio || "No bio available"}</p>
              <Button 
                className="w-full"
                onClick={() => window.location.href = `/profile/${artist.id}`}
              >
                View Profile
              </Button>
            </div>
          </div>
        ))}

        {artists.length === 0 && (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-semibold mb-2 text-foreground">No artists found in {cityName}</h3>
            <p className="text-muted-foreground">Be the first artist to represent this city!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityArtists;
