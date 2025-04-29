
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Upload } from "lucide-react";
import { US_STATES, MAJOR_US_CITIES } from "@/lib/constants";

export function ProfileEditDialog({ isOpen, onClose, userId, currentProfile, onProfileUpdate }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: currentProfile?.full_name || "",
    username: currentProfile?.username || "",
    bio: currentProfile?.bio || "",
    city: currentProfile?.city || "",
    state: currentProfile?.state || "",
    country: "United States",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [backgroundFile, setBackgroundFile] = useState(null);
  const { toast } = useToast();

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file",
      });
      return;
    }

    if (type === 'avatar') {
      setAvatarFile(file);
    } else {
      setBackgroundFile(file);
    }
  };

  const uploadFile = async (file, bucket) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error(`Error uploading to ${bucket}:`, error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let updates = { 
        ...formData,
        role: 'artist',
        updated_at: new Date().toISOString()
      };

      if (avatarFile) {
        const avatarUrl = await uploadFile(avatarFile, 'avatars');
        updates.avatar_url = avatarUrl;
      }

      if (backgroundFile) {
        const backgroundUrl = await uploadFile(backgroundFile, 'backgrounds');
        updates.background_url = backgroundUrl;
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Profile updated successfully",
      });

      onProfileUpdate({ ...currentProfile, ...updates });
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter your full name"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Choose a username"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Select
              value={formData.city}
              onValueChange={(value) => setFormData({ ...formData, city: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent>
                {MAJOR_US_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select
              value={formData.state}
              onValueChange={(value) => setFormData({ ...formData, state: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Profile Picture</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'avatar')}
                disabled={loading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('avatar').click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {avatarFile ? avatarFile.name : "Select Profile Picture"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">Background Image</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="background"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'background')}
                disabled={loading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('background').click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {backgroundFile ? backgroundFile.name : "Select Background Image"}
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
