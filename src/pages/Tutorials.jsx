
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { TutorialUploadDialog } from "@/components/tutorial/tutorial-upload-dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Video, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Clock, 
  Tag,
  Search,
  Plus
} from "lucide-react";

const Tutorials = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [tutorials, setTutorials] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const categories = [
    "All",
    "Beat Making",
    "Mixing",
    "Sound Design",
    "Music Theory",
    "Vocal Recording"
  ];

  useEffect(() => {
    fetchTutorials();
  }, [selectedCategory]);

  const fetchTutorials = async () => {
    try {
      let query = supabase
        .from('tutorials')
        .select(`
          *,
          creator:users!tutorials_user_id_fkey (username)
        `);
      
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory.toLowerCase());
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log("Fetched tutorials:", data);
      setTutorials(data);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tutorials",
      });
    }
  };

  const handleUploadSuccess = () => {
    fetchTutorials();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Music Tutorials</h1>
          <p className="text-muted-foreground">Learn from the community</p>
        </div>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tutorials..."
              className="pl-10 h-10 w-[250px] rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          {user && (
            <Button className="flex items-center" onClick={() => setIsUploadOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Tutorial
            </Button>
          )}
        </div>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category.toLowerCase() ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.toLowerCase())}
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((tutorial, i) => (
          <motion.div
            key={tutorial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-lg border bg-card overflow-hidden cursor-pointer"
            onClick={() => navigate(`/tutorials/${tutorial.id}`)}
          >
            <div className="relative aspect-video">
              {tutorial.thumbnail_url ? (
                <img 
                  src={tutorial.thumbnail_url}
                  className="w-full h-full object-cover"
                  alt={tutorial.title}
                />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <Video className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-sm font-medium backdrop-blur-sm">
                {Math.floor(tutorial.duration / 60)}:{String(tutorial.duration % 60).padStart(2, '0')}
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold line-clamp-2">{tutorial.title}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <img className="w-8 h-8 rounded-full" alt="Creator avatar" src="https://images.unsplash.com/photo-1633933769681-dc8d28bdeb6d" />
                  <span className="text-sm text-muted-foreground">{tutorial.creator?.username}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <ThumbsUp className="mr-1 h-4 w-4" />
                    <span>{tutorial.likes_count || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    <span>{tutorial.comments_count || 0}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{new Date(tutorial.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-2">
                  <span className="text-xs bg-secondary px-2 py-1 rounded-full">{tutorial.category}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Comment
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <TutorialUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default Tutorials;
