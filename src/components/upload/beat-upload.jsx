
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import WaveSurfer from "wavesurfer.js";

export function BeatUpload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  const addWatermark = async (audioBuffer) => {
    // Simple audio watermarking by adding a low-frequency sine wave
    const sampleRate = audioBuffer.sampleRate;
    const watermarkFreq = 20; // 20Hz watermark
    const watermarkAmplitude = 0.1;
    
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        const watermark = watermarkAmplitude * 
          Math.sin(2 * Math.PI * watermarkFreq * i / sampleRate);
        channelData[i] = channelData[i] + watermark;
      }
    }
    
    return audioBuffer;
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("audio/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an audio file",
      });
      return;
    }

    setFile(selectedFile);

    // Initialize WaveSurfer
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "violet",
      progressColor: "purple",
      cursorColor: "navy",
      height: 80,
    });

    wavesurfer.current.loadBlob(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    try {
      setIsUploading(true);

      // Add watermark
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const watermarkedBuffer = await addWatermark(audioBuffer);

      // Convert back to file
      const watermarkedBlob = new Blob([watermarkedBuffer], { type: file.type });
      const watermarkedFile = new File([watermarkedBlob], file.name, { type: file.type });

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("beats")
        .upload(fileName, watermarkedFile);

      if (uploadError) throw uploadError;

      // Create track record in database
      const { data: trackData, error: trackError } = await supabase
        .from("tracks")
        .insert({
          title,
          audio_url: uploadData.path,
          user_id: user.id,
          is_public: true,
        })
        .select()
        .single();

      if (trackError) throw trackError;

      // Add tags
      if (tags) {
        const tagArray = tags.split(",").map(tag => tag.trim());
        const tagPromises = tagArray.map(tag =>
          supabase
            .from("track_tags")
            .insert({
              track_id: trackData.id,
              tag,
            })
        );
        await Promise.all(tagPromises);
      }

      toast({
        title: "Success!",
        description: "Your beat has been uploaded",
      });

      setFile(null);
      setTitle("");
      setTags("");
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="hip-hop, trap, dark"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Audio File</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="file"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("file").click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Select File
          </Button>
          {file && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {file && <p className="text-sm text-muted-foreground">{file.name}</p>}
      </div>

      {file && <div ref={waveformRef} className="w-full" />}

      <Button type="submit" disabled={!file || !title || isUploading}>
        {isUploading ? "Uploading..." : "Upload Beat"}
      </Button>
    </form>
  );
}
