
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Music, Mic } from "lucide-react";

export function ContestCreateDialog({ isOpen, onClose, onContestCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "beat_battle",
    prize_amount: 0,
    starts_at: "",
    ends_at: "",
    rules: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Set the time to start of day for starts_at and end of day for ends_at
      const startsAtDate = new Date(formData.starts_at);
      startsAtDate.setHours(0, 0, 0, 0);

      const endsAtDate = new Date(formData.ends_at);
      endsAtDate.setHours(23, 59, 59, 999);

      const contestData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        prize_amount: parseFloat(formData.prize_amount),
        starts_at: startsAtDate.toISOString(),
        ends_at: endsAtDate.toISOString(),
        rules: formData.rules,
        creator_id: user.id,
        status: 'active',
        participants_count: 0
      };

      const { data, error } = await supabase
        .from('contests')
        .insert(contestData)
        .select('*, creator:users!contests_creator_id_fkey(username)')
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Contest created successfully.",
      });

      onContestCreated(data);
      onClose();
    } catch (error) {
      console.error('Contest creation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create contest",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Contest</DialogTitle>
          <DialogDescription>
            Set up your music contest details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Contest Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={formData.type === "beat_battle" ? "default" : "outline"}
                className="w-full"
                onClick={() => setFormData({ ...formData, type: "beat_battle" })}
              >
                <Music className="mr-2 h-4 w-4" />
                Beat Battle
              </Button>
              <Button
                type="button"
                variant={formData.type === "open_verse" ? "default" : "outline"}
                className="w-full"
                onClick={() => setFormData({ ...formData, type: "open_verse" })}
              >
                <Mic className="mr-2 h-4 w-4" />
                Open Verse
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter contest title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your contest"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prize_amount">Prize Amount ($)</Label>
            <Input
              id="prize_amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.prize_amount}
              onChange={(e) => setFormData({ ...formData, prize_amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Start Date</Label>
              <Input
                id="starts_at"
                type="date"
                value={formData.starts_at}
                onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends_at">End Date</Label>
              <Input
                id="ends_at"
                type="date"
                value={formData.ends_at}
                onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rules">Rules</Label>
            <Input
              id="rules"
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              placeholder="Contest rules and guidelines"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Contest"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
