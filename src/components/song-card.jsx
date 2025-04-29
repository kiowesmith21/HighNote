
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Music, Play, Pause, Hash } from "lucide-react";
import AudioPlayer from "@/components/audio/audio-player";
import { supabase } from "@/lib/supabase";

const SongCard = ({ id, title, date, tags = [], backgroundImage, audioUrl, playsCount, likesCount }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localPlaysCount, setLocalPlaysCount] = useState(playsCount);

  const handlePlay = async () => {
    try {
      // Increment plays count in the database
      const { error } = await supabase
        .from('tracks')
        .update({ plays_count: (localPlaysCount || 0) + 1 })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setLocalPlaysCount((prev) => (prev || 0) + 1);
    } catch (error) {
      console.error('Error updating plays count:', error);
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4 rounded-lg border bg-card relative overflow-hidden group">
      {backgroundImage && (
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <img src={backgroundImage} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      
      <div className="flex items-center space-x-4 relative">
        <Music className="h-8 w-8" />
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Released: {date}</span>
            <span>• {localPlaysCount || 0} plays</span>
            <span>• {likesCount || 0} likes</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="relative"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="pt-2">
          <AudioPlayer url={audioUrl} onPlay={handlePlay} />
          
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary"
              >
                <Hash className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SongCard;
