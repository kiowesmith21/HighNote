
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Music, Upload } from "lucide-react";

export function TrackUploadDialog({ isOpen, onClose, userId, onTrackUploaded }) {
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    is_public: true,
  });
  const { toast } = useToast();

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'audio' && !file.type.startsWith('audio/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an audio file",
      });
      return;
    }

    if (type === 'cover' && !file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file",
      });
      return;
    }

    if (type === 'audio') {
      setAudioFile(file);
    } else {
      setCoverFile(file);
    }
  };

  const uploadFile = async (file, bucket) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile || !formData.title) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload audio file
      const audioUrl = await uploadFile(audioFile, 'tracks');
      
      // Upload cover if provided
      let coverUrl = null;
      if (coverFile) {
        coverUrl = await uploadFile(coverFile, 'covers');
      }

      // Create track record
      const { error: trackError } = await supabase
        .from('tracks')
        .insert({
          title: formData.title,
          description: formData.description,
          audio_url: audioUrl,
          cover_url: coverUrl,
          user_id: userId,
          is_public: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (trackError) throw trackError;

      toast({
        title: "Success!",
        description: "Track uploaded successfully",
      });

      // Reset form and close dialog
      setFormData({ title: "", description: "", is_public: true });
      setAudioFile(null);
      setCoverFile(null);
      onTrackUploaded?.();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload track",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Track</DialogTitle>
          <DialogDescription>
            Share your music with the world
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Track Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter track title"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your track"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio">Audio File</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileChange(e, 'audio')}
                disabled={loading}
                required
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('audio').click()}
                className="w-full"
              >
                <Music className="mr-2 h-4 w-4" />
                {audioFile ? audioFile.name : "Select Audio File"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image (Optional)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'cover')}
                disabled={loading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('cover').click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {coverFile ? coverFile.name : "Select Cover Image"}
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Uploading..." : "Upload Track"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
