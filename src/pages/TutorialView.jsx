
import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Share2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TutorialView = () => {
  const { id } = useParams();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTutorial();
  }, [id]);

  const fetchTutorial = async () => {
    try {
      const { data, error } = await supabase
        .from('tutorials')
        .select(`
          *,
          creator:users!tutorials_user_id_fkey (username, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setTutorial(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tutorial",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;
  }

  if (!tutorial) {
    return <div className="text-center">Tutorial not found</div>;
  }

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate('/tutorials')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tutorials
      </Button>

      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
        <ReactPlayer
          url={tutorial.video_url}
          width="100%"
          height="100%"
          controls
          playing
        />
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{tutorial.title}</h1>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={tutorial.creator.avatar_url || "https://github.com/shadcn.png"}
              alt={tutorial.creator.username}
              className="h-10 w-10 rounded-full"
            />
            <span className="font-medium">{tutorial.creator.username}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <ThumbsUp className="mr-2 h-4 w-4" />
              {tutorial.likes_count || 0}
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              {tutorial.comments_count || 0}
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-muted-foreground">{tutorial.description || "No description provided."}</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Category:</span>
          <span className="text-xs bg-secondary px-2 py-1 rounded-full">
            {tutorial.category.charAt(0).toUpperCase() + tutorial.category.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TutorialView;
