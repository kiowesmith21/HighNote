
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, Video } from "lucide-react";

export function TutorialUploadDialog({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("beat making");
  const { user } = useAuth();
  const { toast } = useToast();

  const categories = [
    "beat making",
    "mixing",
    "sound design",
    "music theory",
    "vocal recording"
  ];

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'video' && !file.type.startsWith('video/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a video file",
      });
      return;
    }

    if (type === 'thumbnail' && !file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file",
      });
      return;
    }

    if (type === 'video') {
      setVideoFile(file);
    } else {
      setThumbnailFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile || !title || !category) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload video file
      const videoFileName = `${Date.now()}-${videoFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { error: videoError } = await supabase.storage
        .from('tutorial_videos')
        .upload(videoFileName, videoFile);

      if (videoError) {
        throw new Error(`Video upload failed: ${videoError.message}`);
      }

      // Get video URL
      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('tutorial_videos')
        .getPublicUrl(videoFileName);

      // Upload thumbnail if provided
      let thumbnailUrl = null;
      let thumbnailFileName = null;
      
      if (thumbnailFile) {
        thumbnailFileName = `${Date.now()}-${thumbnailFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const { error: thumbnailError } = await supabase.storage
          .from('tutorial_thumbnails')
          .upload(thumbnailFileName, thumbnailFile);

        if (thumbnailError) {
          // Clean up video if thumbnail upload fails
          await supabase.storage
            .from('tutorial_videos')
            .remove([videoFileName]);
          throw new Error(`Thumbnail upload failed: ${thumbnailError.message}`);
        }

        const { data: { publicUrl: thumbUrl } } = supabase.storage
          .from('tutorial_thumbnails')
          .getPublicUrl(thumbnailFileName);
        
        thumbnailUrl = thumbUrl;
      }

      // Create tutorial record
      const { error: tutorialError } = await supabase
        .from('tutorials')
        .insert({
          title,
          description,
          category,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          user_id: user.id,
          duration: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (tutorialError) {
        // Clean up uploaded files if database insert fails
        await supabase.storage
          .from('tutorial_videos')
          .remove([videoFileName]);
        
        if (thumbnailFileName) {
          await supabase.storage
            .from('tutorial_thumbnails')
            .remove([thumbnailFileName]);
        }
        throw new Error(`Database insert failed: ${tutorialError.message}`);
      }

      toast({
        title: "Success!",
        description: "Tutorial uploaded successfully",
      });

      // Reset form
      setVideoFile(null);
      setThumbnailFile(null);
      setTitle("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Tutorial</DialogTitle>
          <DialogDescription>
            Share your knowledge with the community
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter tutorial title"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your tutorial"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={loading}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video">Video File</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'video')}
                disabled={loading}
                className="hidden"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('video').click()}
                className="w-full"
                disabled={loading}
              >
                <Video className="mr-2 h-4 w-4" />
                {videoFile ? videoFile.name : "Select Video"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail (Optional)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'thumbnail')}
                disabled={loading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('thumbnail').click()}
                className="w-full"
                disabled={loading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {thumbnailFile ? thumbnailFile.name : "Select Thumbnail"}
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !videoFile || !title}>
              {loading ? "Uploading..." : "Upload Tutorial"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
